import { ConsoleLogger as Logger } from '@aws-amplify/core';
import * as idb from 'idb';
import {
	isPredicateObj,
	isPredicateGroup,
	ModelInstanceMetadata,
	ModelPredicate,
	OpType,
	PaginationInput,
	PersistentModel,
	PersistentModelConstructor,
	PredicateObject,
	PredicatesGroup,
	QueryOne,
} from '../../types';
import {
	isPrivateMode,
	traverseModel,
	validatePredicate,
	inMemoryPagination,
	keysEqual,
	getStorename,
	isSafariCompatabilityMode,
} from '../../util';
import { StorageAdapterBase } from './StorageAdapterBase';

const logger = new Logger('DataStore');

/**
 * The point after which queries composed of multiple simple OR conditions
 * should scan-and-filter instead of individual queries for each condition.
 *
 * At some point, this should be configurable and/or dynamic based on table
 * size and possibly even on observed average seek latency. For now, it's
 * based on an manual "binary search" for the breakpoint as measured in the
 * unit test suite. This isn't necessarily optimal. But, it's at least derived
 * empirically, rather than theoretically and without any verification!
 *
 * REMEMBER! If you run more realistic benchmarks and update this value, update
 * this comment so the validity and accuracy of future query tuning exercises
 * can be compared to the methods used to derive the current value. E.g.,
 *
 * 1. In browser benchmark > unit test benchmark
 * 2. Multi-browser benchmark > single browser benchmark
 * 3. Benchmarks of various table sizes > static table size benchmark
 *
 * etc...
 *
 */
const MULTI_OR_CONDITION_SCAN_BREAKPOINT = 7;
//
const DB_VERSION = 3;

class IndexedDBAdapter extends StorageAdapterBase {
	protected db!: idb.IDBPDatabase;
	private safariCompatabilityMode: boolean = false;

	// checks are called by StorageAdapterBase class
	protected async preSetUpChecks() {
		await this.checkPrivate();
		await this.setSafariCompatabilityMode();
	}

	protected async preOpCheck() {
		await this.checkPrivate();
	}

	/**
	 * Initialize IndexedDB database
	 * Create new DB if one doesn't exist
	 * Upgrade outdated DB
	 *
	 * Called by `StorageAdapterBase.setUp()`
	 *
	 * @returns IDB Database instance
	 */
	protected async initDb(): Promise<idb.IDBPDatabase> {
		return await idb.openDB(this.dbName, DB_VERSION, {
			upgrade: async (db, oldVersion, newVersion, txn) => {
				// create new database
				if (oldVersion === 0) {
					Object.keys(this.schema.namespaces).forEach(namespaceName => {
						const namespace = this.schema.namespaces[namespaceName];

						Object.keys(namespace.models).forEach(modelName => {
							const storeName = getStorename(namespaceName, modelName);
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

				// migrate existing database to latest schema
				if ((oldVersion === 1 || oldVersion === 2) && newVersion === 3) {
					try {
						for (const storeName of txn.objectStoreNames) {
							const origStore = txn.objectStore(storeName);

							// rename original store
							const tmpName = `tmp_${storeName}`;
							origStore.name = tmpName;

							const { namespaceName, modelName } =
								this.getNamespaceAndModelFromStorename(storeName);

							const modelInCurrentSchema =
								modelName in this.schema.namespaces[namespaceName].models;

							if (!modelInCurrentSchema) {
								// delete original
								db.deleteObjectStore(tmpName);
								continue;
							}

							const newStore = this.createObjectStoreForModel(
								db,
								namespaceName,
								storeName,
								modelName
							);

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
						Object.keys(this.schema.namespaces).forEach(namespaceName => {
							const namespace = this.schema.namespaces[namespaceName];
							const objectStoreNames = new Set(txn.objectStoreNames);

							Object.keys(namespace.models)
								.map(modelName => {
									return [modelName, getStorename(namespaceName, modelName)];
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
	}

	protected async _get<T>(
		storeOrStoreName: idb.IDBPObjectStore | string,
		keyArr: string[]
	): Promise<T> {
		let index: idb.IDBPIndex;

		if (typeof storeOrStoreName === 'string') {
			const storeName = storeOrStoreName;
			index = this.db.transaction(storeName, 'readonly').store.index('byPk');
		} else {
			const store = storeOrStoreName;
			index = store.index('byPk');
		}

		const result = await index.get(this.canonicalKeyPath(keyArr));

		return <T>result;
	}

	async clear(): Promise<void> {
		await this.checkPrivate();

		this.db?.close();
		await idb.deleteDB(this.dbName);

		this.db = undefined!;
		this.initPromise = undefined!;
	}

	async save<T extends PersistentModel>(
		model: T,
		condition?: ModelPredicate<T>
	): Promise<[T, OpType.INSERT | OpType.UPDATE][]> {
		await this.checkPrivate();

		const { storeName, set, connectionStoreNames, modelKeyValues } =
			this.saveMetadata(model);

		const tx = this.db.transaction(
			[storeName, ...Array.from(set.values())],
			'readwrite'
		);

		const store = tx.objectStore(storeName);
		const fromDB = await this._get(store, modelKeyValues);

		this.validateSaveCondition(condition, fromDB);

		const result: [T, OpType.INSERT | OpType.UPDATE][] = [];
		for await (const resItem of connectionStoreNames) {
			const { storeName, item, instance, keys } = resItem;
			const store = tx.objectStore(storeName);

			const itemKeyValues: string[] = keys.map(key => item[key]);

			const fromDB = <T>await this._get(store, itemKeyValues);
			const opType: OpType = fromDB ? OpType.UPDATE : OpType.INSERT;

			if (
				keysEqual(itemKeyValues, modelKeyValues) ||
				opType === OpType.INSERT
			) {
				const key = await store
					.index('byPk')
					.getKey(this.canonicalKeyPath(itemKeyValues));
				await store.put(item, key);
				result.push([instance, opType]);
			}
		}
		await tx.done;

		return result;
	}

	async query<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		predicate?: ModelPredicate<T>,
		pagination?: PaginationInput<T>
	): Promise<T[]> {
		await this.checkPrivate();
		const {
			storeName,
			namespaceName,
			queryByKey,
			predicates,
			hasSort,
			hasPagination,
		} = this.queryMetadata(modelConstructor, predicate, pagination);

		const records: T[] = (await (async () => {
			//
			// NOTE: @svidgen explored removing this and letting query() take care of automatic
			// index leveraging. This would eliminate some amount of very similar code.
			// But, getAll is slightly slower than get()
			//
			// On Chrome:
			//   ~700ms vs ~1175ms per 10k reads.
			//
			// You can (and should) check my work here:
			// 	https://gist.github.com/svidgen/74e55d573b19c3e5432b1b5bdf0f4d96
			//
			if (queryByKey) {
				const record = await this.getByKey(storeName, queryByKey);
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
		})()) as T[];

		return await this.load(namespaceName, modelConstructor.name, records);
	}

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

	async batchSave<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<any>,
		items: ModelInstanceMetadata[]
	): Promise<[T, OpType][]> {
		await this.checkPrivate();

		if (items.length === 0) {
			return [];
		}

		const modelName = modelConstructor.name;
		const namespaceName = this.namespaceResolver(modelConstructor);
		const storeName = this.getStorenameForModel(modelConstructor);
		const result: [T, OpType][] = [];

		const txn = this.db.transaction(storeName, 'readwrite');
		const store = txn.store;

		for (const item of items) {
			const model = this.modelInstanceCreator(modelConstructor, item);

			const connectedModels = traverseModel(
				modelName,
				model,
				this.schema.namespaces[namespaceName],
				this.modelInstanceCreator,
				this.getModelConstructorByModelName!
			);

			const keyValues = this.getIndexKeyValuesFromModel(model);
			const { _deleted } = item;

			const index = store.index('byPk');

			const key = await index.getKey(this.canonicalKeyPath(keyValues));

			if (!_deleted) {
				const { instance } = connectedModels.find(({ instance }) => {
					const instanceKeyValues = this.getIndexKeyValuesFromModel(instance);
					return keysEqual(instanceKeyValues, keyValues);
				})!;

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

	protected async deleteItem<T extends PersistentModel>(
		deleteQueue: {
			storeName: string;
			items: T[] | IDBValidKey[];
		}[]
	) {
		const connectionStoreNames = deleteQueue!.map(({ storeName }) => {
			return storeName;
		});

		const tx = this.db.transaction([...connectionStoreNames], 'readwrite');
		for await (const deleteItem of deleteQueue!) {
			const { storeName, items } = deleteItem;
			const store = tx.objectStore(storeName);

			for await (const item of items) {
				if (item) {
					let key: IDBValidKey | undefined;

					if (typeof item === 'object') {
						const keyValues = this.getIndexKeyValuesFromModel(item as T);
						key = await store
							.index('byPk')
							.getKey(this.canonicalKeyPath(keyValues));
					} else {
						const itemKey = item.toString();
						key = await store.index('byPk').getKey(itemKey);
					}

					if (key !== undefined) {
						await store.delete(key);
					}
				}
			}
		}
	}

	//#region platform-specific helper methods

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
	 * Whether the browser's implementation of IndexedDB is coercing single-field
	 * indexes to a scalar key.
	 *
	 * If this returns `true`, we need to treat indexes containing a single field
	 * as scalars.
	 *
	 * See PR description for reference:
	 * https://github.com/aws-amplify/amplify-js/pull/10527
	 */
	private async setSafariCompatabilityMode() {
		this.safariCompatabilityMode = await isSafariCompatabilityMode();

		if (this.safariCompatabilityMode === true) {
			logger.debug('IndexedDB Adapter is running in Safari Compatability Mode');
		}
	}

	private getNamespaceAndModelFromStorename(storeName: string) {
		const [namespaceName, ...modelNameArr] = storeName.split('_');
		return {
			namespaceName,
			modelName: modelNameArr.join('_'),
		};
	}

	private createObjectStoreForModel(
		db: idb.IDBPDatabase,
		namespaceName: string,
		storeName: string,
		modelName: string
	): idb.IDBPObjectStore {
		const store = db.createObjectStore(storeName, {
			autoIncrement: true,
		});

		const { indexes } =
			this.schema.namespaces[namespaceName].relationships![modelName];

		indexes.forEach(([idxName, keyPath, options]) => {
			store.createIndex(idxName, keyPath, options);
		});

		return store;
	}

	private async getByKey<T extends PersistentModel>(
		storeName: string,
		keyValue: string[]
	): Promise<T> {
		return <T>await this._get(storeName, keyValue);
	}

	private async getAll<T extends PersistentModel>(
		storeName: string
	): Promise<T[]> {
		return await this.db.getAll(storeName);
	}

	/**
	 * Tries to generate an index fetcher for the given predicates. Assumes
	 * that the given predicate conditions are contained by an AND group and
	 * should therefore all match a single record.
	 *
	 * @param storeName The table to query.
	 * @param predicates The predicates to try to AND together.
	 * @param transaction
	 */
	private matchingIndexQueries<T extends PersistentModel>(
		storeName: string,
		predicates: PredicateObject<T>[],
		transaction: idb.IDBPTransaction<unknown, [string]>
	) {
		// could be expanded later to include `exec()` and a `cardinality` estimate?
		const queries: (() => Promise<T[]>)[] = [];

		const predicateIndex = new Map<string, PredicateObject<T>>();
		for (const predicate of predicates) {
			predicateIndex.set(String(predicate.field), predicate);
		}

		const store = transaction.objectStore(storeName);
		for (const name of store.indexNames) {
			const idx = store.index(name);
			const keypath = Array.isArray(idx.keyPath) ? idx.keyPath : [idx.keyPath];
			const matchingPredicateValues: (string | number)[] = [];

			for (const field of keypath) {
				const p = predicateIndex.get(field);
				if (p && p.operand !== null && p.operand !== undefined) {
					matchingPredicateValues.push(p.operand);
				} else {
					break;
				}
			}

			// if we have a matching predicate field for each component of this index,
			// we can build a query for it. otherwise, we can't.
			if (matchingPredicateValues.length === keypath.length) {
				// re-create a transaction, because the transaction used to fetch the
				// indexes may no longer be active.
				queries.push(() =>
					this.db
						.transaction(storeName)
						.objectStore(storeName)
						.index(name)
						.getAll(this.canonicalKeyPath(matchingPredicateValues))
				);
			}
		}

		return queries;
	}

	private async baseQueryIndex<T extends PersistentModel>(
		storeName: string,
		predicates: PredicatesGroup<T>,
		transaction?: idb.IDBPTransaction<unknown, [string]> | undefined
	) {
		let { predicates: predicateObjs, type } = predicates;

		// the predicate objects we care about tend to be nested at least
		// one level down: `{and: {or: {and: { <the predicates we want> }}}}`
		// so, we unpack and/or groups until we find a group with more than 1
		// child OR a child that is not a group (and is therefore a predicate "object").
		while (
			predicateObjs.length === 1 &&
			isPredicateGroup(predicateObjs[0]) &&
			(predicateObjs[0] as PredicatesGroup<T>).type !== 'not'
		) {
			type = (predicateObjs[0] as PredicatesGroup<T>).type;
			predicateObjs = (predicateObjs[0] as PredicatesGroup<T>).predicates;
		}

		const fieldPredicates = predicateObjs.filter(
			p => isPredicateObj(p) && p.operator === 'eq'
		) as PredicateObject<T>[];

		// several sub-queries could occur here. explicitly start a txn here to avoid
		// opening/closing multiple txns.
		const txn = transaction || this.db.transaction(storeName);

		let result = {} as {
			groupType: typeof type | null;
			indexedQueries: (() => Promise<T[]>)[];
		};

		// `or` conditions, if usable, need to generate multiple queries. this is unlike
		// `and` conditions, which should just be combined.
		if (type === 'or') {
			/**
			 * Base queries for each child group.
			 *
			 * For each child group, if it's an AND condition that results in a single
			 * subordinate "base query", we can use it. if it's any more complicated
			 * than that, it's not a simple join condition we want to use.
			 */
			const groupQueries = await Promise.all(
				predicateObjs
					.filter(o => isPredicateGroup(o) && o.type === 'and')
					.map(o =>
						this.baseQueryIndex(storeName, o as PredicatesGroup<T>, txn)
					)
			).then(queries =>
				queries
					.filter(q => q.indexedQueries.length === 1)
					.map(i => i.indexedQueries)
			);

			/**
			 * Base queries for each simple child "object" (field condition).
			 */
			const objectQueries = predicateObjs
				.filter(o => isPredicateObj(o))
				.map(o =>
					this.matchingIndexQueries(storeName, [o as PredicateObject<T>], txn)
				);

			const indexedQueries = [...groupQueries, ...objectQueries]
				.map(q => q[0])
				.filter(i => i);

			// if, after hunting for base queries, we don't have exactly 1 base query
			// for each child group + object, stop trying to optimize. we're not dealing
			// with a simple query that fits the intended optimization path.
			if (predicateObjs.length > indexedQueries.length) {
				result = {
					groupType: null,
					indexedQueries: [] as (() => Promise<T[]>)[],
				};
			} else {
				result = {
					groupType: 'or',
					indexedQueries,
				};
			}
		} else if (type === 'and') {
			// our potential indexes or lacks thereof.
			// note that we're only optimizing for `eq` right now.
			result = {
				groupType: type,
				indexedQueries: this.matchingIndexQueries(
					storeName,
					fieldPredicates,
					txn
				),
			};
		} else {
			result = {
				groupType: null,
				indexedQueries: [],
			};
		}

		// Explicitly wait for txns from index queries to complete before proceding.
		// This helps ensure IndexedDB is in a stable, ready state. Else, subseqeuent
		// qeuries can sometimes appear to deadlock (at least in FakeIndexedDB).
		// (Unless we were *given* the transaction -- we'll assume the parent handles it.)
		if (!transaction) await txn.done;

		return result;
	}

	private async filterOnPredicate<T extends PersistentModel>(
		storeName: string,
		predicates: PredicatesGroup<T>
	) {
		const { predicates: predicateObjs, type } = predicates;

		const { groupType, indexedQueries } = await this.baseQueryIndex(
			storeName,
			predicates
		);

		// where we'll accumulate candidate results, which will be filtered at the end.
		let candidateResults: T[];

		// semi-naive implementation:
		if (groupType === 'and' && indexedQueries.length > 0) {
			// each condition must be satsified, we can form a base set with any
			// ONE of those conditions and then filter.
			candidateResults = await indexedQueries[0]();
		} else if (
			groupType === 'or' &&
			indexedQueries.length > 0 &&
			indexedQueries.length <= MULTI_OR_CONDITION_SCAN_BREAKPOINT
		) {
			// NOTE: each condition implies a potentially distinct set. we only benefit
			// from using indexes here if EVERY condition uses an index. if any one
			// index requires a table scan, we gain nothing from the indexes.
			// NOTE: results must be DISTINCT-ified if we leverage indexes.
			const distinctResults = new Map<string, T>();
			for (const query of indexedQueries) {
				const resultGroup = await query();
				for (const item of resultGroup) {
					const distinctificationString = JSON.stringify(item);
					distinctResults.set(distinctificationString, item);
				}
			}

			// we could conceivably check for special conditions and return early here.
			// but, this is simpler and has not yet had a measurable performance impact.
			candidateResults = Array.from(distinctResults.values());
		} else {
			// nothing intelligent we can do with `not` groups unless or until we start
			// smashing comparison operators against indexes -- at which point we could
			// perform some reversal here.
			candidateResults = <T[]>await this.getAll(storeName);
		}

		const filtered = predicateObjs
			? candidateResults.filter(m => validatePredicate(m, type, predicateObjs))
			: candidateResults;

		return filtered;
	}

	private inMemoryPagination<T extends PersistentModel>(
		records: T[],
		pagination?: PaginationInput<T>
	): T[] {
		return inMemoryPagination(records, pagination);
	}

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
	 * Checks the given path against the browser's IndexedDB implementation for
	 * necessary compatibility transformations, applying those transforms if needed.
	 *
	 * @param `keyArr` strings to compatibilize for browser-indexeddb index operations
	 * @returns An array or string, depending on and given key,
	 * that is ensured to be compatible with the IndexedDB implementation's nuances.
	 */
	private canonicalKeyPath = (keyArr: (string | number)[]) => {
		if (this.safariCompatabilityMode) {
			return keyArr.length > 1 ? keyArr : keyArr[0];
		}
		return keyArr;
	};
	//#endregion
}

export default new IndexedDBAdapter();
