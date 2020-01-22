import { ConsoleLogger as Logger, Reachability } from '@aws-amplify/core';
import Observable from 'zen-observable-ts';
import { ModelInstanceCreator } from '../datastore/datastore';
import { ModelPredicateCreator } from '../predicates';
import Storage from '../storage/storage';
import {
	ConflictHandler,
	ErrorHandler,
	InternalSchema,
	ModelInit,
	MutableModel,
	NamespaceResolver,
	PersistentModel,
	PersistentModelConstructor,
	SchemaModel,
	SchemaNamespace,
} from '../types';
import { SYNC } from '../util';
import { ModelMerger } from './merger';
import { MutationEventOutbox } from './outbox';
import { MutationProcessor } from './processors/mutation';
import { CONTROL_MSG, SubscriptionProcessor } from './processors/subscription';
import { SyncModelPage, SyncProcessor } from './processors/sync';
import {
	createMutationInstanceFromModelOperation,
	predicateToGraphQLCondition,
	TransformerMutationType,
} from './utils';

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
	public readonly data: string;
	public readonly modelId: string;
	public readonly condition: string;
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
}

export class SyncEngine {
	private started: boolean = false;
	private online = false;
	private processingMutations = false;
	private fullSyncTimeoutId: number;

	private readonly syncQueriesProcessor: SyncProcessor;
	private readonly subscriptionsProcessor: SubscriptionProcessor;
	private readonly mutationsProcessor: MutationProcessor;
	private readonly modelMerger: ModelMerger;
	private readonly outbox: MutationEventOutbox;

	constructor(
		private readonly schema: InternalSchema,
		private readonly namespaceResolver: NamespaceResolver,
		private readonly modelClasses: Record<
			string,
			PersistentModelConstructor<any>
		>,
		private readonly userModelClasses: Record<
			string,
			PersistentModelConstructor<any>
		>,
		private readonly storage: Storage,
		private readonly modelInstanceCreator: ModelInstanceCreator,
		private readonly maxRecordsToSync: number,
		conflictHandler: ConflictHandler,
		errorHandler: ErrorHandler
	) {
		const MutationEvent = this.modelClasses['MutationEvent'];

		this.outbox = new MutationEventOutbox(
			this.schema,
			this.namespaceResolver,
			MutationEvent,
			ownSymbol
		);

		this.modelMerger = new ModelMerger(this.outbox, ownSymbol);

		this.syncQueriesProcessor = new SyncProcessor(
			this.schema,
			maxRecordsToSync
		);
		this.subscriptionsProcessor = new SubscriptionProcessor(this.schema);
		this.mutationsProcessor = new MutationProcessor(
			this.schema,
			this.storage,
			this.userModelClasses,
			this.outbox,
			this.modelInstanceCreator,
			MutationEvent,
			conflictHandler,
			errorHandler
		);
	}

	start(params: StartParams) {
		return new Observable<void>(observer => {
			logger.log('starting sync engine...');
			this.started = true;

			let subscriptions: ZenObservable.Subscription[] = [];
			(async () => {
				try {
					await this.setupModels(params);
				} catch (err) {
					logger.error(
						"Sync engine stopped. IndexedDB not supported in this browser's private mode"
					);
					return;
				}

				new Reachability().networkMonitor().subscribe(async ({ online }) => {
					this.online = online;
					if (online) {
						const [
							ctlSubsObservable,
							dataSubsObservable,
						] = this.subscriptionsProcessor.start();
						try {
							subscriptions.push(
								await this.waitForSubscriptionsReady(ctlSubsObservable)
							);
						} catch (err) {
							observer.error(err);
							return;
						}

						logger.log('Realtime ready');
						const currentTimeStamp = new Date().getTime();

						const modelLastSync: Map<
							SchemaModel,
							[string, number]
						> = await this.getModelsMetadataWithNextFullSync(currentTimeStamp);
						const paginatingModels = new Set(modelLastSync.keys());

						const syncQueriesObservable = this.syncQueriesProcessor.start(
							modelLastSync
						);

						if (this.isFullSync(modelLastSync)) {
							clearTimeout(this.fullSyncTimeoutId);
							this.fullSyncTimeoutId = undefined;
						}

						try {
							const syncQuerySubscription = await this.waitForSyncQueries(
								syncQueriesObservable,
								paginatingModels
							);

							if (syncQuerySubscription) {
								subscriptions.push(syncQuerySubscription);
							}
						} catch (err) {
							observer.error(err);
							return;
						}

						// process mutations
						subscriptions.push(
							this.mutationsProcessor
								.start()
								.subscribe(
									([_transformerMutationType, modelDefinition, item]) => {
										const modelConstructor = this.userModelClasses[
											modelDefinition.name
										];

										const model = this.modelInstanceCreator(
											modelConstructor,
											item
										);

										this.modelMerger.merge(this.storage, model);
									}
								)
						);

						// TODO: extract to funciton
						subscriptions.push(
							dataSubsObservable.subscribe(
								([_transformerMutationType, modelDefinition, item]) => {
									const modelConstructor = this.userModelClasses[
										modelDefinition.name
									];

									const model = this.modelInstanceCreator(
										modelConstructor,
										item
									);

									this.modelMerger.merge(this.storage, model);
								}
							)
						);
					} else {
						subscriptions.forEach(sub => sub.unsubscribe());
						subscriptions = [];
					}
				});

				this.storage
					.observe(null, null, ownSymbol)
					.filter(({ model }) => {
						const modelDefinition = this.getModelDefinition(model);

						return modelDefinition.syncable === true;
					})
					.subscribe({
						next: async ({ opType, model, element, condition }) => {
							const namespace = this.schema.namespaces[
								this.namespaceResolver(model)
							];
							const MutationEventConstructor = this.modelClasses[
								'MutationEvent'
							];
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

							if (this.online) {
								this.mutationsProcessor.resume();
							}
						},
					});
			})();
			return () => {
				subscriptions.forEach(sub => sub.unsubscribe());
			};
		});
	}

	private async getModelsMetadataWithNextFullSync(
		currentTimeStamp: number
	): Promise<Map<SchemaModel, [string, number]>> {
		const modelLastSync: Map<SchemaModel, [string, number]> = new Map(
			(await this.getModelsMetadata()).map(
				({ namespace, model, lastSync, lastFullSync, fullSyncInterval }) => {
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

	private isFullSync(modelsMap: Map<SchemaModel, [string, number]>) {
		for (const [, syncFrom] of Array.from(modelsMap.values())) {
			if (syncFrom === 0) {
				return true;
			}
		}

		return false;
	}

	private async waitForSyncQueries(
		observable: Observable<SyncModelPage>,
		paginatingModels: Set<SchemaModel>
	): Promise<ZenObservable.Subscription> {
		return new Promise((resolve, reject) => {
			if (!this.online) {
				resolve();
			}
			const currentTimeStamp = new Date().getTime();
			const subscription = observable.subscribe({
				error: err => {
					reject(err);
				},
				next: async ({
					namespace,
					modelDefinition,
					items,
					done,
					startedAt,
					isFullSync,
				}) => {
					const promises = items.map(async item => {
						const modelConstructor = this.userModelClasses[
							modelDefinition.name
						];

						const model = this.modelInstanceCreator(modelConstructor, item);

						return this.modelMerger.merge(this.storage, model);
					});

					await Promise.all(promises);

					if (done) {
						paginatingModels.delete(modelDefinition);

						// update last sync for type
						let modelMetadata = await this.getModelMetadata(
							namespace,
							modelDefinition.name
						);

						modelMetadata = this.modelClasses.ModelMetadata.copyOf(
							modelMetadata,
							draft => {
								draft.lastSync = startedAt;
								draft.lastFullSync = isFullSync
									? currentTimeStamp
									: modelMetadata.lastFullSync;
							}
						);

						const { fullSyncInterval } = modelMetadata;

						await this.storage.save(modelMetadata, undefined, ownSymbol);

						// resolve promise if all done
						if (paginatingModels.size === 0) {
							resolve(subscription);
						}

						if (isFullSync && !this.fullSyncTimeoutId) {
							// register next full sync when no full sync is already scheduled

							this.fullSyncTimeoutId = <number>(
								(<unknown>setTimeout(async () => {
									const currentTimeStamp = new Date().getTime();

									const modelLastSync = await this.getModelsMetadataWithNextFullSync(
										currentTimeStamp
									);

									const paginatingModels = new Set(modelLastSync.keys());

									const syncQueriesObservable = this.syncQueriesProcessor.start(
										modelLastSync
									);

									this.fullSyncTimeoutId = undefined;
									this.waitForSyncQueries(
										syncQueriesObservable,
										paginatingModels
									);
								}, fullSyncInterval))
							);
						}
					}
				},
			});
		});
	}

	private async waitForSubscriptionsReady(
		ctlSubsObservable: Observable<CONTROL_MSG>
	): Promise<ZenObservable.Subscription> {
		return new Promise((resolve, reject) => {
			const subscription = ctlSubsObservable.subscribe({
				next: msg => {
					if (msg === CONTROL_MSG.CONNECTED) {
						resolve(subscription);
					}
				},
				error: err => {
					reject(`subscription failed ${err}`);
				},
			});
		});
	}

	private async setupModels(params: StartParams) {
		const { fullSyncInterval } = params;
		const ModelMetadata = this.modelClasses
			.ModelMetadata as PersistentModelConstructor<ModelMetadata>;

		const models: [string, string][] = [];

		Object.values(this.schema.namespaces).forEach(namespace => {
			Object.values(namespace.models)
				.filter(({ syncable }) => syncable)
				.forEach(model => {
					models.push([namespace.name, model.name]);
				});
		});

		const promises = models.map(async ([namespace, model]) => {
			const modelMetadata = await this.getModelMetadata(namespace, model);

			if (modelMetadata === undefined) {
				await this.storage.save(
					this.modelInstanceCreator(ModelMetadata, {
						model,
						namespace,
						lastSync: null,
						fullSyncInterval,
						lastFullSync: null,
					}),
					undefined,
					ownSymbol
				);
			} else {
				await this.storage.save(
					this.modelClasses.ModelMetadata.copyOf(modelMetadata, draft => {
						draft.fullSyncInterval = fullSyncInterval;
					})
				);
			}
		});

		await Promise.all(promises);
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

		const [modelMetadata] = await this.storage.query(ModelMetadata, predicate);

		return modelMetadata;
	}

	private getModelDefinition(
		modelConstructor: PersistentModelConstructor<any>
	): SchemaModel {
		const namespaceName = this.namespaceResolver(modelConstructor);

		const modelDefinition = this.schema.namespaces[namespaceName].models[
			modelConstructor.name
		];

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
					},
				},
			},
		};
		return namespace;
	}
}
