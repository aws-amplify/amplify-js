import {
	browserOrNode,
	ConsoleLogger as Logger,
	JobContext,
	ConsoleLogger,
} from '@aws-amplify/core';
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
	ManagedIdentifier,
	OptionallyManagedIdentifier,
	__modelMeta__,
	AmplifyContext,
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
	getIdentifierValue,
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
	readonly [__modelMeta__]: {
		identifier: OptionallyManagedIdentifier<MutationEvent, 'id'>;
	};
	public readonly id: string;
	public readonly model: string;
	public readonly operation: TransformerMutationType;
	public readonly modelId: string;
	public readonly condition: string;
	public readonly data: string;
	constructor(init: ModelInit<MutationEvent>);
	static copyOf(
		src: MutationEvent,
		mutator: (draft: MutableModel<MutationEvent>) => void | MutationEvent
	): MutationEvent;
}

export declare class ModelMetadata {
	readonly [__modelMeta__]: {
		identifier: ManagedIdentifier<ModelMetadata, 'id'>;
	};
	public readonly id: string;
	public readonly namespace: string;
	public readonly model: string;
	public readonly fullSyncInterval: number;
	public readonly lastSync?: number;
	public readonly lastFullSync?: number;
	public readonly lastSyncPredicate?: null | string;
	constructor(init: ModelInit<ModelMetadata>);
	static copyOf(
		src: ModelMetadata,
		mutator: (draft: MutableModel<ModelMetadata>) => void | ModelMetadata
	): ModelMetadata;
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

export class SyncEngine {
	private online = false;

	private readonly syncQueriesProcessor: SyncProcessor;
	private readonly subscriptionsProcessor: SubscriptionProcessor;
	private readonly mutationsProcessor: MutationProcessor;
	private readonly modelMerger: ModelMerger;
	private readonly outbox: MutationEventOutbox;
	private readonly datastoreConnectivity: DataStoreConnectivity;
	private readonly modelSyncedStatus: WeakMap<
		PersistentModelConstructor<any>,
		boolean
	> = new WeakMap();

	private context: JobContext;

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
		private readonly storage: Storage,
		private readonly modelInstanceCreator: ModelInstanceCreator,
		conflictHandler: ConflictHandler,
		errorHandler: ErrorHandler,
		private readonly syncPredicates: WeakMap<SchemaModel, ModelPredicate<any>>,
		private readonly amplifyConfig: Record<string, any> = {},
		private readonly authModeStrategy: AuthModeStrategy,
		private readonly amplifyContext: AmplifyContext
	) {
		this.context = new JobContext();

		const MutationEvent = this.modelClasses[
			'MutationEvent'
		] as PersistentModelConstructor<MutationEvent>;

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
			errorHandler,
			this.amplifyContext
		);

		this.subscriptionsProcessor = new SubscriptionProcessor(
			this.schema,
			this.syncPredicates,
			this.amplifyConfig,
			this.authModeStrategy,
			errorHandler,
			this.amplifyContext
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
			conflictHandler,
			this.amplifyContext
		);

		this.datastoreConnectivity = new DataStoreConnectivity();
	}

	start(params: StartParams) {
		return new Observable<ControlMessageType<ControlMessage>>(observer => {
			logger.log('starting sync engine...');

			let subscriptions: ZenObservable.Subscription[] = [];

			this.context.add(async () => {
				try {
					await this.setupModels(params);
				} catch (err) {
					observer.error(err);
					return;
				}

				// this is awaited at the bottom. so, we don't need to register
				// this explicitly with the context. it's already contained.
				const startPromise = new Promise(doneStarting => {
					this.datastoreConnectivity.status().subscribe(async ({ online }) =>
						this.context.add(async () => {
							// From offline to online
							if (online && !this.online) {
								this.online = online;

								observer.next({
									type: ControlMessage.SYNC_ENGINE_NETWORK_STATUS,
									data: {
										active: this.online,
									},
								});

								let ctlSubsObservable: Observable<CONTROL_MSG>;
								let dataSubsObservable: Observable<
									[TransformerMutationType, SchemaModel, PersistentModel]
								>;

								// NOTE: need a way to override this conditional for testing.
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
														type ===
														ControlMessage.SYNC_ENGINE_SYNC_QUERIES_READY
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
										.subscribe(({ modelDefinition, model: item, hasMore }) =>
											this.context.add(async () => {
												const modelConstructor = this.userModelClasses[
													modelDefinition.name
												] as PersistentModelConstructor<any>;

												const model = this.modelInstanceCreator(
													modelConstructor,
													item
												);

												await this.storage.runExclusive(storage =>
													this.modelMerger.merge(
														storage,
														model,
														modelDefinition
													)
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
											}, 'mutation processor event')
										)
								);
								//#endregion

								//#region Merge subscriptions buffer
								// TODO: extract to function
								if (!isNode) {
									subscriptions.push(
										dataSubsObservable.subscribe(
											([_transformerMutationType, modelDefinition, item]) =>
												this.context.add(async () => {
													const modelConstructor = this.userModelClasses[
														modelDefinition.name
													] as PersistentModelConstructor<any>;

													const model = this.modelInstanceCreator(
														modelConstructor,
														item
													);

													await this.storage.runExclusive(storage =>
														this.modelMerger.merge(
															storage,
															model,
															modelDefinition
														)
													);
												}, 'subscription dataSubsObservable event')
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

							doneStarting();
						}, 'datastore connectivity event')
					);
				});

				this.storage
					.observe(null, null, ownSymbol)
					.filter(({ model }) => {
						const modelDefinition = this.getModelDefinition(model);
						return modelDefinition.syncable === true;
					})
					.subscribe({
						next: ({ opType, model, element, condition }) =>
							this.context.add(async () => {
								const namespace =
									this.schema.namespaces[this.namespaceResolver(model)];
								const MutationEventConstructor = this.modelClasses[
									'MutationEvent'
								] as PersistentModelConstructor<MutationEvent>;
								const modelDefinition = this.getModelDefinition(model);
								const graphQLCondition = predicateToGraphQLCondition(
									condition,
									modelDefinition
								);
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

								if (this.online) {
									this.mutationsProcessor.resume();
								}
							}, 'storage event'),
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
			}, 'sync start');

			return this.context.addCleaner(async () => {
				subscriptions.forEach(sub => sub.unsubscribe());
			}, 'sync start cleaner');
		});
	}

	private async getModelsMetadataWithNextFullSync(
		currentTimeStamp: number
	): Promise<Map<SchemaModel, [string, number]>> {
		const modelLastSync: Map<SchemaModel, [string, number]> = new Map(
			(
				await this.context.add(
					() => this.getModelsMetadata(),
					'sync/index getModelsMetadataWithNextFullSync'
				)
			).map(
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

			this.context.add(async () => {
				let terminated = false;

				while (!observer.closed && !terminated) {
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
								next: ({
									namespace,
									modelDefinition,
									items,
									done,
									startedAt,
									isFullSync,
								}) =>
									this.context.add(async () => {
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
											const idsInOutbox = await this.outbox.getModelIds(
												storage
											);

											const oneByOne: ModelInstanceMetadata[] = [];
											const page = items.filter(item => {
												const itemId = getIdentifierValue(
													modelDefinition,
													item
												);

												if (!idsInOutbox.has(itemId)) {
													return true;
												}

												oneByOne.push(item);
												return false;
											});

											const opTypeCount: [any, OpType][] = [];

											for (const item of oneByOne) {
												const opType = await this.modelMerger.merge(
													storage,
													item,
													modelDefinition
												);

												if (opType !== undefined) {
													opTypeCount.push([item, opType]);
												}
											}

											opTypeCount.push(
												...(await this.modelMerger.mergePage(
													storage,
													modelConstructor,
													page,
													modelDefinition
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
													.ModelMetadata as PersistentModelConstructor<ModelMetadata>
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
									}, 'syncQueriesObservable syncQueriesSubscription event'),
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

					// TODO: create `JobContext.sleep()` ... but, need to put
					// a lot of thought into what that contract looks like to
					//  support possible use-cases:
					//
					//  1. non-cancelable
					//  2. cancelable, unsleep on exit()
					//  3. cancelable, throw Error on exit()
					//  4. cancelable, callback first on exit()?
					//  5. ... etc. ? ...
					//
					// TLDR; this is a lot of complexity here for a sleep(),
					// but, it's not clear to me yet how to support an
					// extensible, centralized cancelable `sleep()` elegantly.
					await this.context.add(async onTerminate => {
						let sleepTimer;
						let unsleep;

						const sleep = new Promise(_unsleep => {
							unsleep = _unsleep;
							sleepTimer = setTimeout(unsleep, msNextFullSync);
						});

						onTerminate.then(() => {
							terminated = true;
							unsleep();
						});

						return sleep;
					}, 'syncQueriesObservable sleep');
				}
			}, 'syncQueriesObservable main');

			return this.context.addCleaner(async () => {
				console.debug('cleaning syncQueriesObservable');

				if (syncQueriesSubscription) {
					syncQueriesSubscription.unsubscribe();
				}
			}, 'syncQueriesObservable cleaner');
		});
	}

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

	public unsubscribeConnectivity() {
		this.datastoreConnectivity.unsubscribe();
	}

	/**
	 * Stops all subscription activities and resolves when all activies report
	 * that they're disconnected, done retrying, etc..
	 */
	public async stop() {
		console.debug('stopping sync engine');

		// gracefully disconnect subscribers first.
		this.unsubscribeConnectivity();

		// aggressively shut down any lingering background processes.
		// some of this might be semi-redundant with unsubscribing. however,
		// unsubscribing doesn't allow us to wait for settling.
		// (Whereas `stop()` does.)

		await this.syncQueriesProcessor.stop();
		await this.datastoreConnectivity.stop();
		// await this.subscriptionsProcessor.stop();
		await this.mutationsProcessor.stop();

		// do we need to "stop" storage?
		// await this.storage.stop();

		// TODO: consider refactoring shutdowns ^ into this context as child
		// job contexts or passing this context through. before we consider
		// that refactor, we need to stabilize behavior. (unless we find we
		// CAN'T stabilize without centralizing into a single job context.)
		await this.context.exit();

		this.context = new JobContext();
		console.debug('sync engine stopped and ready to restart');
	}

	private async setupModels(params: StartParams) {
		const { fullSyncInterval } = params;
		const ModelMetadataConstructor = this.modelClasses
			.ModelMetadata as PersistentModelConstructor<ModelMetadata>;

		const models: [string, SchemaModel][] = [];
		let savedModel;

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
					this.modelInstanceCreator(ModelMetadataConstructor, {
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
					ModelMetadataConstructor.copyOf(modelMetadata, draft => {
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

	private async getModelsMetadata(): Promise<ModelMetadata[]> {
		const ModelMetadata = this.modelClasses
			.ModelMetadata as PersistentModelConstructor<ModelMetadata>;

		const modelsMetadata = await this.storage.query(ModelMetadata);

		return modelsMetadata;
	}

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

	private getModelDefinition(
		modelConstructor: PersistentModelConstructor<any>
	): SchemaModel {
		const namespaceName = this.namespaceResolver(modelConstructor);

		const modelDefinition =
			this.schema.namespaces[namespaceName].models[modelConstructor.name];

		return modelDefinition;
	}

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
