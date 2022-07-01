import API, { GraphQLResult, GRAPHQL_AUTH_MODE } from '@aws-amplify/api';
import {
	ConsoleLogger as Logger,
	jitteredBackoff,
	NonRetryableError,
	retry,
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
} from '../../types';
import { exhaustiveCheck, USER } from '../../util';
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
	/**
	 *
	 */
	private observer: ZenObservable.Observer<MutationProcessorEvent>;

	/**
	 * Map of pregenerated queries for each model type and operation.
	 */
	private readonly typeQuery = new WeakMap<
		SchemaModel,
		[TransformerMutationType, string, string][]
	>();

	/**
	 * Whether the intended state of the processor is *actively removing items
	 * from the outbox and sending them to AppSync.*
	 *
	 * RELATED SIDE EFFECT:
	 * 1. Upon being set to `false` from `true`, the processor may take some time
	 * time to "settle" as already-active retry loops do not acknowledge this
	 * flag.
	 */
	private processing: boolean = false;

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
		private readonly conflictHandler?: ConflictHandler
	) {
		this.generateQueries();
	}

	/**
	 * Pregenerate graphql queries for each model type and operation.
	 *
	 * TODO: Dive on whether this might be an unnecessary optimization, as it
	 * adds a bit of complexity/cognitive overhead reading the code.
	 */
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

	/**
	 * Really just indicates whether `start()` has been called by checking to
	 * see whether an observer has been assigned.
	 */
	private isReady() {
		return this.observer !== undefined;
	}

	/**
	 * Creates an observable that starts processing outbox mutations **when it
	 * is subscribed to**. "Processing mutations" is the act of sending each
	 * each item from the outbox to the server (AppSync) in successing,
	 * retrying on transient errors, attempting all relevant auth modes as
	 * needed, etc..
	 *
	 * Unsubscribing pauses outbox mutation processing.
	 *
	 * SIDE EFFECT:
	 * 1. Sets isReady to true
	 * 1. On subscribe, `resume()` -- @see this.resume
	 * 1. Overwrites any existing observer upon subscription. If multiple
	 * subscriptions are established, old subscriptions still have the power
	 * to `pause()`, but will no longer be receiving events.
	 *
	 * @returns Observable for which `unsubscribe()` *eventually* pauses
	 * mutation processing.
	 */
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

	/**
	 * Begins processing items from the outbox if processing is enabled
	 * (not paused) and if the invoker has triggered processing through proper
	 * channels (via `start()`). Runs until the outbox is empty or pause() is
	 * called.
	 *
	 * SIDE EFFECT:
	 * 1. Contains several layers of retry that are *NOT* currently affected by
	 * calls to `pause()`.
	 */
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
							operationAuthModes[authModeAttempts]
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
				if (error.message === 'Offline' || error.message === 'RetryMutation') {
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

			const record = result.data[opName];
			let hasMore = false;

			await this.storage.runExclusive(async storage => {
				// using runExclusive to prevent possible race condition
				// when another record gets enqueued between dequeue and peek
				await this.outbox.dequeue(storage, record, operation);
				hasMore = (await this.outbox.peek(storage)) !== undefined;
			});

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

	/**
	 * Attempts to send the mutation to AppSync, retrying indefinitely on
	 * errors that appear transient. Errors that are not transient will be
	 * wrapped in a `NonRetryableError` when thrown to exit the retry loop.
	 *
	 * SIDE EFFECT:
	 * 1. Uses `retry`, which creates hidden timeouts.
	 *
	 * @see retry
	 *
	 * @param namespaceName
	 * @param model
	 * @param operation
	 * @param data
	 * @param condition
	 * @param modelConstructor
	 * @param MutationEvent
	 * @param mutationEvent
	 * @param authMode
	 */
	private async jitteredRetry(
		namespaceName: string,
		model: string,
		operation: TransformerMutationType,
		data: string,
		condition: string,
		modelConstructor: PersistentModelConstructor<PersistentModel>,
		MutationEvent: PersistentModelConstructor<MutationEvent>,
		mutationEvent: MutationEvent,
		authMode: GRAPHQL_AUTH_MODE
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

				const tryWith = { query, variables, authMode, authToken };
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

									const authToken = await getTokenForCustomAuth(
										authMode,
										this.amplifyConfig
									);

									const serverData = <
										GraphQLResult<Record<string, PersistentModel>>
									>await API.graphql({
										query,
										variables: { id: variables.input.id },
										authMode,
										authToken,
									});

									return [serverData, opName, modelDefinition];
								}

								const namespace = this.schema.namespaces[namespaceName];

								// convert retry with to tryWith
								const updatedMutation =
									createMutationInstanceFromModelOperation(
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
									await this.errorHandler({
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
											: null,
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
			safeJitteredBackoff
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
		const { primaryKey } = this.schema.namespaces[namespaceName].keys[model];

		const queriesTuples = this.typeQuery.get(modelDefinition);

		const [, opName, query] = queriesTuples.find(
			([transformerMutationType]) => transformerMutationType === operation
		);

		const { _version, ...parsedData } = <ModelInstanceMetadata>JSON.parse(data);

		// include all the fields that comprise a custom PK if one is specified
		const deleteInput = {};
		if (primaryKey && primaryKey.length) {
			for (const pkField of primaryKey) {
				deleteInput[pkField] = parsedData[pkField];
			}
		} else {
			deleteInput['id'] = parsedData.id;
		}

		const filteredData =
			operation === TransformerMutationType.DELETE
				? <ModelInstanceMetadata>deleteInput // For DELETE mutations, only PK is sent
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

	/**
	 * Sets a flag to indicate processing should pause.
	 *
	 * (Does not *immedidately* stop anything.)
	 */
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
 * Calculates when the next retry should occur, and assumes retries should
 * continue forever (barring an irrecoverable error).
 *
 * Wraps the jittered backoff calculation to retry Network Errors indefinitely.
 * Backs off according to original jittered retry logic until the original retry
 * logic hits its max. After this occurs, if the error is a Network Error, we
 * ignore the attempt count and return MAX_RETRY_DELAY_MS to retry forever until
 * the retry succeeds.
 *
 * @param attempt ignored
 * @param _args ignored
 * @param error tested to see if `.message` is 'Network Error'
 * @returns a number, up to MAX_RETRY_DELAY_MS.
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
