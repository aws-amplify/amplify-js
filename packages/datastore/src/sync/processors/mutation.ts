import API, { GraphQLResult } from '@aws-amplify/api';
import {
	ConsoleLogger as Logger,
	jitteredExponentialRetry,
	NonRetryableError,
} from '@aws-amplify/core';
import Observable, { ZenObservable } from 'zen-observable-ts';
import { MutationEvent } from '../';
import { ModelInstanceCreator } from '../../datastore/datastore';
import { ExclusiveStorage as Storage } from '../../storage/storage';
import {
	ConflictHandler,
	DISCARD,
	ErrorHandler,
	GraphQLCondition,
	InternalSchema,
	isModelFieldType,
	isTargetNameAssociation,
	ModelInstanceMetadata,
	OpType,
	PersistentModel,
	PersistentModelConstructor,
	SchemaModel,
	TypeConstructorMap,
} from '../../types';
import { exhaustiveCheck, USER } from '../../util';
import { MutationEventOutbox } from '../outbox';
import {
	buildGraphQLOperation,
	createMutationInstanceFromModelOperation,
	TransformerMutationType,
} from '../utils';

const MAX_ATTEMPTS = 10;

const logger = new Logger('DataStore');

type MutationProcessorEvent = {
	operation: TransformerMutationType;
	modelDefinition: SchemaModel;
	model: PersistentModel;
	hasMore: boolean;
};

class MutationProcessor {
	private observer: ZenObservable.Observer<MutationProcessorEvent>;
	private readonly typeQuery = new WeakMap<
		SchemaModel,
		[TransformerMutationType, string, string][]
	>();
	private processing: boolean = false;

	constructor(
		private readonly schema: InternalSchema,
		private readonly storage: Storage,
		private readonly userClasses: TypeConstructorMap,
		private readonly outbox: MutationEventOutbox,
		private readonly modelInstanceCreator: ModelInstanceCreator,
		private readonly MutationEvent: PersistentModelConstructor<MutationEvent>,
		private readonly conflictHandler?: ConflictHandler,
		private readonly errorHandler?: ErrorHandler
	) {
		this.generateQueries();
	}

	private generateQueries() {
		Object.values(this.schema.namespaces).forEach(namespace => {
			Object.values(namespace.models)
				.filter(({ syncable }) => syncable)
				.forEach(model => {
					const [createMutation] = buildGraphQLOperation(
						namespace,
						model,
						'CREATE'
					);
					const [updateMutation] = buildGraphQLOperation(
						namespace,
						model,
						'UPDATE'
					);
					const [deleteMutation] = buildGraphQLOperation(
						namespace,
						model,
						'DELETE'
					);

					this.typeQuery.set(model, [
						createMutation,
						updateMutation,
						deleteMutation,
					]);
				});
		});
	}

	private isReady() {
		return this.observer !== undefined;
	}

	public start(): Observable<MutationProcessorEvent> {
		const observable = new Observable<MutationProcessorEvent>(observer => {
			this.observer = observer;

			this.resume();

			return () => {
				this.pause();
			};
		});

		return observable;
	}

	public async resume(): Promise<void> {
		if (this.processing || !this.isReady()) {
			return;
		}

		this.processing = true;
		let head: MutationEvent;
		const namespaceName = USER;

		// start to drain outbox
		while (
			this.processing &&
			(head = await this.outbox.peek(this.storage)) !== undefined
		) {
			const { model, operation, data, condition } = head;
			const modelConstructor = this.userClasses[
				model
			] as PersistentModelConstructor<MutationEvent>;
			let result: GraphQLResult<Record<string, PersistentModel>>;
			let opName: string;
			let modelDefinition: SchemaModel;
			try {
				[result, opName, modelDefinition] = await this.jitteredRetry(
					namespaceName,
					model,
					operation,
					data,
					condition,
					modelConstructor,
					this.MutationEvent,
					head
				);
			} catch (error) {
				if (error.message === 'Offline' || error.message === 'RetryMutation') {
					continue;
				}
			}

			if (result === undefined) {
				logger.debug('done retrying');
				await this.outbox.dequeue(this.storage);
				continue;
			}

			const record = result.data[opName];
			await this.outbox.dequeue(this.storage);

			const hasMore = (await this.outbox.peek(this.storage)) !== undefined;

			this.observer.next({
				operation,
				modelDefinition,
				model: record,
				hasMore,
			});
		}

		// pauses itself
		this.pause();
	}

	private async jitteredRetry(
		namespaceName: string,
		model: string,
		operation: TransformerMutationType,
		data: string,
		condition: string,
		modelConstructor: PersistentModelConstructor<PersistentModel>,
		MutationEvent: PersistentModelConstructor<MutationEvent>,
		mutationEvent: MutationEvent
	): Promise<
		[GraphQLResult<Record<string, PersistentModel>>, string, SchemaModel]
	> {
		return await jitteredExponentialRetry(
			async (
				model: string,
				operation: TransformerMutationType,
				data: string,
				condition: string,
				modelConstructor: PersistentModelConstructor<PersistentModel>,
				MutationEvent: PersistentModelConstructor<MutationEvent>,
				mutationEvent: MutationEvent
			) => {
				const [
					query,
					variables,
					graphQLCondition,
					opName,
					modelDefinition,
				] = this.createQueryVariables(
					namespaceName,
					model,
					operation,
					data,
					condition
				);
				const tryWith = { query, variables };
				let attempt = 0;

				const opType = this.opTypeFromTransformerOperation(operation);

				do {
					try {
						const result = <GraphQLResult<Record<string, PersistentModel>>>(
							await API.graphql(tryWith)
						);
						return [result, opName, modelDefinition];
					} catch (err) {
						if (err.errors && err.errors.length > 0) {
							const [error] = err.errors;
							if (error.message === 'Network Error') {
								if (!this.processing) {
									throw new NonRetryableError('Offline');
								}
								// TODO: Check errors on different env (react-native or other browsers)
								throw new Error('Network Error');
							}

							// TODO: add on ConflictConditionalCheck error query last from server
							if (error.errorType === 'ConflictUnhandled') {
								attempt++;
								let retryWith: PersistentModel | typeof DISCARD;

								if (attempt > MAX_ATTEMPTS) {
									retryWith = DISCARD;
								} else {
									try {
										retryWith = await this.conflictHandler({
											modelConstructor,
											localModel: this.modelInstanceCreator(
												modelConstructor,
												variables.input
											),
											remoteModel: this.modelInstanceCreator(
												modelConstructor,
												error.data
											),
											operation: opType,
											attempts: attempt,
										});
									} catch (err) {
										logger.warn('conflict trycatch', err);
										continue;
									}
								}

								if (retryWith === DISCARD) {
									// Query latest from server and notify merger

									const [[, opName, query]] = buildGraphQLOperation(
										this.schema.namespaces[namespaceName],
										modelDefinition,
										'GET'
									);

									const serverData = <
										GraphQLResult<Record<string, PersistentModel>>
									>await API.graphql({
										query,
										variables: { id: variables.input.id },
									});

									return [serverData, opName, modelDefinition];
								}

								const namespace = this.schema.namespaces[namespaceName];

								// convert retry with to tryWith
								const updatedMutation = createMutationInstanceFromModelOperation(
									namespace.relationships,
									modelDefinition,
									opType,
									modelConstructor,
									retryWith,
									graphQLCondition,
									MutationEvent,
									this.modelInstanceCreator,
									mutationEvent.id
								);

								await this.storage.save(updatedMutation);

								throw new NonRetryableError('RetryMutation');
							} else {
								try {
									this.errorHandler({
										localModel: this.modelInstanceCreator(
											modelConstructor,
											variables.input
										),
										message: error.message,
										operation,
										errorType: error.errorType,
										errorInfo: error.errorInfo,
										remoteModel: error.data
											? this.modelInstanceCreator(modelConstructor, error.data)
											: null,
									});
								} catch (err) {
									logger.warn('failed to execute errorHandler', err);
								} finally {
									// Return empty tuple, dequeues the mutation
									return error.data
										? [
												{ data: { [opName]: error.data } },
												opName,
												modelDefinition,
										  ]
										: [];
								}
							}
						}
					}
				} while (tryWith);
			},
			[
				model,
				operation,
				data,
				condition,
				modelConstructor,
				MutationEvent,
				mutationEvent,
			]
		);
	}

	private createQueryVariables(
		namespaceName: string,
		model: string,
		operation: TransformerMutationType,
		data: string,
		condition: string
	): [string, Record<string, any>, GraphQLCondition, string, SchemaModel] {
		const modelDefinition = this.schema.namespaces[namespaceName].models[model];

		const queriesTuples = this.typeQuery.get(modelDefinition);

		const [, opName, query] = queriesTuples.find(
			([transformerMutationType]) => transformerMutationType === operation
		);

		const { _version, ...parsedData } = <ModelInstanceMetadata>JSON.parse(data);

		const filteredData =
			operation === TransformerMutationType.DELETE
				? <ModelInstanceMetadata>{ id: parsedData.id } // For DELETE mutations, only ID is sent
				: Object.values(modelDefinition.fields)
						.filter(({ name, type, association }) => {
							// connections
							if (isModelFieldType(type)) {
								// BELONGS_TO
								if (
									isTargetNameAssociation(association) &&
									association.connectionType === 'BELONGS_TO'
								) {
									return true;
								}

								// All other connections
								return false;
							}

							if (operation === TransformerMutationType.UPDATE) {
								// this limits the update mutation input to changed fields only
								return parsedData.hasOwnProperty(name);
							}

							// scalars and non-model types
							return true;
						})
						.map(({ name, type, association }) => {
							let fieldName = name;
							let val = parsedData[name];

							if (
								isModelFieldType(type) &&
								isTargetNameAssociation(association)
							) {
								fieldName = association.targetName;
								val = parsedData[fieldName];
							}

							return [fieldName, val];
						})
						.reduce((acc, [k, v]) => {
							acc[k] = v;
							return acc;
						}, <typeof parsedData>{});

		// Build mutation variables input object
		const input: ModelInstanceMetadata = {
			...filteredData,
			_version,
		};

		const graphQLCondition = <GraphQLCondition>JSON.parse(condition);

		const variables = {
			input,
			...(operation === TransformerMutationType.CREATE
				? {}
				: {
						condition:
							Object.keys(graphQLCondition).length > 0
								? graphQLCondition
								: null,
				  }),
		};
		return [query, variables, graphQLCondition, opName, modelDefinition];
	}

	private opTypeFromTransformerOperation(
		operation: TransformerMutationType
	): OpType {
		switch (operation) {
			case TransformerMutationType.CREATE:
				return OpType.INSERT;
			case TransformerMutationType.DELETE:
				return OpType.DELETE;
			case TransformerMutationType.UPDATE:
				return OpType.UPDATE;
			case TransformerMutationType.GET: // Intentionally blank
				break;
			default:
				exhaustiveCheck(operation);
		}
	}

	public pause() {
		this.processing = false;
	}
}

export { MutationProcessor };
