import API, { GraphQLResult, GRAPHQL_AUTH_MODE } from '@aws-amplify/api';
import {
	ConsoleLogger as Logger,
	jitteredBackoff,
	NonRetryableError,
	retry,
	BackgroundProcessManager,
} from '@aws-amplify/core';
import Observable, { ZenObservable } from 'zen-observable-ts';
import { MutationEvent } from '../';
import { ModelInstanceCreator } from '../../datastore/datastore';
import { ExclusiveStorage as Storage } from '../../storage/storage';
import {
	AuthModeStrategy,
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
	ProcessName,
	AmplifyContext,
} from '../../types';
import {
	exhaustiveCheck,
	extractTargetNamesFromSrc,
	USER,
	USER_AGENT_SUFFIX_DATASTORE,
} from '../../util';
import { MutationEventOutbox } from '../outbox';
import {
	buildGraphQLOperation,
	createMutationInstanceFromModelOperation,
	getModelAuthModes,
	TransformerMutationType,
	getTokenForCustomAuth,
} from '../utils';
import { getMutationErrorType } from './errorMaps';

const MAX_ATTEMPTS = 10;

const logger = new Logger('DataStore');

type MutationProcessorEvent = {
	operation: TransformerMutationType;
	modelDefinition: SchemaModel;
	model: PersistentModel;
	hasMore: boolean;
};

class MutationProcessor {
	private observer!: ZenObservable.Observer<MutationProcessorEvent>;
	private readonly typeQuery = new WeakMap<
		SchemaModel,
		[TransformerMutationType, string, string][]
	>();
	private processing: boolean = false;

	private runningProcesses = new BackgroundProcessManager();

	constructor(
		private readonly schema: InternalSchema,
		private readonly storage: Storage,
		private readonly userClasses: TypeConstructorMap,
		private readonly outbox: MutationEventOutbox,
		private readonly modelInstanceCreator: ModelInstanceCreator,
		private readonly MutationEvent: PersistentModelConstructor<MutationEvent>,
		private readonly amplifyConfig: Record<string, any> = {},
		private readonly authModeStrategy: AuthModeStrategy,
		private readonly errorHandler: ErrorHandler,
		private readonly conflictHandler: ConflictHandler,
		private readonly amplifyContext: AmplifyContext
	) {
		this.amplifyContext.API = this.amplifyContext.API || API;
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
		this.runningProcesses = new BackgroundProcessManager();

		const observable = new Observable<MutationProcessorEvent>(observer => {
			this.observer = observer;

			try {
				this.resume();
			} catch (error) {
				logger.error('mutations processor start error', error);
				throw error;
			}

			return this.runningProcesses.addCleaner(async () => {
				this.pause();
			});
		});

		return observable;
	}

	public async stop() {
		await this.runningProcesses.close();
	}

	public async resume(): Promise<void> {
		if (this.runningProcesses.isOpen) return;
		return this.runningProcesses.add(async onTerminate => {
			if (this.processing || !this.isReady() || !this.runningProcesses.isOpen) {
				return;
			}

			this.processing = true;
			let head: MutationEvent;
			const namespaceName = USER;

			// start to drain outbox
			while (
				this.processing &&
				this.runningProcesses.isOpen &&
				(head = await this.outbox.peek(this.storage)) !== undefined
			) {
				const { model, operation, data, condition } = head;
				const modelConstructor = this.userClasses[
					model
				] as PersistentModelConstructor<MutationEvent>;
				let result: GraphQLResult<Record<string, PersistentModel>> = undefined!;
				let opName: string = undefined!;
				let modelDefinition: SchemaModel = undefined!;

				try {
					const modelAuthModes = await getModelAuthModes({
						authModeStrategy: this.authModeStrategy,
						defaultAuthMode: this.amplifyConfig.aws_appsync_authenticationType,
						modelName: model,
						schema: this.schema,
					});

					const operationAuthModes = modelAuthModes[operation.toUpperCase()];

					let authModeAttempts = 0;
					const authModeRetry = async () => {
						try {
							logger.debug(
								`Attempting mutation with authMode: ${operationAuthModes[authModeAttempts]}`
							);
							const response = await this.jitteredRetry(
								namespaceName,
								model,
								operation,
								data,
								condition,
								modelConstructor,
								this.MutationEvent,
								head,
								operationAuthModes[authModeAttempts],
								onTerminate
							);

							logger.debug(
								`Mutation sent successfully with authMode: ${operationAuthModes[authModeAttempts]}`
							);

							return response;
						} catch (error) {
							authModeAttempts++;
							if (authModeAttempts >= operationAuthModes.length) {
								logger.debug(
									`Mutation failed with authMode: ${
										operationAuthModes[authModeAttempts - 1]
									}`
								);
								throw error;
							}
							logger.debug(
								`Mutation failed with authMode: ${
									operationAuthModes[authModeAttempts - 1]
								}. Retrying with authMode: ${
									operationAuthModes[authModeAttempts]
								}`
							);
							return await authModeRetry();
						}
					};

					[result, opName, modelDefinition] = await authModeRetry();
				} catch (error) {
					if (
						error.message === 'Offline' ||
						error.message === 'RetryMutation'
					) {
						continue;
					}
				}

				if (result === undefined) {
					logger.debug('done retrying');
					await this.storage.runExclusive(async storage => {
						await this.outbox.dequeue(storage);
					});
					continue;
				}

				const record = result.data![opName!];
				let hasMore = false;

				await this.storage.runExclusive(async storage => {
					// using runExclusive to prevent possible race condition
					// when another record gets enqueued between dequeue and peek
					await this.outbox.dequeue(storage, record, operation);
					hasMore = (await this.outbox.peek(storage)) !== undefined;
				});

				this.observer.next!({
					operation,
					modelDefinition,
					model: record,
					hasMore,
				});
			}

			// pauses itself
			this.pause();
		}, 'mutation resume loop');
	}

	private async jitteredRetry(
		namespaceName: string,
		model: string,
		operation: TransformerMutationType,
		data: string,
		condition: string,
		modelConstructor: PersistentModelConstructor<any>,
		MutationEvent: PersistentModelConstructor<MutationEvent>,
		mutationEvent: MutationEvent,
		authMode: GRAPHQL_AUTH_MODE,
		onTerminate: Promise<void>
	): Promise<
		[GraphQLResult<Record<string, PersistentModel>>, string, SchemaModel]
	> {
		return await retry(
			async (
				model: string,
				operation: TransformerMutationType,
				data: string,
				condition: string,
				modelConstructor: PersistentModelConstructor<PersistentModel>,
				MutationEvent: PersistentModelConstructor<MutationEvent>,
				mutationEvent: MutationEvent
			) => {
				const [query, variables, graphQLCondition, opName, modelDefinition] =
					this.createQueryVariables(
						namespaceName,
						model,
						operation,
						data,
						condition
					);

				const authToken = await getTokenForCustomAuth(
					authMode,
					this.amplifyConfig
				);

				const tryWith = {
					query,
					variables,
					authMode,
					authToken,
					userAgentSuffix: USER_AGENT_SUFFIX_DATASTORE,
				};
				let attempt = 0;

				const opType = this.opTypeFromTransformerOperation(operation);

				do {
					try {
						const result = <GraphQLResult<Record<string, PersistentModel>>>(
							await this.amplifyContext.API.graphql(tryWith)
						);

						// onTerminate.then(() => {
						// 	// API.cancel()
						// });

						// `as any` because TypeScript doesn't seem to like passing tuples
						// through generic params???
						return [result, opName, modelDefinition] as any;
					} catch (err) {
						if (err.errors && err.errors.length > 0) {
							const [error] = err.errors;
							const { originalError: { code = null } = {} } = error;

							if (error.errorType === 'Unauthorized') {
								throw new NonRetryableError('Unauthorized');
							}

							if (
								error.message === 'Network Error' ||
								code === 'ECONNABORTED' // refers to axios timeout error caused by device's bad network condition
							) {
								if (!this.processing) {
									throw new NonRetryableError('Offline');
								}
								// TODO: Check errors on different env (react-native or other browsers)
								throw new Error('Network Error');
							}

							if (error.errorType === 'ConflictUnhandled') {
								// TODO: add on ConflictConditionalCheck error query last from server
								attempt++;
								let retryWith: PersistentModel | typeof DISCARD;

								if (attempt > MAX_ATTEMPTS) {
									retryWith = DISCARD;
								} else {
									try {
										retryWith = await this.conflictHandler!({
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

									const authToken = await getTokenForCustomAuth(
										authMode,
										this.amplifyConfig
									);

									const serverData = <
										GraphQLResult<Record<string, PersistentModel>>
									>await this.amplifyContext.API.graphql({
										query,
										variables: { id: variables.input.id },
										authMode,
										authToken,
										userAgentSuffix: USER_AGENT_SUFFIX_DATASTORE,
									});

									// onTerminate cancel graphql()

									return [serverData, opName, modelDefinition];
								}

								const namespace = this.schema.namespaces[namespaceName];

								// convert retry with to tryWith
								const updatedMutation =
									createMutationInstanceFromModelOperation(
										namespace.relationships!,
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
										recoverySuggestion:
											'Ensure app code is up to date, auth directives exist and are correct on each model, and that server-side data has not been invalidated by a schema change. If the problem persists, search for or create an issue: https://github.com/aws-amplify/amplify-js/issues',
										localModel: variables.input,
										message: error.message,
										operation,
										errorType: getMutationErrorType(error),
										errorInfo: error.errorInfo,
										process: ProcessName.mutate,
										cause: error,
										remoteModel: error.data
											? this.modelInstanceCreator(modelConstructor, error.data)
											: null!,
									});
								} catch (err) {
									logger.warn('Mutation error handler failed with:', err);
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
						} else {
							// Catch-all for client-side errors that don't come back in the `GraphQLError` format.
							// These errors should not be retried.
							throw new NonRetryableError(err);
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
			],
			safeJitteredBackoff,
			onTerminate
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
		const { primaryKey } = this.schema.namespaces[namespaceName].keys![model];

		const queriesTuples = this.typeQuery.get(modelDefinition);

		const [, opName, query] = queriesTuples!.find(
			([transformerMutationType]) => transformerMutationType === operation
		)!;

		const { _version, ...parsedData } = <ModelInstanceMetadata>JSON.parse(data);

		// include all the fields that comprise a custom PK if one is specified
		const deleteInput = {};
		if (primaryKey?.length) {
			for (const pkField of primaryKey) {
				deleteInput[pkField] = parsedData[pkField];
			}
		} else {
			// CPK TODO:
			// Previous comment from Manuel: what if it was renamed ?
			deleteInput['id'] = (<any>parsedData).id;
		}

		let mutationInput;

		if (operation === TransformerMutationType.DELETE) {
			// For DELETE mutations, only the key(s) are included in the input
			mutationInput = <ModelInstanceMetadata>deleteInput;
		} else {
			// Otherwise, we construct the mutation input with the following logic
			mutationInput = {};
			const modelFields = Object.values(modelDefinition.fields);

			for (const { name, type, association } of modelFields) {
				// model fields should be stripped out from the input
				if (isModelFieldType(type)) {
					// except for belongs to relations - we need to replace them with the correct foreign key(s)
					if (
						isTargetNameAssociation(association) &&
						association.connectionType === 'BELONGS_TO'
					) {
						const targetNames: string[] | undefined =
							extractTargetNamesFromSrc(association);

						if (targetNames) {
							// instead of including the connected model itself, we add its key(s) to the mutation input
							for (const targetName of targetNames) {
								mutationInput[targetName] = parsedData[targetName];
							}
							// if (association?.targetNames?.length) {
							// 	// instead of including the connected model itself, we add its key(s) to the mutation input
							// 	for (const targetName of association.targetNames) {
							// 		mutationInput[targetName] = parsedData[targetName];
							// 	}
							// } else if (association.targetName) {
							// 	// backwards-compatability for schema generated prior to custom primary key support
							// 	mutationInput[association.targetName] =
							// 		parsedData[association.targetName];
							// }
						}
					}
					continue;
				}
				// scalar fields / non-model types

				if (operation === TransformerMutationType.UPDATE) {
					if (!parsedData.hasOwnProperty(name)) {
						// for update mutations - strip out a field if it's unchanged
						continue;
					}
				}

				// all other fields are added to the input object
				mutationInput[name] = parsedData[name];
			}
		}

		// Build mutation variables input object
		const input: ModelInstanceMetadata = {
			...mutationInput,
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
				throw new Error(`Invalid operation ${operation}`);
		}

		// make TS happy ...
		return undefined!;
	}

	public pause() {
		this.processing = false;
	}
}

const MAX_RETRY_DELAY_MS = 5 * 60 * 1000;
const originalJitteredBackoff = jitteredBackoff(MAX_RETRY_DELAY_MS);

/**
 * @private
 * Internal use of Amplify only.
 *
 * Wraps the jittered backoff calculation to retry Network Errors indefinitely.
 * Backs off according to original jittered retry logic until the original retry
 * logic hits its max. After this occurs, if the error is a Network Error, we
 * ignore the attempt count and return MAX_RETRY_DELAY_MS to retry forever (until
 * the request succeeds).
 *
 * @param attempt ignored
 * @param _args ignored
 * @param error tested to see if `.message` is 'Network Error'
 * @returns number | false :
 */
export const safeJitteredBackoff: typeof originalJitteredBackoff = (
	attempt,
	_args,
	error
) => {
	const attemptResult = originalJitteredBackoff(attempt);

	// If this is the last attempt and it is a network error, we retry indefinitively every 5 minutes
	if (attemptResult === false && error?.message === 'Network Error') {
		return MAX_RETRY_DELAY_MS;
	}

	return attemptResult;
};

export { MutationProcessor };
