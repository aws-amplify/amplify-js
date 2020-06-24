import { Amplify, Hub, JS } from '@aws-amplify/core';
import Observable, { ZenObservable } from 'zen-observable-ts';
import {
	isPredicatesAll,
	ModelPredicateCreator,
	PredicateAll,
} from '../predicates';
import { ExclusiveStorage as Storage } from '../storage/storage';
import { ControlMessage, SyncEngine } from '../sync';
import {
	ConflictHandler,
	DataStoreConfig,
	ModelPredicate,
	PaginationInput,
	PersistentModel,
	PersistentModelConstructor,
	ProducerModelPredicate,
	SubscriptionMessage,
	SyncError,
} from '../types';
import { USER } from '../util';
import { checkSchemaVersion } from './checkSchemaVersion';
import { defaultConflictHandler } from './defaultConflictHandler';
import { defaultErrorHandler } from './defaultErrorHandler';
import { getModelConstructorByModelName } from './getModelConstructorByModelName';
import { getModelDefinition } from './getModelDefinition';
import { isQueryOne } from './isQueryOne';
import { isValidModelConstructor } from './isValidModelConstructor';
import { logger } from './logger';
import { modelInstanceCreator } from './modelInstanceCreator';
import { namespaceResolver } from './namespaceResolver';
import { schema, syncClasses, userClasses } from './schema';

const { isNode } = JS.browserOrNode();

export class DataStore {
	private initialized;
	private storage: Storage;
	private sync: SyncEngine;
	private syncSubscription: ZenObservable.Subscription;
	private amplifyConfig: Record<string, any> = {};
	private conflictHandler: ConflictHandler;
	private errorHandler: (error: SyncError) => void;
	private maxRecordsToSync: number;
	private syncPageSize: number;
	private fullSyncInterval: number;

	constructor() {
		Amplify.register(this);
	}

	getModuleName() {
		return 'DataStore';
	}

	start = async (): Promise<void> => {
		if (this.initialized === undefined) {
			logger.debug('Starting DataStore');

			let resolve, reject;

			this.initialized = new Promise((res, rej) => {
				resolve = res;
				reject = rej;
			});

			this.initialized.resolve = resolve;
			this.initialized.reject = reject;
		} else {
			await this.initialized;

			return;
		}

		this.storage = new Storage(
			schema,
			namespaceResolver,
			getModelConstructorByModelName,
			modelInstanceCreator
		);

		await this.storage.init();

		await checkSchemaVersion(this.storage, schema.version);

		const { aws_appsync_graphqlEndpoint } = this.amplifyConfig;

		if (aws_appsync_graphqlEndpoint) {
			logger.debug('GraphQL endpoint available', aws_appsync_graphqlEndpoint);

			this.sync = new SyncEngine(
				schema,
				namespaceResolver,
				syncClasses,
				userClasses,
				this.storage,
				modelInstanceCreator,
				this.maxRecordsToSync,
				this.syncPageSize,
				this.conflictHandler,
				this.errorHandler
			);

			const fullSyncIntervalInMilliseconds = this.fullSyncInterval * 1000 * 60; // fullSyncInterval from param is in minutes

			this.syncSubscription = this.sync
				.start({ fullSyncInterval: fullSyncIntervalInMilliseconds })
				.subscribe({
					next: ({ type, data }) => {
						// In Node, we need to wait for queries to be synced to prevent returning empty arrays.
						// In the Browser, we can begin returning data once subscriptions are in place.
						const readyType = isNode
							? ControlMessage.SYNC_ENGINE_SYNC_QUERIES_READY
							: ControlMessage.SYNC_ENGINE_STORAGE_SUBSCRIBED;

						if (type === readyType) {
							this.initialized.resolve();
						}

						Hub.dispatch('datastore', {
							event: type,
							data,
						});
					},
					error: err => {
						logger.warn('Sync error', err);
						this.initialized.reject();
					},
				});
		} else {
			logger.info(
				"Data won't be synchronized. No GraphQL endpoint configured.",
				{
					config: this.amplifyConfig,
				}
			);

			this.initialized.resolve();
		}

		await this.initialized;
	};

	query: {
		<T extends PersistentModel>(
			modelConstructor: PersistentModelConstructor<T>,
			id: string
		): Promise<T | undefined>;
		<T extends PersistentModel>(
			modelConstructor: PersistentModelConstructor<T>,
			criteria?: ProducerModelPredicate<T> | typeof PredicateAll,
			pagination?: PaginationInput
		): Promise<T[]>;
	} = async <T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		idOrCriteria?: string | ProducerModelPredicate<T> | typeof PredicateAll,
		pagination?: PaginationInput
	): Promise<T | T[] | undefined> => {
		await this.start();

		//#region Input validation
		if (!isValidModelConstructor(modelConstructor)) {
			const msg = 'Constructor is not for a valid model';
			logger.error(msg, { modelConstructor });

			throw new Error(msg);
		}

		if (typeof idOrCriteria === 'string') {
			if (pagination !== undefined) {
				logger.warn('Pagination is ignored when querying by id');
			}
		}

		const modelDefinition = getModelDefinition(modelConstructor);
		let predicate: ModelPredicate<T>;

		if (isQueryOne(idOrCriteria)) {
			predicate = ModelPredicateCreator.createForId<T>(
				modelDefinition,
				idOrCriteria
			);
		} else {
			if (isPredicatesAll(idOrCriteria)) {
				// Predicates.ALL means "all records", so no predicate (undefined)
				predicate = undefined;
			} else {
				predicate = ModelPredicateCreator.createFromExisting(
					modelDefinition,
					idOrCriteria
				);
			}
		}

		const { limit, page } = pagination || {};

		if (page !== undefined && limit === undefined) {
			throw new Error('Limit is required when requesting a page');
		}

		if (page !== undefined) {
			if (typeof page !== 'number') {
				throw new Error('Page should be a number');
			}

			if (page < 0) {
				throw new Error("Page can't be negative");
			}
		}

		if (limit !== undefined) {
			if (typeof limit !== 'number') {
				throw new Error('Limit should be a number');
			}

			if (limit < 0) {
				throw new Error("Limit can't be negative");
			}
		}

		//#endregion
		logger.debug('params ready', {
			modelConstructor,
			predicate: ModelPredicateCreator.getPredicates(predicate, false),
			pagination,
		});

		const result = await this.storage.query(
			modelConstructor,
			predicate,
			pagination
		);

		return isQueryOne(idOrCriteria) ? result[0] : result;
	};

	save = async <T extends PersistentModel>(
		model: T,
		condition?: ProducerModelPredicate<T>
	): Promise<T> => {
		await this.start();

		const modelConstructor: PersistentModelConstructor<T> = model
			? <PersistentModelConstructor<T>>model.constructor
			: undefined;

		if (!isValidModelConstructor(modelConstructor)) {
			const msg = 'Object is not an instance of a valid model';
			logger.error(msg, { model });

			throw new Error(msg);
		}

		const modelDefinition = getModelDefinition(modelConstructor);

		const producedCondition = ModelPredicateCreator.createFromExisting(
			modelDefinition,
			condition
		);

		const [savedModel] = await this.storage.runExclusive(async s => {
			await s.save(model, producedCondition);

			return s.query(
				modelConstructor,
				ModelPredicateCreator.createForId(modelDefinition, model.id)
			);
		});

		return savedModel;
	};

	delete: {
		<T extends PersistentModel>(
			model: T,
			condition?: ProducerModelPredicate<T>
		): Promise<T>;
		<T extends PersistentModel>(
			modelConstructor: PersistentModelConstructor<T>,
			id: string
		): Promise<T>;
		<T extends PersistentModel>(
			modelConstructor: PersistentModelConstructor<T>,
			condition: ProducerModelPredicate<T> | typeof PredicateAll
		): Promise<T[]>;
	} = async <T extends PersistentModel>(
		modelOrConstructor: T | PersistentModelConstructor<T>,
		idOrCriteria?: string | ProducerModelPredicate<T> | typeof PredicateAll
	) => {
		await this.start();

		let condition: ModelPredicate<T>;

		if (!modelOrConstructor) {
			const msg = 'Model or Model Constructor required';
			logger.error(msg, { modelOrConstructor });

			throw new Error(msg);
		}

		if (isValidModelConstructor(modelOrConstructor)) {
			const modelConstructor = modelOrConstructor;

			if (!idOrCriteria) {
				const msg =
					'Id to delete or criteria required. Do you want to delete all? Pass Predicates.ALL';
				logger.error(msg, { idOrCriteria });

				throw new Error(msg);
			}

			if (typeof idOrCriteria === 'string') {
				condition = ModelPredicateCreator.createForId<T>(
					getModelDefinition(modelConstructor),
					idOrCriteria
				);
			} else {
				condition = ModelPredicateCreator.createFromExisting(
					getModelDefinition(modelConstructor),
					/**
					 * idOrCriteria is always a ProducerModelPredicate<T>, never a symbol.
					 * The symbol is used only for typing purposes. e.g. see Predicates.ALL
					 */
					idOrCriteria as ProducerModelPredicate<T>
				);

				if (!condition || !ModelPredicateCreator.isValidPredicate(condition)) {
					const msg =
						'Criteria required. Do you want to delete all? Pass Predicates.ALL';
					logger.error(msg, { condition });

					throw new Error(msg);
				}
			}

			const [deleted] = await this.storage.delete(modelConstructor, condition);

			return deleted;
		} else {
			const model = modelOrConstructor;
			const modelConstructor = Object.getPrototypeOf(model || {})
				.constructor as PersistentModelConstructor<T>;

			if (!isValidModelConstructor(modelConstructor)) {
				const msg = 'Object is not an instance of a valid model';
				logger.error(msg, { model });

				throw new Error(msg);
			}

			const modelDefinition = getModelDefinition(modelConstructor);

			const idPredicate = ModelPredicateCreator.createForId<T>(
				modelDefinition,
				model.id
			);

			if (idOrCriteria) {
				if (typeof idOrCriteria !== 'function') {
					const msg = 'Invalid criteria';
					logger.error(msg, { idOrCriteria });

					throw new Error(msg);
				}

				condition = idOrCriteria(idPredicate);
			} else {
				condition = idPredicate;
			}

			const [[deleted]] = await this.storage.delete(model, condition);

			return deleted;
		}
	};

	observe: {
		(): Observable<SubscriptionMessage<PersistentModel>>;

		<T extends PersistentModel>(model: T): Observable<SubscriptionMessage<T>>;

		<T extends PersistentModel>(
			modelConstructor: PersistentModelConstructor<T>,
			criteria?: string | ProducerModelPredicate<T>
		): Observable<SubscriptionMessage<T>>;
	} = <T extends PersistentModel = PersistentModel>(
		modelOrConstructor?: T | PersistentModelConstructor<T>,
		idOrCriteria?: string | ProducerModelPredicate<T>
	): Observable<SubscriptionMessage<T>> => {
		let predicate: ModelPredicate<T>;

		const modelConstructor: PersistentModelConstructor<T> =
			modelOrConstructor && isValidModelConstructor(modelOrConstructor)
				? modelOrConstructor
				: undefined;

		if (modelOrConstructor && modelConstructor === undefined) {
			const model = <T>modelOrConstructor;
			const modelConstructor =
				model && (<Object>Object.getPrototypeOf(model)).constructor;

			if (isValidModelConstructor<T>(modelConstructor)) {
				if (idOrCriteria) {
					logger.warn('idOrCriteria is ignored when using a model instance', {
						model,
						idOrCriteria,
					});
				}

				return this.observe(modelConstructor, model.id);
			} else {
				const msg =
					'The model is not an instance of a PersistentModelConstructor';
				logger.error(msg, { model });

				throw new Error(msg);
			}
		}

		if (idOrCriteria !== undefined && modelConstructor === undefined) {
			const msg = 'Cannot provide criteria without a modelConstructor';
			logger.error(msg, idOrCriteria);
			throw new Error(msg);
		}

		if (modelConstructor && !isValidModelConstructor(modelConstructor)) {
			const msg = 'Constructor is not for a valid model';
			logger.error(msg, { modelConstructor });

			throw new Error(msg);
		}

		if (typeof idOrCriteria === 'string') {
			predicate = ModelPredicateCreator.createForId<T>(
				getModelDefinition(modelConstructor),
				idOrCriteria
			);
		} else {
			predicate =
				modelConstructor &&
				ModelPredicateCreator.createFromExisting<T>(
					getModelDefinition(modelConstructor),
					idOrCriteria
				);
		}

		return new Observable<SubscriptionMessage<T>>(observer => {
			let handle: ZenObservable.Subscription;

			(async () => {
				await this.start();

				handle = this.storage
					.observe(modelConstructor, predicate)
					.filter(({ model }) => namespaceResolver(model) === USER)
					.subscribe(observer);
			})();

			return () => {
				if (handle) {
					handle.unsubscribe();
				}
			};
		});
	};

	configure = (config: DataStoreConfig = {}) => {
		const {
			DataStore: configDataStore,
			conflictHandler: configConflictHandler,
			errorHandler: configErrorHandler,
			maxRecordsToSync: configMaxRecordsToSync,
			syncPageSize: configSyncPageSize,
			fullSyncInterval: configFullSyncInterval,
			...configFromAmplify
		} = config;

		// ? Why do the pre-existing values take precedence over new values form configure()?
		this.amplifyConfig = { ...configFromAmplify, ...this.amplifyConfig };

		this.conflictHandler =
			(configDataStore && configDataStore.conflictHandler) ||
			this.conflictHandler ||
			config.conflictHandler ||
			defaultConflictHandler;

		this.errorHandler =
			(configDataStore && configDataStore.errorHandler) ||
			this.errorHandler ||
			config.errorHandler ||
			defaultErrorHandler;

		this.maxRecordsToSync =
			(configDataStore && configDataStore.maxRecordsToSync) ||
			this.maxRecordsToSync ||
			config.maxRecordsToSync;

		this.syncPageSize =
			(configDataStore && configDataStore.syncPageSize) ||
			this.syncPageSize ||
			config.syncPageSize;

		this.fullSyncInterval =
			(configDataStore && configDataStore.fullSyncInterval) ||
			configFullSyncInterval ||
			config.fullSyncInterval ||
			24 * 60; // 1 day
	};

	clear = async function clear() {
		if (this.storage === undefined) {
			return;
		}

		if (this.syncSubscription && !this.syncSubscription.closed) {
			this.syncSubscription.unsubscribe();
		}

		await this.storage.clear();

		this.initialized = undefined; // Should re-initialize when start() is called.
		this.storage = undefined;
		this.sync = undefined;
	};

	toJSON = <T extends PersistentModel>(model: T | T[]): JSON => {
		return JSON.parse(JSON.stringify(model));
	};
}
