import { ConsoleLogger as Logger } from '@aws-amplify/core';
import * as idb from 'idb';
import { ModelInstanceCreator } from '../../datastore/datastore';
import { ModelPredicateCreator } from '../../predicates';
import {
	InternalSchema,
	isPredicateObj,
	isPredicateGroup,
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
	getIndex,
	getIndexFromAssociation,
	isModelConstructor,
	isPrivateMode,
	traverseModel,
	validatePredicate,
	inMemoryPagination,
	NAMESPACES,
	keysEqual,
	getStorename,
	getIndexKeys,
	extractPrimaryKeyValues,
	isSafariCompatabilityMode,
} from '../../util';
import { Adapter } from './index';

const logger = new Logger('DataStore');

const DB_NAME = 'amplify-datastore';
class IndexedDBAdapter implements Adapter {
	private schema!: InternalSchema;
	private namespaceResolver!: NamespaceResolver;
	private modelInstanceCreator!: ModelInstanceCreator;
	private getModelConstructorByModelName?: (
		namsespaceName: NAMESPACES,
		modelName: string
	) => PersistentModelConstructor<any>;
	private db!: idb.IDBPDatabase;
	private initPromise!: Promise<void>;
	private resolve!: (value?: any) => void;
	private reject!: (value?: any) => void;
	private dbName: string = DB_NAME;
	private safariCompatabilityMode: boolean = false;

	private getStorenameForModel(
		modelConstructor: PersistentModelConstructor<any>
	) {
		const namespace = this.namespaceResolver(modelConstructor);
		const { name: modelName } = modelConstructor;

		return getStorename(namespace, modelName);
	}

	// Retrieves primary key values from a model
	private getIndexKeyValuesFromModel<T extends PersistentModel>(
		model: T
	): string[] {
		const modelConstructor = Object.getPrototypeOf(model)
			.constructor as PersistentModelConstructor<T>;
		const namespaceName = this.namespaceResolver(modelConstructor);

		const keys = getIndexKeys(
			this.schema.namespaces[namespaceName],
			modelConstructor.name
		);

		return extractPrimaryKeyValues(model, keys);
	}

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

	async setUp(
		theSchema: InternalSchema,
		namespaceResolver: NamespaceResolver,
		modelInstanceCreator: ModelInstanceCreator,
		getModelConstructorByModelName: (
			namsespaceName: NAMESPACES,
			modelName: string
		) => PersistentModelConstructor<any>,
		sessionId?: string
	) {
		await this.checkPrivate();
		await this.setSafariCompatabilityMode();

		if (!this.initPromise) {
			this.initPromise = new Promise((res, rej) => {
				this.resolve = res;
				this.reject = rej;
			});
		} else {
			await this.initPromise;
		}
		if (sessionId) {
			this.dbName = `${DB_NAME}-${sessionId}`;
		}
		this.schema = theSchema;
		this.namespaceResolver = namespaceResolver;
		this.modelInstanceCreator = modelInstanceCreator;
		this.getModelConstructorByModelName = getModelConstructorByModelName;

		try {
			if (!this.db) {
				const VERSION = 3;
				this.db = await idb.openDB(this.dbName, VERSION, {
					upgrade: async (db, oldVersion, newVersion, txn) => {
						if (oldVersion === 0) {
							Object.keys(theSchema.namespaces).forEach(namespaceName => {
								const namespace = theSchema.namespaces[namespaceName];

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

						if ((oldVersion === 1 || oldVersion === 2) && newVersion === 3) {
							try {
								for (const storeName of txn.objectStoreNames) {
									const origStore = txn.objectStore(storeName);

									// rename original store
									const tmpName = `tmp_${storeName}`;
									origStore.name = tmpName;

									const { namespaceName, modelName } =
										this.getNamespaceAndModelFromStorename(storeName);

									const storeExists = !!Object.values(
										this.schema.namespaces[namespaceName].models
									)?.find(m => m.name === modelName);

									if (!storeExists) {
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
								Object.keys(theSchema.namespaces).forEach(namespaceName => {
									const namespace = theSchema.namespaces[namespaceName];
									const objectStoreNames = new Set(txn.objectStoreNames);

									Object.keys(namespace.models)
										.map(modelName => {
											return [
												modelName,
												getStorename(namespaceName, modelName),
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

	private async _get<T>(
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

		return result;
	}

	async save<T extends PersistentModel>(
		model: T,
		condition?: ModelPredicate<T>
	): Promise<[T, OpType.INSERT | OpType.UPDATE][]> {
		await this.checkPrivate();
		const modelConstructor = Object.getPrototypeOf(model)
			.constructor as PersistentModelConstructor<T>;
		const storeName = this.getStorenameForModel(modelConstructor);
		const namespaceName = this.namespaceResolver(modelConstructor);

		const connectedModels = traverseModel(
			modelConstructor.name,
			model,
			this.schema.namespaces[namespaceName],
			this.modelInstanceCreator,
			this.getModelConstructorByModelName!
		);

		const set = new Set<string>();
		const connectionStoreNames = Object.values(connectedModels).map(
			({ modelName, item, instance }) => {
				const storeName = getStorename(namespaceName, modelName);
				set.add(storeName);
				const keys = getIndexKeys(
					this.schema.namespaces[namespaceName],
					modelName
				);
				return { storeName, item, instance, keys };
			}
		);

		const tx = this.db.transaction(
			[storeName, ...Array.from(set.values())],
			'readwrite'
		);
		const store = tx.objectStore(storeName);

		const keyValues = this.getIndexKeyValuesFromModel(model);

		const fromDB = await this._get(store, keyValues);

		if (condition && fromDB) {
			const predicates = ModelPredicateCreator.getPredicates(condition);
			const { predicates: predicateObjs, type } = predicates || {};

			const isValid = validatePredicate(
				fromDB as any,
				type as any,
				predicateObjs as any
			);

			if (!isValid) {
				const msg = 'Conditional update failed';
				logger.error(msg, { model: fromDB, condition: predicateObjs });

				throw new Error(msg);
			}
		}

		const result: [T, OpType.INSERT | OpType.UPDATE][] = [];
		for await (const resItem of connectionStoreNames) {
			const { storeName, item, instance, keys } = resItem;
			const store = tx.objectStore(storeName);

			const itemKeyValues = keys.map(key => {
				const value = item[key];
				return value;
			});

			const fromDB = <T>await this._get(store, itemKeyValues);
			const opType: OpType =
				fromDB === undefined ? OpType.INSERT : OpType.UPDATE;

			const modelKeyValues = this.getIndexKeyValuesFromModel(model);

			// Even if the parent is an INSERT, the child might not be, so we need to get its key
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

	private async load<T>(
		namespaceName: NAMESPACES,
		srcModelName: string,
		records: T[]
	): Promise<T[]> {
		const namespace = this.schema.namespaces[namespaceName];
		const relations = namespace.relationships![srcModelName].relationTypes;
		const connectionStoreNames = relations.map(({ modelName }) => {
			return getStorename(namespaceName, modelName);
		});
		const modelConstructor = this.getModelConstructorByModelName!(
			namespaceName,
			srcModelName
		);

		if (connectionStoreNames.length === 0) {
			return records.map(record =>
				this.modelInstanceCreator(modelConstructor, record)
			);
		}

		return records.map(record =>
			this.modelInstanceCreator(modelConstructor, record)
		);
	}

	async query<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		predicate?: ModelPredicate<T>,
		pagination?: PaginationInput<T>
	): Promise<T[]> {
		await this.checkPrivate();
		const storeName = this.getStorenameForModel(modelConstructor);
		const namespaceName = this.namespaceResolver(
			modelConstructor
		) as NAMESPACES;

		const predicates =
			predicate && ModelPredicateCreator.getPredicates(predicate);
		const keyPath = getIndexKeys(
			this.schema.namespaces[namespaceName],
			modelConstructor.name
		);
		const queryByKey =
			predicates && this.keyValueFromPredicate(predicates, keyPath);

		const hasSort = pagination && pagination.sort;
		const hasPagination = pagination && pagination.limit;

		const records: T[] = (await (async () => {
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

	private keyValueFromPredicate<T extends PersistentModel>(
		predicates: PredicatesGroup<T>,
		keyPath: string[]
	): string[] | undefined {
		const { predicates: predicateObjs } = predicates;

		if (predicateObjs.length !== keyPath.length) {
			return;
		}

		const keyValues = [] as any[];

		for (const key of keyPath) {
			const predicateObj = predicateObjs.find(
				p => isPredicateObj(p) && p.field === key && p.operator === 'eq'
			) as PredicateObject<T>;

			predicateObj && keyValues.push(predicateObj.operand);
		}

		return keyValues.length === keyPath.length ? keyValues : undefined;
	}

	private matchingIndex(
		storeName: string,
		fieldName: string,
		transaction: idb.IDBPTransaction<unknown, [string]>
	) {
		const store = transaction.objectStore(storeName);
		for (const name of store.indexNames) {
			const idx = store.index(name);
			if (idx.keyPath === fieldName) {
				return idx;
			}
		}
	}

	private async filterOnPredicate<T extends PersistentModel>(
		storeName: string,
		predicates: PredicatesGroup<T>
	) {
		let { predicates: predicateObjs, type } = predicates;

		// the predicate objects we care about tend to be nested at least
		// one level down: `{and: {or: {and: { <the predicates we want> }}}}`
		// so, we unpack and/or groups until we find a group with more than 1
		// child OR a child that is not a group (and is therefore a predicate "object").
		while (predicateObjs.length === 1 && isPredicateGroup(predicateObjs[0])) {
			type = (predicateObjs[0] as PredicatesGroup<T>).type;
			predicateObjs = (predicateObjs[0] as PredicatesGroup<T>).predicates;
		}

		// where we'll accumulate candidate results, which will be filtered at the end.
		let candidateResults: T[];

		// AFAIK, this will always be a homogenous group of predicate objects at this point.
		// but, if that ever changes, this pulls out just the predicates from the list that
		// are field-level predicate objects we can potentially smash against an index.
		const fieldPredicates = predicateObjs.filter(p =>
			isPredicateObj(p)
		) as PredicateObject<T>[];

		// several sub-queries could occur here. explicitly start a txn here to avoid
		// opening/closing multiple txns.
		const txn = this.db.transaction(storeName);

		// our potential indexes or lacks thereof.
		const predicateIndexes = fieldPredicates.map(p => {
			return {
				predicate: p,
				index: this.matchingIndex(storeName, String(p.field), txn),
			};
		});

		// Explicitly wait for txns from index queries to complete before proceding.
		// This helps ensure IndexedDB is in a stable, ready state. Else, subseqeuent
		// qeuries can sometimes appear to deadlock (at least in FakeIndexedDB).
		await txn.done;

		// semi-naive implementation:
		if (type === 'and') {
			// each condition must be satsified, we can form a base set with any
			// ONE of those conditions and then filter.
			const actualPredicateIndexes = predicateIndexes.filter(
				i => i.index && i.predicate.operator === 'eq'
			);

			if (actualPredicateIndexes.length > 0) {
				const predicateIndex = actualPredicateIndexes[0];
				candidateResults = <T[]>(
					await predicateIndex.index!.getAll(predicateIndex.predicate.operand)
				);
			} else {
				// no usable indexes
				candidateResults = <T[]>await this.getAll(storeName);
			}
		} else if (type === 'or') {
			// NOTE: each condition implies a potentially distinct set. we only benefit
			// from using indexes here if EVERY condition uses an index. if any one
			// index requires a table scan, we gain nothing from the indexes.
			// NOTE: results must be DISTINCT-ified if we leverage indexes.
			if (
				predicateIndexes.length > 0 &&
				predicateIndexes.every(i => i.index && i.predicate.operator === 'eq')
			) {
				const distinctResults = new Map<string, T>();
				for (const predicateIndex of predicateIndexes) {
					const resultGroup = <T[]>(
						await predicateIndex.index!.getAll(predicateIndex.predicate.operand)
					);
					for (const item of resultGroup) {
						// TODO: custom PK
						distinctResults.set(item.id, item);
					}
				}

				// we could conceivably check for special conditions and return early here.
				// but, this is simpler and has not yet had a measurable performance impact.
				candidateResults = Array.from(distinctResults.values());
			} else {
				// either no usable indexes or not all conditions can use one.
				candidateResults = <T[]>await this.getAll(storeName);
			}
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

	async delete<T extends PersistentModel>(
		modelOrModelConstructor: T | PersistentModelConstructor<T>,
		condition?: ModelPredicate<T>
	): Promise<[T[], T[]]> {
		await this.checkPrivate();
		const deleteQueue: { storeName: string; items: T[] }[] = [];

		if (isModelConstructor(modelOrModelConstructor)) {
			const modelConstructor =
				modelOrModelConstructor as PersistentModelConstructor<T>;
			const nameSpace = this.namespaceResolver(modelConstructor) as NAMESPACES;

			const storeName = this.getStorenameForModel(modelConstructor);

			const models = await this.query(modelConstructor, condition);
			const relations =
				this.schema.namespaces![nameSpace].relationships![modelConstructor.name]
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
			const model = modelOrModelConstructor as T;

			const modelConstructor = Object.getPrototypeOf(model)
				.constructor as PersistentModelConstructor<T>;
			const namespaceName = this.namespaceResolver(
				modelConstructor
			) as NAMESPACES;

			const storeName = this.getStorenameForModel(modelConstructor);

			if (condition) {
				const tx = this.db.transaction([storeName], 'readwrite');
				const store = tx.objectStore(storeName);
				const keyValues = this.getIndexKeyValuesFromModel(model);

				const fromDB = await this._get(store, keyValues);

				if (fromDB === undefined) {
					const msg = 'Model instance not found in storage';
					logger.warn(msg, { model });

					return [[model], []];
				}

				const predicates = ModelPredicateCreator.getPredicates(condition);
				const { predicates: predicateObjs, type } =
					predicates as PredicatesGroup<T>;

				const isValid = validatePredicate(fromDB as T, type, predicateObjs);

				if (!isValid) {
					const msg = 'Conditional update failed';
					logger.error(msg, { model: fromDB, condition: predicateObjs });

					throw new Error(msg);
				}
				await tx.done;

				const relations =
					this.schema.namespaces[namespaceName].relationships![
						modelConstructor.name
					].relationTypes;

				await this.deleteTraverse(
					relations,
					[model],
					modelConstructor.name,
					namespaceName,
					deleteQueue
				);
			} else {
				const relations =
					this.schema.namespaces[namespaceName].relationships![
						modelConstructor.name
					].relationTypes;

				await this.deleteTraverse(
					relations,
					[model],
					modelConstructor.name,
					namespaceName,
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

	private async deleteItem<T extends PersistentModel>(
		deleteQueue?: {
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

	private async deleteTraverse<T extends PersistentModel>(
		relations: RelationType[],
		models: T[],
		srcModel: string,
		nameSpace: NAMESPACES,
		deleteQueue: { storeName: string; items: T[] }[]
	): Promise<void> {
		for await (const rel of relations) {
			const {
				relationType,
				modelName,
				targetName,
				targetNames,
				associatedWith,
			} = rel;

			const storeName = getStorename(nameSpace, modelName);

			switch (relationType) {
				case 'HAS_ONE':
					for await (const model of models) {
						const hasOneIndex = 'byPk';

						if (targetNames?.length) {
							// CPK codegen
							const values = targetNames
								.filter(targetName => model[targetName] ?? false)
								.map(targetName => model[targetName]);

							if (values.length === 0) break;

							const recordToDelete = <T>(
								await this.db
									.transaction(storeName, 'readwrite')
									.objectStore(storeName)
									.index(hasOneIndex)
									.get(this.canonicalKeyPath(values))
							);

							await this.deleteTraverse(
								this.schema.namespaces[nameSpace].relationships![modelName]
									.relationTypes,
								recordToDelete ? [recordToDelete] : [],
								modelName,
								nameSpace,
								deleteQueue
							);
							break;
						} else {
							// PRE-CPK codegen
							let index;
							let values: string[];

							if (targetName && targetName in model) {
								index = hasOneIndex;
								const value = model[targetName];
								values = [value];
							} else {
								// backwards compatability for older versions of codegen that did not emit targetName for HAS_ONE relations
								// TODO: can we deprecate this? it's been ~2 years since codegen started including targetName for HAS_ONE
								// If we deprecate, we'll need to re-gen the MIPR in __tests__/schema.ts > newSchema
								// otherwise some unit tests will fail
								index = getIndex(
									this.schema.namespaces[nameSpace].relationships![modelName]
										.relationTypes,
									srcModel
								);
								values = this.getIndexKeyValuesFromModel(model);
							}

							if (!values || !index) break;

							const recordToDelete = <T>(
								await this.db
									.transaction(storeName, 'readwrite')
									.objectStore(storeName)
									.index(index)
									.get(this.canonicalKeyPath(values))
							);

							await this.deleteTraverse(
								this.schema.namespaces[nameSpace].relationships![modelName]
									.relationTypes,
								recordToDelete ? [recordToDelete] : [],
								modelName,
								nameSpace,
								deleteQueue
							);
						}
					}
					break;
				case 'HAS_MANY':
					for await (const model of models) {
						const index =
							// explicit bi-directional @hasMany and @manyToMany
							getIndex(
								this.schema.namespaces[nameSpace].relationships![modelName]
									.relationTypes,
								srcModel
							) ||
							// uni and/or implicit @hasMany
							getIndexFromAssociation(
								this.schema.namespaces[nameSpace].relationships![modelName]
									.indexes,
								associatedWith!
							);
						const keyValues = this.getIndexKeyValuesFromModel(model);

						const childrenArray = await this.db
							.transaction(storeName, 'readwrite')
							.objectStore(storeName)
							.index(index as string)
							.getAll(this.canonicalKeyPath(keyValues));

						await this.deleteTraverse(
							this.schema.namespaces[nameSpace].relationships![modelName]
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
					throw new Error(`Invalid relation type ${relationType}`);
					break;
			}
		}

		deleteQueue.push({
			storeName: getStorename(nameSpace, srcModel),
			items: models.map(record =>
				this.modelInstanceCreator(
					this.getModelConstructorByModelName!(nameSpace, srcModel),
					record
				)
			),
		});
	}

	async clear(): Promise<void> {
		await this.checkPrivate();

		this.db?.close();

		await idb.deleteDB(this.dbName);

		this.db = undefined!;
		this.initPromise = undefined!;
	}

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
			const namespaceName = this.namespaceResolver(modelConstructor);
			const modelName = modelConstructor.name;
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

	private createObjectStoreForModel(
		db: idb.IDBPDatabase,
		namespaceName: string,
		storeName: string,
		modelName: string
	) {
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

	/**
	 * Checks the given path against the browser's IndexedDB implementation for
	 * necessary compatibility transformations, applying those transforms if needed.
	 *
	 * @param `keyArr` strings to compatibilize for browser-indexeddb index operations
	 * @returns An array or string, depending on and given key,
	 * that is ensured to be compatible with the IndexedDB implementation's nuances.
	 */
	private canonicalKeyPath = (keyArr: string[]) => {
		if (this.safariCompatabilityMode) {
			return keyArr.length > 1 ? keyArr : keyArr[0];
		}
		return keyArr;
	};
}

export default new IndexedDBAdapter();
