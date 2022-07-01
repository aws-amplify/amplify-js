import { browserOrNode, ConsoleLogger as Logger } from '@aws-amplify/core';
import { CONTROL_MSG as PUBSUB_CONTROL_MSG } from '@aws-amplify/pubsub';
import Observable, { ZenObservable } from 'zen-observable-ts';
import { ModelInstanceCreator } from '../datastore/datastore';
import { ModelPredicateCreator } from '../predicates';
import { ExclusiveStorage as Storage } from '../storage/storage';
import {
	ConflictHandler,
	ControlMessageType,
	ErrorHandler,
	InternalSchema,
	ModelInit,
	ModelInstanceMetadata,
	MutableModel,
	NamespaceResolver,
	OpType,
	PersistentModel,
	PersistentModelConstructor,
	SchemaModel,
	SchemaNamespace,
	TypeConstructorMap,
	ModelPredicate,
	AuthModeStrategy,
} from '../types';
import { exhaustiveCheck, getNow, SYNC, USER } from '../util';
import DataStoreConnectivity from './datastoreConnectivity';
import { ModelMerger } from './merger';
import { MutationEventOutbox } from './outbox';
import { MutationProcessor } from './processors/mutation';
import { CONTROL_MSG, SubscriptionProcessor } from './processors/subscription';
import { SyncProcessor } from './processors/sync';
import {
	createMutationInstanceFromModelOperation,
	predicateToGraphQLCondition,
	TransformerMutationType,
} from './utils';

const { isNode } = browserOrNode();
const logger = new Logger('DataStore');

const ownSymbol = Symbol('sync');

type StartParams = {
	fullSyncInterval: number;
};

export declare class MutationEvent {
	constructor(init: ModelInit<MutationEvent>);
	static copyOf(
		src: MutationEvent,
		mutator: (draft: MutableModel<MutationEvent>) => void | MutationEvent
	): MutationEvent;
	public readonly id: string;
	public readonly model: string;
	public readonly operation: TransformerMutationType;
	public readonly modelId: string;
	public readonly condition: string;
	public data: string;
}

declare class ModelMetadata {
	constructor(init: ModelInit<ModelMetadata>);
	static copyOf(
		src: ModelMetadata,
		mutator: (draft: MutableModel<ModelMetadata>) => void | ModelMetadata
	): ModelMetadata;
	public readonly id: string;
	public readonly namespace: string;
	public readonly model: string;
	public readonly fullSyncInterval: number;
	public readonly lastSync?: number;
	public readonly lastFullSync?: number;
	public readonly lastSyncPredicate?: null | string;
}

export enum ControlMessage {
	SYNC_ENGINE_STORAGE_SUBSCRIBED = 'storageSubscribed',
	SYNC_ENGINE_SUBSCRIPTIONS_ESTABLISHED = 'subscriptionsEstablished',
	SYNC_ENGINE_SYNC_QUERIES_STARTED = 'syncQueriesStarted',
	SYNC_ENGINE_SYNC_QUERIES_READY = 'syncQueriesReady',
	SYNC_ENGINE_MODEL_SYNCED = 'modelSynced',
	SYNC_ENGINE_OUTBOX_MUTATION_ENQUEUED = 'outboxMutationEnqueued',
	SYNC_ENGINE_OUTBOX_MUTATION_PROCESSED = 'outboxMutationProcessed',
	SYNC_ENGINE_OUTBOX_STATUS = 'outboxStatus',
	SYNC_ENGINE_NETWORK_STATUS = 'networkStatus',
	SYNC_ENGINE_READY = 'ready',
}

/**
 * Engine responsible for bidirectional synchronization between local storage
 * and remote storage (AppSync).
 *
 * Establishes processors responsible for keeping local storage in sync with
 * server storage bidirectionally.
 *
 * In the event of conflicts that the app may be able to resolve, the given
 * `conflictHandler` will be invoked.
 *
 * In the event of an irrecoverable error, the `errorHandler` will be invoked.
 */
export class SyncEngine {
	/**
	 * A flag indicating
	 */
	private online = false;

	/**
	 *
	 */
	private readonly syncQueriesProcessor: SyncProcessor;

	private readonly subscriptionsProcessor: SubscriptionProcessor;

	private readonly mutationsProcessor: MutationProcessor;

	private readonly modelMerger: ModelMerger;
	private readonly outbox: MutationEventOutbox;

	/**
	 *
	 */
	private readonly datastoreConnectivity: DataStoreConnectivity;

	/**
	 * Flag map to indicate whether each model has fully synced from AppSync to
	 * local storage (according to the sync expression).
	 */
	private readonly modelSyncedStatus: WeakMap<
		PersistentModelConstructor<any>,
		boolean
	> = new WeakMap();

	/**
	 * Determines whether a model is "synced", meaning that queries against it
	 * can be trusted to contain all data specified by the sync expressions
	 * that are in effect.
	 *
	 * @param modelConstructor Model type to look up.
	 * @returns `true` if the model is synced.
	 */
	public getModelSyncedStatus(
		modelConstructor: PersistentModelConstructor<any>
	): boolean {
		return this.modelSyncedStatus.get(modelConstructor);
	}

	constructor(
		private readonly schema: InternalSchema,
		private readonly namespaceResolver: NamespaceResolver,
		private readonly modelClasses: TypeConstructorMap,
		private readonly userModelClasses: TypeConstructorMap,

		/**
		 * This is ExclusiveStorage, which should ensure operations occur in
		 * the order they're called. This is managed with a mutex.
		 *
		 * **NOTE:**
		 * This storage must also be observable. The sync engine discovers new
		 * mutations to push to AppSync by subscribing the storage events.
		 */
		private readonly storage: Storage,

		/**
		 * @see ModelInstanceCreator (direct copy)
		 *
		 * Constructs a model and records it with its metadata in a weakset. Allows for the separate storage of core model fields and Amplify/DataStore metadata fields that the customer app does not want exposed.
		 *
		 * @param modelConstructor — The model constructor.
		 * @param init — Init data that would normally be passed to the constructor.
		 * @returns — The initialized model.
		 */
		private readonly modelInstanceCreator: ModelInstanceCreator,

		/**
		 * To be called when a mutation is rejected by AppSync.
		 *
		 * The handler is expected to return a new model to try against AppSync
		 * or the DISCARD symbol, signalling that conflicts should simply defer
		 * AppSync's version as the source of truth.
		 */
		conflictHandler: ConflictHandler,

		/**
		 * To be called for any non-recoverable sync engine error.
		 *
		 * The sync engine is expected to perform its own retries as-needed for
		 * recoverable errors. The error handler should *not* be called for
		 * those intermediate / recoverable / non-final errors.
		 */
		errorHandler: ErrorHandler,

		private readonly syncPredicates: WeakMap<SchemaModel, ModelPredicate<any>>,
		private readonly amplifyConfig: Record<string, any> = {},
		private readonly authModeStrategy: AuthModeStrategy
	) {
		const MutationEvent = this.modelClasses[
			'MutationEvent'
		] as PersistentModelConstructor<any>;

		this.outbox = new MutationEventOutbox(
			this.schema,
			MutationEvent,
			modelInstanceCreator,
			ownSymbol
		);

		this.modelMerger = new ModelMerger(this.outbox, ownSymbol);

		this.syncQueriesProcessor = new SyncProcessor(
			this.schema,
			this.syncPredicates,
			this.amplifyConfig,
			this.authModeStrategy,
			errorHandler
		);
		this.subscriptionsProcessor = new SubscriptionProcessor(
			this.schema,
			this.syncPredicates,
			this.amplifyConfig,
			this.authModeStrategy,
			errorHandler
		);
		this.mutationsProcessor = new MutationProcessor(
			this.schema,
			this.storage,
			this.userModelClasses,
			this.outbox,
			this.modelInstanceCreator,
			MutationEvent,
			this.amplifyConfig,
			this.authModeStrategy,
			errorHandler,
			conflictHandler
		);
		this.datastoreConnectivity = new DataStoreConnectivity();
	}

	/**
	 * Starts synchronization processors in this order:
	 *
	 * **Subscription:**
	 * Watches for changes from the server, saving each record locally as it
	 * arrives. Until the sync processer completes (next step), subscription
	 * messagesb are enqueued.
	 *
	 * **Sync:**
	 * Performs an initial fetch of the records from the server, saving each
	 * record locally.
	 *
	 * **Mutation:**
	 * Sends local mutations to the server.
	 *
	 * SIDE EFFECT:
	 * 1. Creates subscriptions and holds them in a closure; they are
	 * removed by unsubscribing.
	 *
	 * @param params Used for `fullSyncInterval`, indicating how often to
	 * perform a full resync from the server (AppSync).
	 * @returns Observable of control messages. Unsubscribing from this should
	 * unsubscribe/disconnect from all downstream subscriptions.
	 */
	start(params: StartParams) {
		return new Observable<ControlMessageType<ControlMessage>>(observer => {
			logger.log('starting sync engine...');

			/**
			 * Collection of all subscriptions created by starting the sync
			 * engine for easy cleanup later.
			 */
			let subscriptions: ZenObservable.Subscription[] = [];

			(async () => {
				try {
					await this.setupModels(params);
				} catch (err) {
					observer.error(err);
					return;
				}

				/**
				 * Promise resolves when AppSync connection reports that it
				 * is CONNECTED.
				 *
				 * If the connection fails, the promise fails.
				 *
				 * This can be used to block processes that only make sense to
				 * start once a functional AppSync connection is confirmed.
				 */
				const startPromise = new Promise(resolve => {
					this.datastoreConnectivity.status().subscribe(async ({ online }) => {
						// From offline to online
						if (online && !this.online) {
							this.online = online;

							observer.next({
								type: ControlMessage.SYNC_ENGINE_NETWORK_STATUS,
								data: {
									active: this.online,
								},
							});

							/**
							 * Connection control messages from the AppSync connection.
							 */
							let ctlSubsObservable: Observable<CONTROL_MSG>;

							/**
							 * The stream of app data (USER space data) from AppSync.
							 */
							let dataSubsObservable: Observable<
								[TransformerMutationType, SchemaModel, PersistentModel]
							>;

							if (isNode) {
								logger.warn(
									'Realtime disabled when in a server-side environment'
								);
							} else {
								//#region GraphQL Subscriptions
								[
									// const ctlObservable: Observable<CONTROL_MSG>
									ctlSubsObservable,
									// const dataObservable: Observable<[TransformerMutationType, SchemaModel, Readonly<{
									// id: string;
									// } & Record<string, any>>]>
									dataSubsObservable,
								] = this.subscriptionsProcessor.start();

								try {
									await new Promise((resolve, reject) => {
										const ctlSubsSubscription = ctlSubsObservable.subscribe({
											next: msg => {
												if (msg === CONTROL_MSG.CONNECTED) {
													resolve();
												}
											},
											error: err => {
												reject(err);
												const handleDisconnect = this.disconnectionHandler();
												handleDisconnect(err);
											},
										});

										subscriptions.push(ctlSubsSubscription);
									});
								} catch (err) {
									observer.error(err);
									return;
								}

								logger.log('Realtime ready');

								observer.next({
									type: ControlMessage.SYNC_ENGINE_SUBSCRIPTIONS_ESTABLISHED,
								});

								//#endregion
							}

							//#region Base & Sync queries
							try {
								await new Promise((resolve, reject) => {
									const syncQuerySubscription =
										this.syncQueriesObservable().subscribe({
											next: message => {
												const { type } = message;

												if (
													type === ControlMessage.SYNC_ENGINE_SYNC_QUERIES_READY
												) {
													resolve();
												}

												observer.next(message);
											},
											complete: () => {
												resolve();
											},
											error: error => {
												reject(error);
											},
										});

									if (syncQuerySubscription) {
										subscriptions.push(syncQuerySubscription);
									}
								});
							} catch (error) {
								observer.error(error);
								return;
							}
							//#endregion

							//#region process mutations (outbox)
							subscriptions.push(
								this.mutationsProcessor
									.start()
									.subscribe(({ modelDefinition, model: item, hasMore }) => {
										const modelConstructor = this.userModelClasses[
											modelDefinition.name
										] as PersistentModelConstructor<any>;

										const model = this.modelInstanceCreator(
											modelConstructor,
											item
										);

										this.storage.runExclusive(storage =>
											this.modelMerger.merge(storage, model)
										);

										observer.next({
											type: ControlMessage.SYNC_ENGINE_OUTBOX_MUTATION_PROCESSED,
											data: {
												model: modelConstructor,
												element: model,
											},
										});

										observer.next({
											type: ControlMessage.SYNC_ENGINE_OUTBOX_STATUS,
											data: {
												isEmpty: !hasMore,
											},
										});
									})
							);
							//#endregion

							//#region Merge subscriptions buffer
							// TODO: extract to function
							if (!isNode) {
								subscriptions.push(
									dataSubsObservable.subscribe(
										([_transformerMutationType, modelDefinition, item]) => {
											const modelConstructor = this.userModelClasses[
												modelDefinition.name
											] as PersistentModelConstructor<any>;

											const model = this.modelInstanceCreator(
												modelConstructor,
												item
											);

											this.storage.runExclusive(storage =>
												this.modelMerger.merge(storage, model)
											);
										}
									)
								);
							}
							//#endregion
						} else if (!online) {
							this.online = online;

							observer.next({
								type: ControlMessage.SYNC_ENGINE_NETWORK_STATUS,
								data: {
									active: this.online,
								},
							});

							subscriptions.forEach(sub => sub.unsubscribe());
							subscriptions = [];
						}

						resolve();
					});
				});

				this.storage
					.observe(null, null, ownSymbol)
					.filter(({ model }) => {
						const modelDefinition = this.getModelDefinition(model);

						return modelDefinition.syncable === true;
					})
					.subscribe({
						next: async ({ opType, model, element, condition }) => {
							const namespace =
								this.schema.namespaces[this.namespaceResolver(model)];
							const MutationEventConstructor = this.modelClasses[
								'MutationEvent'
							] as PersistentModelConstructor<MutationEvent>;
							const graphQLCondition = predicateToGraphQLCondition(condition);
							const mutationEvent = createMutationInstanceFromModelOperation(
								namespace.relationships,
								this.getModelDefinition(model),
								opType,
								model,
								element,
								graphQLCondition,
								MutationEventConstructor,
								this.modelInstanceCreator
							);

							await this.outbox.enqueue(this.storage, mutationEvent);

							observer.next({
								type: ControlMessage.SYNC_ENGINE_OUTBOX_MUTATION_ENQUEUED,
								data: {
									model,
									element,
								},
							});

							observer.next({
								type: ControlMessage.SYNC_ENGINE_OUTBOX_STATUS,
								data: {
									isEmpty: false,
								},
							});

							await startPromise;

							// Q: Why is this here?
							if (this.online) {
								this.mutationsProcessor.resume();
							}
						},
					});

				observer.next({
					type: ControlMessage.SYNC_ENGINE_STORAGE_SUBSCRIBED,
				});

				const hasMutationsInOutbox =
					(await this.outbox.peek(this.storage)) === undefined;
				observer.next({
					type: ControlMessage.SYNC_ENGINE_OUTBOX_STATUS,
					data: {
						isEmpty: hasMutationsInOutbox,
					},
				});

				await startPromise;

				observer.next({
					type: ControlMessage.SYNC_ENGINE_READY,
				});
			})();

			return () => {
				subscriptions.forEach(sub => sub.unsubscribe());
			};
		});
	}

	/**
	 * Get a mapping of all known syncable models to a tuple of their
	 * namespace and what to sync from. Determines if a full sync is needed
	 * based on last full sync time.
	 *
	 * @param currentTimeStamp The last sync time as indicated by the server
	 * during the last sync.
	 * @returns The map of models to their namespace and a time to sync from,
	 * where that time is '0' if a full sync is needed.
	 */
	private async getModelsMetadataWithNextFullSync(
		currentTimeStamp: number
	): Promise<Map<SchemaModel, [string, number]>> {
		const modelLastSync: Map<SchemaModel, [string, number]> = new Map(
			(await this.getModelsMetadata()).map(
				({
					namespace,
					model,
					lastSync,
					lastFullSync,
					fullSyncInterval,
					lastSyncPredicate,
				}) => {
					const nextFullSync = lastFullSync + fullSyncInterval;
					const syncFrom =
						!lastFullSync || nextFullSync < currentTimeStamp
							? 0 // perform full sync if expired
							: lastSync; // perform delta sync

					return [
						this.schema.namespaces[namespace].models[model],
						[namespace, syncFrom],
					];
				}
			)
		);

		return modelLastSync;
	}

	private syncQueriesObservable(): Observable<
		ControlMessageType<ControlMessage>
	> {
		// if not online ... wait. what? what is this doing?
		if (!this.online) {
			return Observable.of<ControlMessageType<ControlMessage>>();
		}

		return new Observable<ControlMessageType<ControlMessage>>(observer => {
			let syncQueriesSubscription: ZenObservable.Subscription;
			let waitTimeoutId: ReturnType<typeof setTimeout>;

			(async () => {
				while (!observer.closed) {
					const count: WeakMap<
						PersistentModelConstructor<any>,
						{
							new: number;
							updated: number;
							deleted: number;
						}
					> = new WeakMap();

					const modelLastSync = await this.getModelsMetadataWithNextFullSync(
						Date.now()
					);
					const paginatingModels = new Set(modelLastSync.keys());

					let newestFullSyncStartedAt: number;
					let theInterval: number;

					let start: number;
					let duration: number;
					let newestStartedAt: number;
					await new Promise(resolve => {
						syncQueriesSubscription = this.syncQueriesProcessor
							.start(modelLastSync)
							.subscribe({
								next: async ({
									namespace,
									modelDefinition,
									items,
									done,
									startedAt,
									isFullSync,
								}) => {
									const modelConstructor = this.userModelClasses[
										modelDefinition.name
									] as PersistentModelConstructor<any>;

									if (!count.has(modelConstructor)) {
										count.set(modelConstructor, {
											new: 0,
											updated: 0,
											deleted: 0,
										});

										start = getNow();
										newestStartedAt =
											newestStartedAt === undefined
												? startedAt
												: Math.max(newestStartedAt, startedAt);
									}

									/**
									 * If there are mutations in the outbox for a given id, those need to be
									 * merged individually. Otherwise, we can merge them in batches.
									 */
									await this.storage.runExclusive(async storage => {
										const idsInOutbox = await this.outbox.getModelIds(storage);

										const oneByOne: ModelInstanceMetadata[] = [];
										const page = items.filter(item => {
											if (!idsInOutbox.has(item.id)) {
												return true;
											}

											oneByOne.push(item);
											return false;
										});

										const opTypeCount: [any, OpType][] = [];

										for (const item of oneByOne) {
											const opType = await this.modelMerger.merge(
												storage,
												item
											);

											if (opType !== undefined) {
												opTypeCount.push([item, opType]);
											}
										}

										opTypeCount.push(
											...(await this.modelMerger.mergePage(
												storage,
												modelConstructor,
												page
											))
										);

										const counts = count.get(modelConstructor);

										opTypeCount.forEach(([, opType]) => {
											switch (opType) {
												case OpType.INSERT:
													counts.new++;
													break;
												case OpType.UPDATE:
													counts.updated++;
													break;
												case OpType.DELETE:
													counts.deleted++;
													break;
												default:
													exhaustiveCheck(opType);
											}
										});
									});

									if (done) {
										const { name: modelName } = modelDefinition;

										//#region update last sync for type
										let modelMetadata = await this.getModelMetadata(
											namespace,
											modelName
										);

										const { lastFullSync, fullSyncInterval } = modelMetadata;

										theInterval = fullSyncInterval;

										newestFullSyncStartedAt =
											newestFullSyncStartedAt === undefined
												? lastFullSync
												: Math.max(
														newestFullSyncStartedAt,
														isFullSync ? startedAt : lastFullSync
												  );

										modelMetadata = (
											this.modelClasses
												.ModelMetadata as PersistentModelConstructor<any>
										).copyOf(modelMetadata, draft => {
											draft.lastSync = startedAt;
											draft.lastFullSync = isFullSync
												? startedAt
												: modelMetadata.lastFullSync;
										});

										await this.storage.save(
											modelMetadata,
											undefined,
											ownSymbol
										);
										//#endregion

										const counts = count.get(modelConstructor);

										this.modelSyncedStatus.set(modelConstructor, true);

										observer.next({
											type: ControlMessage.SYNC_ENGINE_MODEL_SYNCED,
											data: {
												model: modelConstructor,
												isFullSync,
												isDeltaSync: !isFullSync,
												counts,
											},
										});

										paginatingModels.delete(modelDefinition);

										if (paginatingModels.size === 0) {
											duration = getNow() - start;
											resolve();
											observer.next({
												type: ControlMessage.SYNC_ENGINE_SYNC_QUERIES_READY,
											});
											syncQueriesSubscription.unsubscribe();
										}
									}
								},
								error: error => {
									observer.error(error);
								},
							});

						observer.next({
							type: ControlMessage.SYNC_ENGINE_SYNC_QUERIES_STARTED,
							data: {
								models: Array.from(paginatingModels).map(({ name }) => name),
							},
						});
					});

					const msNextFullSync =
						newestFullSyncStartedAt +
						theInterval -
						(newestStartedAt + duration);

					logger.debug(
						`Next fullSync in ${msNextFullSync / 1000} seconds. (${new Date(
							Date.now() + msNextFullSync
						)})`
					);

					await new Promise(res => {
						waitTimeoutId = setTimeout(res, msNextFullSync);
					});
				}
			})();

			return () => {
				if (syncQueriesSubscription) {
					syncQueriesSubscription.unsubscribe();
				}

				if (waitTimeoutId) {
					clearTimeout(waitTimeoutId);
				}
			};
		});
	}

	/**
	 * Creates a function that checks a control message to see if it indicates
	 * a disconnect or timeout.
	 * If so, it informs the connectivity monitor of the disconnect.
	 *
	 * Intended to be called when subscription processor emits an error.
	 *
	 * SIDE EFFECT: (downstream)
	 * 1. The connectivity monitor will send an `online: false` message to
	 * all subscribers &mdash; which should have the effect of terminating
	 * the sync. (At least temporarily.)
	 */
	private disconnectionHandler(): (msg: string) => void {
		return (msg: string) => {
			// This implementation is tied to AWSAppSyncRealTimeProvider 'Connection closed', 'Timeout disconnect' msg
			if (
				PUBSUB_CONTROL_MSG.CONNECTION_CLOSED === msg ||
				PUBSUB_CONTROL_MSG.TIMEOUT_DISCONNECT === msg
			) {
				this.datastoreConnectivity.socketDisconnected();
			}
		};
	}

	/**
	 * Stops listening for changes to connectivity status.
	 *
	 * SIDE EFFECT:
	 * 1. Unsubscribes from `datastoreConnectivity`.
	 */
	public unsubscribeConnectivity() {
		this.datastoreConnectivity.unsubscribe();
	}

	/**
	 * Saves ModelMetadata entries for each syncable model across all
	 * discoverable namespaces, resetting last sync times if a change to the
	 * sync predicate is detected.
	 *
	 * SIDE EFFECT:
	 * 1. Sets sync status for every discovered syncable model to `false`.
	 * 1. Writes new model metadata information, potentially signaling a full
	 * resync.
	 *
	 * @param params Initialization params, namely `{ fullSyncInterval }`
	 * @returns A map of initialized model metadatas.
	 */
	private async setupModels(params: StartParams) {
		const { fullSyncInterval } = params;

		/**
		 * The internal metadata model used to record model namespace, most
		 * recent sync timings, and a repr of the last sync predicate used.
		 */
		const ModelMetadata = this.modelClasses
			.ModelMetadata as PersistentModelConstructor<ModelMetadata>;

		/**
		 * The list of all syncable models.
		 */
		const models: [string, SchemaModel][] = [];
		let savedModel;

		// Searches the full list of namespaces and each model therein to
		// discover syncable models and record them against the `models`
		// accumulator. As each model is encountered, it is assumed that the
		// model is *not* sync'd. So, it sets sync status to `false`.
		Object.values(this.schema.namespaces).forEach(namespace => {
			Object.values(namespace.models)
				.filter(({ syncable }) => syncable)
				.forEach(model => {
					models.push([namespace.name, model]);
					if (namespace.name === USER) {
						const modelConstructor = this.userModelClasses[
							model.name
						] as PersistentModelConstructor<any>;
						this.modelSyncedStatus.set(modelConstructor, false);
					}
				});
		});

		// array of promises that will be awaited on and mapped to results.
		const promises = models.map(async ([namespace, model]) => {
			const modelMetadata = await this.getModelMetadata(namespace, model.name);
			const syncPredicate = ModelPredicateCreator.getPredicates(
				this.syncPredicates.get(model),
				false
			);
			const lastSyncPredicate = syncPredicate
				? JSON.stringify(syncPredicate)
				: null;

			if (modelMetadata === undefined) {
				[[savedModel]] = await this.storage.save(
					this.modelInstanceCreator(ModelMetadata, {
						model: model.name,
						namespace,
						lastSync: null,
						fullSyncInterval,
						lastFullSync: null,
						lastSyncPredicate,
					}),
					undefined,
					ownSymbol
				);
			} else {
				const prevSyncPredicate = modelMetadata.lastSyncPredicate
					? modelMetadata.lastSyncPredicate
					: null;
				const syncPredicateUpdated = prevSyncPredicate !== lastSyncPredicate;

				[[savedModel]] = await this.storage.save(
					(
						this.modelClasses.ModelMetadata as PersistentModelConstructor<any>
					).copyOf(modelMetadata, draft => {
						draft.fullSyncInterval = fullSyncInterval;
						// perform a base sync if the syncPredicate changed in between calls to DataStore.start
						// ensures that the local store contains all the data specified by the syncExpression
						if (syncPredicateUpdated) {
							draft.lastSync = null;
							draft.lastFullSync = null;
							draft.lastSyncPredicate = lastSyncPredicate;
						}
					})
				);
			}

			return savedModel;
		});

		const result: Record<string, ModelMetadata> = {};
		for (const modelMetadata of await Promise.all(promises)) {
			const { model: modelName } = modelMetadata;

			result[modelName] = modelMetadata;
		}

		return result;
	}

	/**
	 * Fetches metadata (last sync details) from storage for all known syncable
	 * models.
	 *
	 * @returns An array of all model metadata records.
	 */
	private async getModelsMetadata(): Promise<ModelMetadata[]> {
		const ModelMetadata = this.modelClasses
			.ModelMetadata as PersistentModelConstructor<ModelMetadata>;

		const modelsMetadata = await this.storage.query(ModelMetadata);

		return modelsMetadata;
	}

	/**
	 * Fetches metadata (last sync details) from storage for a particular model
	 * in a particular namespace, assuming the given namespace-model exists and
	 * is syncable.
	 *
	 * @param namespace The namespace the model lives in.
	 * @param model The model name to search for.
	 * @returns Array of model metadata.
	 */
	private async getModelMetadata(
		namespace: string,
		model: string
	): Promise<ModelMetadata> {
		const ModelMetadata = this.modelClasses
			.ModelMetadata as PersistentModelConstructor<ModelMetadata>;

		const predicate = ModelPredicateCreator.createFromExisting<ModelMetadata>(
			this.schema.namespaces[SYNC].models[ModelMetadata.name],
			c => c.namespace('eq', namespace).model('eq', model)
		);

		const [modelMetadata] = await this.storage.query(ModelMetadata, predicate, {
			page: 0,
			limit: 1,
		});

		return modelMetadata;
	}

	/**
	 * Finds the definition for a model constructor.
	 *
	 * The returned definition contains schema information about the model, such
	 * as name, fields, and other attributes included in the graphql definition.
	 *
	 * @param modelConstructor The model constructor to look up.
	 * @returns the model definition or undefined
	 */
	private getModelDefinition(
		modelConstructor: PersistentModelConstructor<any>
	): SchemaModel {
		const namespaceName = this.namespaceResolver(modelConstructor);

		const modelDefinition =
			this.schema.namespaces[namespaceName].models[modelConstructor.name];

		return modelDefinition;
	}

	/**
	 * The full namespace definition for the sync engine.
	 *
	 * This defines the schema and naming for local tables that the sync engine
	 * is free to use for tracking sync-related data without fear of conflict
	 * with other DataStore or app-level models.
	 *
	 * The namespace is currently used for:
	 *
	 * 1. `MutationEvent` - Outbox / Outgoing mutations.
	 * 1. `ModelMetadata` - Details about when a model was last synced from
	 * AppSync and what sync expression / predicate was used.
	 */
	static getNamespace() {
		const namespace: SchemaNamespace = {
			name: SYNC,
			relationships: {},
			enums: {
				OperationType: {
					name: 'OperationType',
					values: ['CREATE', 'UPDATE', 'DELETE'],
				},
			},
			nonModels: {},
			models: {
				MutationEvent: {
					name: 'MutationEvent',
					pluralName: 'MutationEvents',
					syncable: false,
					fields: {
						id: {
							name: 'id',
							type: 'ID',
							isRequired: true,
							isArray: false,
						},
						model: {
							name: 'model',
							type: 'String',
							isRequired: true,
							isArray: false,
						},
						data: {
							name: 'data',
							type: 'String',
							isRequired: true,
							isArray: false,
						},
						modelId: {
							name: 'modelId',
							type: 'String',
							isRequired: true,
							isArray: false,
						},
						operation: {
							name: 'operation',
							type: {
								enum: 'Operationtype',
							},
							isArray: false,
							isRequired: true,
						},
						condition: {
							name: 'condition',
							type: 'String',
							isArray: false,
							isRequired: true,
						},
					},
				},
				ModelMetadata: {
					name: 'ModelMetadata',
					pluralName: 'ModelsMetadata',
					syncable: false,
					fields: {
						id: {
							name: 'id',
							type: 'ID',
							isRequired: true,
							isArray: false,
						},
						namespace: {
							name: 'namespace',
							type: 'String',
							isRequired: true,
							isArray: false,
						},
						model: {
							name: 'model',
							type: 'String',
							isRequired: true,
							isArray: false,
						},
						lastSync: {
							name: 'lastSync',
							type: 'Int',
							isRequired: false,
							isArray: false,
						},
						lastFullSync: {
							name: 'lastFullSync',
							type: 'Int',
							isRequired: false,
							isArray: false,
						},
						fullSyncInterval: {
							name: 'fullSyncInterval',
							type: 'Int',
							isRequired: true,
							isArray: false,
						},
						lastSyncPredicate: {
							name: 'lastSyncPredicate',
							type: 'String',
							isRequired: false,
							isArray: false,
						},
					},
				},
			},
		};
		return namespace;
	}
}
