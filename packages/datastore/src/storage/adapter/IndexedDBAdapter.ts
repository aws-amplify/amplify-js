import { ConsoleLogger as Logger } from '@aws-amplify/core';
import * as idb from 'idb';
import { ModelInstanceCreator } from '../../datastore/datastore';
import {
	ModelPredicateCreator,
	ModelSortPredicateCreator,
} from '../../predicates';
import {
	InternalSchema,
	isPredicateObj,
	ModelInstanceMetadata,
	ModelPredicate,
	NamespaceResolver,
	OpType,
	PaginationInput,
	PersistentModel,
	PersistentModelConstructor,
	PredicateObject,
	PredicatesGroup,
	QueryOne,
	RelationType,
} from '../../types';
import {
	exhaustiveCheck,
	getIndex,
	getIndexFromAssociation,
	isModelConstructor,
	isPrivateMode,
	traverseModel,
	validatePredicate,
	sortCompareFunction,
} from '../../util';
import { Adapter } from './index';

const logger = new Logger('DataStore');

/**
 * Static name to use for IndexedDB database.
 *
 * Serves as a **base name** when a `sessionId` is set.
 *
 * DO NOT CHANGE THIS value without a full design and security review.
 */
const DB_NAME = 'amplify-datastore';

/**
 * Adapter layer intended to sit between `StorageFacade` and IndexedDB.
 */
class IndexedDBAdapter implements Adapter {
	private schema: InternalSchema;

	/**
	 * A function that accepts a Model constructor and determines the
	 * namespace the model lives in.
	 *
	 * @see NamespaceResolver
	 *
	 * param modelConstructor — The Model constructor to inspects
	 * @returns — The namespace as a string.
	 */
	private namespaceResolver: NamespaceResolver;

	/**
	 * Constructs a model and records it with its metadata in a weakset.
	 * Allows for the separate storage of core model fields and
	 * Amplify/DataStore metadata fields that the customer app does not want
	 * exposed.
	 *
	 * @param modelConstructor — The model constructor.
	 * @param init — Init data that would normally be passed to the
	 * constructor.
	 * @returns — The initialized model.
	 */
	private modelInstanceCreator: ModelInstanceCreator;

	private getModelConstructorByModelName: (
		namsespaceName: string,
		modelName: string
	) => PersistentModelConstructor<any>;
	private db: idb.IDBPDatabase;
	private initPromise: Promise<void>;
	private resolve: (value?: any) => void;
	private reject: (value?: any) => void;
	private dbName: string = DB_NAME;

	/**
	 * Throws an error if in private mode, logging the same error to console.
	 *
	 * This determination is based on whether IndexedDB is available, which is
	 * what we care about in using this method anyway. If IndexedDB is NOT
	 * available, this will throw an error AND log to the console.
	 *
	 * SIDE EFFECT: Throws an error if in private mode, specifically if
	 * IndexedDB is not available.
	 */
	private async checkPrivate() {
		const isPrivate = await isPrivateMode().then(isPrivate => {
			return isPrivate;
		});
		if (isPrivate) {
			logger.error("IndexedDB not supported in this browser's private mode");
			return Promise.reject(
				"IndexedDB not supported in this browser's private mode"
			);
		} else {
			return Promise.resolve();
		}
	}

	/**
	 * Derives the fully qualified name from a model constructor.
	 *
	 * This name should exactly equal the table name holding the model
	 * instances in IndexedDB.
	 *
	 * @param modelConstructor A model instance constructor.
	 * @returns The full table name for the given model.
	 */
	private getStorenameForModel(
		modelConstructor: PersistentModelConstructor<any>
	) {
		const namespace = this.namespaceResolver(modelConstructor);
		const { name: modelName } = modelConstructor;

		return this.getStorename(namespace, modelName);
	}

	/**
	 * Given a namespace and model name, generates a fully qualified name.
	 *
	 * This name is intended to be used as the table name &mdash; and anywhere
	 * else an unambiguous name is required for the given namespace-model.
	 *
	 * @param namespace The namespace to contextualize the name in. (E.g., USER, STORAGE, SYNC, etc.)
	 * @param modelName The bare model name to derive from.
	 * @returns A fully qualified table name.
	 */
	private getStorename(namespace: string, modelName: string) {
		const storeName = `${namespace}_${modelName}`;

		return storeName;
	}

	/**
	 * Initializes a local database with the tables and indexes specified in
	 * the given schema.
	 *
	 * Also accepts methods that the adapter should use when determining
	 * namespaces for fully qualified names, the reverse of this operation,
	 * and a preferred function to use for model instantiation.
	 *
	 * Accepting a preferred function for model instantiation comes with
	 * possible side effects. E.g., it is completely expected that the instance
	 * creator function may keep a record metadata in a WeakMap for every
	 * known Model instance.
	 *
	 * SIDE EFFECT:
	 * 1. Potentially clobbers local database.
	 * 1. Places the `resolve()` and `reject()` methods on `this` to use as
	 * "cross-thread" communcation between `setUp()` attempts.
	 *
	 * @param theSchema
	 * @param namespaceResolver
	 * @param modelInstanceCreator
	 * @param getModelConstructorByModelName
	 * @param sessionId
	 */
	async setUp(
		theSchema: InternalSchema,
		namespaceResolver: NamespaceResolver,
		modelInstanceCreator: ModelInstanceCreator,
		getModelConstructorByModelName: (
			namsespaceName: string,
			modelName: string
		) => PersistentModelConstructor<any>,
		sessionId?: string
	) {
		await this.checkPrivate();

		// We use `initPromise()` to block if another "thread" is already
		// trying `setUp()` the database.
		if (!this.initPromise) {
			this.initPromise = new Promise((res, rej) => {
				this.resolve = res;
				this.reject = rej;
			});
		} else {
			await this.initPromise;
		}

		/**
		 * When provided, `sessionId` adds namespaces to the database name.
		 * This is used by Studio let customers manage multiple databases in
		 * the CMS in a single Studio user session.
		 *
		 * @see https://github.com/aws-amplify/amplify-js/pull/7304/files
		 */
		if (sessionId) {
			this.dbName = `${DB_NAME}-${sessionId}`;
		}

		this.schema = theSchema;
		this.namespaceResolver = namespaceResolver;
		this.modelInstanceCreator = modelInstanceCreator;
		this.getModelConstructorByModelName = getModelConstructorByModelName;

		try {
			if (!this.db) {
				const VERSION = 2;
				this.db = await idb.openDB(this.dbName, VERSION, {
					upgrade: async (db, oldVersion, newVersion, txn) => {
						if (oldVersion === 0) {
							Object.keys(theSchema.namespaces).forEach(namespaceName => {
								const namespace = theSchema.namespaces[namespaceName];

								Object.keys(namespace.models).forEach(modelName => {
									const storeName = this.getStorename(namespaceName, modelName);
									this.createObjectStoreForModel(
										db,
										namespaceName,
										storeName,
										modelName
									);
								});
							});

							return;
						}

						if (oldVersion === 1 && newVersion === 2) {
							try {
								for (const storeName of txn.objectStoreNames) {
									const origStore = txn.objectStore(storeName);

									// rename original store
									const tmpName = `tmp_${storeName}`;
									origStore.name = tmpName;

									// create new store with original name
									const newStore = db.createObjectStore(storeName, {
										keyPath: undefined,
										autoIncrement: true,
									});

									newStore.createIndex('byId', 'id', { unique: true });

									let cursor = await origStore.openCursor();
									let count = 0;

									// Copy data from original to new
									while (cursor && cursor.value) {
										// we don't pass key, since they are all new entries in the new store
										await newStore.put(cursor.value);

										cursor = await cursor.continue();
										count++;
									}

									// delete original
									db.deleteObjectStore(tmpName);

									logger.debug(`${count} ${storeName} records migrated`);
								}

								// add new models created after IndexedDB, but before migration
								// this case may happen when a user has not opened an app for
								// some time and a new model is added during that time
								Object.keys(theSchema.namespaces).forEach(namespaceName => {
									const namespace = theSchema.namespaces[namespaceName];
									const objectStoreNames = new Set(txn.objectStoreNames);

									Object.keys(namespace.models)
										.map(modelName => {
											return [
												modelName,
												this.getStorename(namespaceName, modelName),
											];
										})
										.filter(([, storeName]) => !objectStoreNames.has(storeName))
										.forEach(([modelName, storeName]) => {
											this.createObjectStoreForModel(
												db,
												namespaceName,
												storeName,
												modelName
											);
										});
								});
							} catch (error) {
								logger.error('Error migrating IndexedDB data', error);
								txn.abort();
								throw error;
							}

							return;
						}
					},
				});

				this.resolve();
			}
		} catch (error) {
			this.reject(error);
		}
	}

	/**
	 * Gets a single model instance from the database.
	 *
	 * Does not fully instantiate the record. This must still be done with
	 * `this.load()` prior to returning to the application.
	 *
	 * @param storeOrStoreName IDB object store or name to acquire one.
	 * @param id Record ID/PK to fetch.
	 * @returns Model DTO.
	 */
	private async _get<T>(
		storeOrStoreName: idb.IDBPObjectStore | string,
		id: string
	): Promise<T> {
		let index: idb.IDBPIndex;

		if (typeof storeOrStoreName === 'string') {
			const storeName = storeOrStoreName;
			index = this.db.transaction(storeName, 'readonly').store.index('byId');
		} else {
			const store = storeOrStoreName;
			index = store.index('byId');
		}

		const result = await index.get(id);

		return result;
	}

	/**
	 * @see Adapter
	 *
	 * @param model The model instance to save.
	 * @param condition The conditions under which the save should succeed.
	 * Omission attempts to save unconditionally.
	 * @returns The a tuple of the saved model and operation type
	 * (INSERT/UPDATE) needed to affect the save. The returned model
	 * includes the new `id` field if one had to be generated.
	 */
	async save<T extends PersistentModel>(
		model: T,
		condition?: ModelPredicate<T>
	): Promise<[T, OpType.INSERT | OpType.UPDATE][]> {
		await this.checkPrivate();
		const modelConstructor = Object.getPrototypeOf(model)
			.constructor as PersistentModelConstructor<T>;
		const storeName = this.getStorenameForModel(modelConstructor);
		const connectedModels = traverseModel(
			modelConstructor.name,
			model,
			this.schema.namespaces[this.namespaceResolver(modelConstructor)],
			this.modelInstanceCreator,
			this.getModelConstructorByModelName
		);
		const namespaceName = this.namespaceResolver(modelConstructor);

		const set = new Set<string>();
		const connectionStoreNames = Object.values(connectedModels).map(
			({ modelName, item, instance }) => {
				const storeName = this.getStorename(namespaceName, modelName);
				set.add(storeName);
				return { storeName, item, instance };
			}
		);

		const tx = this.db.transaction(
			[storeName, ...Array.from(set.values())],
			'readwrite'
		);
		const store = tx.objectStore(storeName);

		const fromDB = await this._get(store, model.id);

		if (condition && fromDB) {
			const predicates = ModelPredicateCreator.getPredicates(condition);
			const { predicates: predicateObjs, type } = predicates;

			const isValid = validatePredicate(fromDB, type, predicateObjs);

			if (!isValid) {
				const msg = 'Conditional update failed';
				logger.error(msg, { model: fromDB, condition: predicateObjs });

				throw new Error(msg);
			}
		}

		const result: [T, OpType.INSERT | OpType.UPDATE][] = [];

		for await (const resItem of connectionStoreNames) {
			const { storeName, item, instance } = resItem;
			const store = tx.objectStore(storeName);
			const { id } = item;

			const fromDB = <T>await this._get(store, id);
			const opType: OpType =
				fromDB === undefined ? OpType.INSERT : OpType.UPDATE;

			// Even if the parent is an INSERT, the child might not be, so we need to get its key
			if (id === model.id || opType === OpType.INSERT) {
				const key = await store.index('byId').getKey(item.id);
				await store.put(item, key);

				result.push([instance, opType]);
			}
		}

		await tx.done;

		return result;
	}

	/**
	 * Attaches related HAS_ONE and BELONGS_TO records (non-recursively / only
	 * ONE level deep) and instantiates a Model instance from the DTO.
	 *
	 * @param namespaceName The model namespace to extract schema info from.
	 * @param srcModelName The model type name to look for schema info from.
	 * @param records The instantiated Model records.
	 */
	private async load<T>(
		namespaceName: string,
		srcModelName: string,
		records: T[]
	): Promise<T[]> {
		const namespace = this.schema.namespaces[namespaceName];
		const relations = namespace.relationships[srcModelName].relationTypes;
		const connectionStoreNames = relations.map(({ modelName }) => {
			return this.getStorename(namespaceName, modelName);
		});
		const modelConstructor = this.getModelConstructorByModelName(
			namespaceName,
			srcModelName
		);

		if (connectionStoreNames.length === 0) {
			return records.map(record =>
				this.modelInstanceCreator(modelConstructor, record)
			);
		}

		const tx = this.db.transaction([...connectionStoreNames], 'readonly');

		// TODO: dive on this.

		for await (const relation of relations) {
			const { fieldName, modelName, targetName } = relation;
			const storeName = this.getStorename(namespaceName, modelName);
			const store = tx.objectStore(storeName);
			const modelConstructor = this.getModelConstructorByModelName(
				namespaceName,
				modelName
			);

			switch (relation.relationType) {
				case 'HAS_ONE':
					for await (const recordItem of records) {
						const getByfield = recordItem[targetName] ? targetName : fieldName;
						if (!recordItem[getByfield]) break;

						const connectionRecord = await this._get(
							store,
							recordItem[getByfield]
						);

						recordItem[fieldName] =
							connectionRecord &&
							this.modelInstanceCreator(modelConstructor, connectionRecord);
					}

					break;
				case 'BELONGS_TO':
					for await (const recordItem of records) {
						if (recordItem[targetName]) {
							const connectionRecord = await this._get(
								store,
								recordItem[targetName]
							);

							recordItem[fieldName] =
								connectionRecord &&
								this.modelInstanceCreator(modelConstructor, connectionRecord);
							delete recordItem[targetName];
						}
					}

					break;
				case 'HAS_MANY':
					// TODO: Lazy loading
					break;
				default:
					exhaustiveCheck(relation.relationType);
					break;
			}
		}

		return records.map(record =>
			this.modelInstanceCreator(modelConstructor, record)
		);
	}

	/**
	 * @see Adapter
	 * @param modelConstructor The model type to fetch.
	 * @param predicate The conditions to filter by.
	 * @param pagination The page start/size.
	 * @returns Array of model instances.
	 */
	async query<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		predicate?: ModelPredicate<T>,
		pagination?: PaginationInput<T>
	): Promise<T[]> {
		await this.checkPrivate();
		const storeName = this.getStorenameForModel(modelConstructor);
		const namespaceName = this.namespaceResolver(modelConstructor);

		const predicates =
			predicate && ModelPredicateCreator.getPredicates(predicate);
		const queryById = predicates && this.idFromPredicate(predicates);
		const hasSort = pagination && pagination.sort;
		const hasPagination = pagination && pagination.limit;

		// NOTE that `records` will not be fully instantiated
		const records: T[] = await (async () => {
			if (queryById) {
				const record = await this.getById(storeName, queryById);
				return record ? [record] : [];
			}

			if (predicates) {
				const filtered = await this.filterOnPredicate(storeName, predicates);
				return this.inMemoryPagination(filtered, pagination);
			}

			if (hasSort) {
				const all = await this.getAll(storeName);
				return this.inMemoryPagination(all, pagination);
			}

			if (hasPagination) {
				return this.enginePagination(storeName, pagination);
			}

			return this.getAll(storeName);
		})();

		return await this.load(namespaceName, modelConstructor.name, records);
	}

	/**
	 * Looks for a particular model instance by PK from a particular table.
	 *
	 * @see getStorename
	 *
	 * @param storeName Fully qualified name.
	 * @param id PK for the desired item.
	 * @returns A model instance.
	 */
	private async getById<T extends PersistentModel>(
		storeName: string,
		id: string
	): Promise<T> {
		const record = <T>await this._get(storeName, id);
		return record;
	}

	/**
	 * Gets all model instances from a table.
	 *
	 * Does not fully instantiate the records. This must still be done with
	 * `this.load()` on the objects prior to returning to the application.
	 *
	 * @param storeName Fully qualified name.
	 * @returns Array of model instances.
	 */
	private async getAll<T extends PersistentModel>(
		storeName: string
	): Promise<T[]> {
		return await this.db.getAll(storeName);
	}

	/**
	 * Extracts the ID values form a predicate if it is AND ON ONLY IS an ID
	 * equality predicate.
	 *
	 * For this:
	 *
	 * ```
	 * p => p.id('eq', 'abc')
	 * ```
	 *
	 * Returns `"abc"`.
	 *
	 * For any of these:
	 *
	 * ```
	 * p => p.id('gt', 'abc');
	 * p => p.id('eq', 'abc').otherField('eq', 'value');
	 * p => p.otherField('eq', 'value')
	 * ```
	 *
	 * Returns `false`.
	 *
	 * @param predicates The predicate to inspect.
	 * @returns The ID value or `false`
	 */
	private idFromPredicate<T extends PersistentModel>(
		predicates: PredicatesGroup<T>
	) {
		const { predicates: predicateObjs } = predicates;
		const idPredicate =
			predicateObjs.length === 1 &&
			(predicateObjs.find(
				p => isPredicateObj(p) && p.field === 'id' && p.operator === 'eq'
			) as PredicateObject<T>);

		return idPredicate && idPredicate.operand;
	}

	/**
	 * Returns the array of model instances from a table matching predicate.
	 *
	 * This implementation currently requires a full table scan for all
	 * predicates.
	 *
	 * NOTE: Automatic index leveraging is staged in the datastore-laziness
	 * branch and will be added when laziness is merged.
	 *
	 * @param storeName Fully qualified name.
	 * @param predicates A group of predicates to filter with.
	 * @returns Array of matching model instances.
	 */
	private async filterOnPredicate<T extends PersistentModel>(
		storeName: string,
		predicates: PredicatesGroup<T>
	) {
		const { predicates: predicateObjs, type } = predicates;

		const all = <T[]>await this.getAll(storeName);

		const filtered = predicateObjs
			? all.filter(m => validatePredicate(m, type, predicateObjs))
			: all;

		return filtered;
	}

	/**
	 * Paginates a set of records that is already loaded fully in memory.
	 *
	 * Used when the natural table sort order and/or a cursor cannot be used
	 * to accomplish the same.
	 *
	 * @param records Array of records to paginate.
	 * @param pagination Description of the page to fetch. Omit to fetch all.
	 * @returns The specified subset (page) from the records.
	 */
	private inMemoryPagination<T extends PersistentModel>(
		records: T[],
		pagination?: PaginationInput<T>
	): T[] {
		if (pagination && records.length > 1) {
			if (pagination.sort) {
				const sortPredicates = ModelSortPredicateCreator.getPredicates(
					pagination.sort
				);

				if (sortPredicates.length) {
					const compareFn = sortCompareFunction(sortPredicates);
					records.sort(compareFn);
				}
			}

			const { page = 0, limit = 0 } = pagination;
			const start = Math.max(0, page * limit) || 0;

			const end = limit > 0 ? start + limit : records.length;

			return records.slice(start, end);
		}
		return records;
	}

	/**
	 * Paginates records from IndexeDB that have not been loaded yet.
	 *
	 * Used when the natural table sort order and a cursor is capable of
	 * producing the desired pagination.
	 *
	 * SIDE EFFECT:
	 * 1. Creates a local transaction.
	 *
	 * @param storeName Fully qualified name.
	 * @param pagination Description of page to fetch. Omit to fetch all.
	 * @returns The specified subset (page) from the records.
	 */
	private async enginePagination<T extends PersistentModel>(
		storeName: string,
		pagination?: PaginationInput<T>
	): Promise<T[]> {
		let result: T[];

		if (pagination) {
			const { page = 0, limit = 0 } = pagination;
			const initialRecord = Math.max(0, page * limit) || 0;

			let cursor = await this.db
				.transaction(storeName)
				.objectStore(storeName)
				.openCursor();

			if (cursor && initialRecord > 0) {
				await cursor.advance(initialRecord);
			}

			const pageResults: T[] = [];
			const hasLimit = typeof limit === 'number' && limit > 0;

			while (cursor && cursor.value) {
				pageResults.push(cursor.value);

				if (hasLimit && pageResults.length === limit) {
					break;
				}

				cursor = await cursor.continue();
			}

			result = pageResults;
		} else {
			result = <T[]>await this.db.getAll(storeName);
		}

		return result;
	}

	/**
	 * @see Adapter
	 * @param modelConstructor The model type to look for.
	 * @param firstOrLast Whether to grab the first or last item in PK order.
	 * @returns A single model instance or `undefined`
	 */
	async queryOne<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		firstOrLast: QueryOne = QueryOne.FIRST
	): Promise<T | undefined> {
		await this.checkPrivate();
		const storeName = this.getStorenameForModel(modelConstructor);

		const cursor = await this.db
			.transaction([storeName], 'readonly')
			.objectStore(storeName)
			.openCursor(undefined, firstOrLast === QueryOne.FIRST ? 'next' : 'prev');

		const result = cursor ? <T>cursor.value : undefined;

		return result && this.modelInstanceCreator(modelConstructor, result);
	}

	/**
	 * @see Adapter
	 *
	 * @param modelOrConstructor The model or model instance to delete.
	 * @param condition The conditions under which the delete should succeed.
	 * Omit to attempt to delete unconditionally. An unconditional delete
	 * @returns A tuple of the model(s) attempted for deletion and the model(s)
	 * actually deleted.
	 */
	async delete<T extends PersistentModel>(
		modelOrModelConstructor: T | PersistentModelConstructor<T>,
		condition?: ModelPredicate<T>
	): Promise<[T[], T[]]> {
		await this.checkPrivate();
		const deleteQueue: { storeName: string; items: T[] }[] = [];

		if (isModelConstructor(modelOrModelConstructor)) {
			const modelConstructor = modelOrModelConstructor;
			const nameSpace = this.namespaceResolver(modelConstructor);

			const storeName = this.getStorenameForModel(modelConstructor);

			const models = await this.query(modelConstructor, condition);
			const relations =
				this.schema.namespaces[nameSpace].relationships[modelConstructor.name]
					.relationTypes;

			if (condition !== undefined) {
				await this.deleteTraverse(
					relations,
					models,
					modelConstructor.name,
					nameSpace,
					deleteQueue
				);

				await this.deleteItem(deleteQueue);

				const deletedModels = deleteQueue.reduce(
					(acc, { items }) => acc.concat(items),
					<T[]>[]
				);

				return [models, deletedModels];
			} else {
				await this.deleteTraverse(
					relations,
					models,
					modelConstructor.name,
					nameSpace,
					deleteQueue
				);

				// Delete all
				await this.db
					.transaction([storeName], 'readwrite')
					.objectStore(storeName)
					.clear();

				const deletedModels = deleteQueue.reduce(
					(acc, { items }) => acc.concat(items),
					<T[]>[]
				);

				return [models, deletedModels];
			}
		} else {
			const model = modelOrModelConstructor;

			const modelConstructor = Object.getPrototypeOf(model)
				.constructor as PersistentModelConstructor<T>;
			const nameSpace = this.namespaceResolver(modelConstructor);

			const storeName = this.getStorenameForModel(modelConstructor);

			if (condition) {
				const tx = this.db.transaction([storeName], 'readwrite');
				const store = tx.objectStore(storeName);

				const fromDB = await this._get(store, model.id);

				if (fromDB === undefined) {
					const msg = 'Model instance not found in storage';
					logger.warn(msg, { model });

					return [[model], []];
				}

				const predicates = ModelPredicateCreator.getPredicates(condition);
				const { predicates: predicateObjs, type } = predicates;

				const isValid = validatePredicate(fromDB, type, predicateObjs);

				if (!isValid) {
					const msg = 'Conditional update failed';
					logger.error(msg, { model: fromDB, condition: predicateObjs });

					throw new Error(msg);
				}
				await tx.done;

				const relations =
					this.schema.namespaces[nameSpace].relationships[modelConstructor.name]
						.relationTypes;

				await this.deleteTraverse(
					relations,
					[model],
					modelConstructor.name,
					nameSpace,
					deleteQueue
				);
			} else {
				const relations =
					this.schema.namespaces[nameSpace].relationships[modelConstructor.name]
						.relationTypes;

				await this.deleteTraverse(
					relations,
					[model],
					modelConstructor.name,
					nameSpace,
					deleteQueue
				);
			}

			await this.deleteItem(deleteQueue);

			const deletedModels = deleteQueue.reduce(
				(acc, { items }) => acc.concat(items),
				<T[]>[]
			);

			return [[model], deletedModels];
		}
	}

	/**
	 * Deletes all items in the given queue **in-order**.
	 *
	 * It is expected that the given queue be given in toplogical order.
	 *
	 * SIDE EFFECT:
	 * 1. Creates a transaction against the database.
	 * 1. Changes database state/data.
	 *
	 * @param deleteQueue
	 */
	private async deleteItem<T extends PersistentModel>(
		deleteQueue?: { storeName: string; items: T[] | IDBValidKey[] }[]
	) {
		const connectionStoreNames = deleteQueue.map(({ storeName }) => {
			return storeName;
		});

		const tx = this.db.transaction([...connectionStoreNames], 'readwrite');
		for await (const deleteItem of deleteQueue) {
			const { storeName, items } = deleteItem;
			const store = tx.objectStore(storeName);

			for await (const item of items) {
				if (item) {
					let key: IDBValidKey;

					if (typeof item === 'object') {
						key = await store.index('byId').getKey(item['id']);
					} else {
						key = await store.index('byId').getKey(item.toString());
					}

					if (key !== undefined) {
						await store.delete(key);
					}
				}
			}
		}
	}

	/**
	 * Recursively collects a list of model instances that would need to be
	 * deleted in addition to the *given* model records in order to maintain
	 * referential integrity. Traversal is performed in a depth-first manner to
	 * ensure items the `deleteQueue` is left in topological sort order.
	 *
	 * @todo Factor `relations` out of the signature *or* remove redundant
	 * "relations" discovery internally.
	 *
	 * `relations` is passed in from a line that *consistently* looks like
	 * this:
	 *
	 * ```
	 * const relations =
	 * 	this.schema.namespaces[nameSpace].relationships[modelConstructor.name]
	 * 		.relationTypes;
	 * ```
	 *
	 * This *appears* redundant, as this lookup is repeated internally for each
	 * given relationship. If this is not actually redundant, replace this TODO
	 * with an explanation as to why this is not actually redudant.
	 *
	 * @param relations The list of relations to treverse when looking for
	 * models that would break referential integrity.
	 * @param models The model instances in queue to be deleted.
	 * @param srcModel The name of the source model.
	 * @param nameSpace The namespace of the source model.
	 * @param deleteQueue A queue to accumulate items that will need to be
	 * deleted in order to perform a full, referentially consistent delete.
	 */
	private async deleteTraverse<T extends PersistentModel>(
		relations: RelationType[],
		models: T[],
		srcModel: string,
		nameSpace: string,
		deleteQueue: { storeName: string; items: T[] }[]
	): Promise<void> {
		// Traverse first to put child items in the queue first and therefore
		// maintain a topological order of items in the queue.
		for await (const rel of relations) {
			const { relationType, fieldName, modelName, targetName } = rel;
			const storeName = this.getStorename(nameSpace, modelName);

			const index: string =
				getIndex(
					this.schema.namespaces[nameSpace].relationships[modelName]
						.relationTypes,
					srcModel
				) ||
				// if we were unable to find an index via relationTypes
				// i.e. for keyName connections, attempt to find one by the
				// associatedWith property
				getIndexFromAssociation(
					this.schema.namespaces[nameSpace].relationships[modelName].indexes,
					rel.associatedWith
				);

			switch (relationType) {
				case 'HAS_ONE':
					for await (const model of models) {
						const hasOneIndex = index || 'byId';

						const hasOneCustomField = targetName in model;
						const value = hasOneCustomField ? model[targetName] : model.id;
						if (!value) break;

						const recordToDelete = <T>(
							await this.db
								.transaction(storeName, 'readwrite')
								.objectStore(storeName)
								.index(hasOneIndex)
								.get(value)
						);

						await this.deleteTraverse(
							this.schema.namespaces[nameSpace].relationships[modelName]
								.relationTypes,
							recordToDelete ? [recordToDelete] : [],
							modelName,
							nameSpace,
							deleteQueue
						);
					}
					break;
				case 'HAS_MANY':
					for await (const model of models) {
						const childrenArray = await this.db
							.transaction(storeName, 'readwrite')
							.objectStore(storeName)
							.index(index)
							.getAll(model['id']);

						await this.deleteTraverse(
							this.schema.namespaces[nameSpace].relationships[modelName]
								.relationTypes,
							childrenArray,
							modelName,
							nameSpace,
							deleteQueue
						);
					}
					break;
				case 'BELONGS_TO':
					// Intentionally blank
					break;
				default:
					exhaustiveCheck(relationType);
					break;
			}
		}

		// Remember, we want a topologically sorted queue:
		// Now that children have been visited, we can add the current model(s)
		// to the queue.

		// We map the records to full model instances because `deleteQueue`
		// processing is a collection of mixed model types. This instantiation
		// allows `deleteQueue` processing to interrogate each item to determine
		// where and how to delete it.
		deleteQueue.push({
			storeName: this.getStorename(nameSpace, srcModel),
			items: models.map(record =>
				this.modelInstanceCreator(
					this.getModelConstructorByModelName(nameSpace, srcModel),
					record
				)
			),
		});
	}

	/**
	 * @see Adapter
	 */
	async clear(): Promise<void> {
		await this.checkPrivate();

		this.db.close();

		await idb.deleteDB(this.dbName);

		this.db = undefined;
		this.initPromise = undefined;
	}

	/**
	 * @see Adapter
	 *
	 * @param modelConstructor Model type to save.
	 * @param items Array of items to save.
	 * @returns Array of tuples like [SavedItem, SaveOperation][]
	 */
	async batchSave<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<any>,
		items: ModelInstanceMetadata[]
	): Promise<[T, OpType][]> {
		if (items.length === 0) {
			return [];
		}

		await this.checkPrivate();

		const result: [T, OpType][] = [];

		const storeName = this.getStorenameForModel(modelConstructor);

		const txn = this.db.transaction(storeName, 'readwrite');
		const store = txn.store;

		for (const item of items) {
			const connectedModels = traverseModel(
				modelConstructor.name,
				this.modelInstanceCreator(modelConstructor, item),
				this.schema.namespaces[this.namespaceResolver(modelConstructor)],
				this.modelInstanceCreator,
				this.getModelConstructorByModelName
			);

			const { id, _deleted } = item;
			const index = store.index('byId');
			const key = await index.getKey(id);

			if (!_deleted) {
				const { instance } = connectedModels.find(
					({ instance }) => instance.id === id
				);

				result.push([
					<T>(<unknown>instance),
					key ? OpType.UPDATE : OpType.INSERT,
				]);
				await store.put(instance, key);
			} else {
				result.push([<T>(<unknown>item), OpType.DELETE]);

				if (key) {
					await store.delete(key);
				}
			}
		}

		await txn.done;

		return result;
	}

	/**
	 * Creates a new namespaced table against the given adapter, and then
	 * inspects the schema for relevant indexes to create on the table and
	 * creates them.
	 *
	 * NOTE:
	 * 1. Schema is not provided. It must exist at `this.schema`.
	 * 1. `storeName` appears to be given for historical reasons; could likely
	 * be factored out.
	 *
	 * SIDE EFFECT:
	 * 1. Changes storage adapter state/structure.
	 *
	 * @param db IndexedDB database (adapted) to operate against.
	 * @param namespaceName Namespace for the table.
	 * @param storeName Fully qualified name.
	 * @param modelName The name of the model type.
	 */
	private async createObjectStoreForModel(
		db: idb.IDBPDatabase,
		namespaceName: string,
		storeName: string,
		modelName: string
	) {
		const store = db.createObjectStore(storeName, {
			autoIncrement: true,
		});

		const indexes =
			this.schema.namespaces[namespaceName].relationships[modelName].indexes;
		indexes.forEach(index => store.createIndex(index, index));

		store.createIndex('byId', 'id', { unique: true });
	}
}

export default new IndexedDBAdapter();
