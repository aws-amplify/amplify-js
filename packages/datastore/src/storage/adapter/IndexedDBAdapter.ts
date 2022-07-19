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

const DB_NAME = 'amplify-datastore';
class IndexedDBAdapter implements Adapter {
	private schema: InternalSchema;
	private namespaceResolver: NamespaceResolver;
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

	private getStorenameForModel(
		modelConstructor: PersistentModelConstructor<any>
	) {
		const namespace = this.namespaceResolver(modelConstructor);
		const { name: modelName } = modelConstructor;

		return this.getStorename(namespace, modelName);
	}

	private getStorename(namespace: string, modelName: string) {
		const storeName = `${namespace}_${modelName}`;

		return storeName;
	}

	private getNamespaceAndModelFromStorename(storeName: string) {
		const [namespaceName, ...modelNameArr] = storeName.split('_');
		return {
			namespaceName,
			modelName: modelNameArr.join('_'),
		};
	}

	private getIndexKeyPath(namespaceName: string, modelName: string): string[] {
		const keyPath =
			this.schema.namespaces[namespaceName]?.keys[modelName]?.primaryKey;

		if (keyPath) {
			return keyPath;
		}

		return ['id'];
	}

	private getIndexKeyValues<T extends PersistentModel>(model: T): string[] {
		const modelConstructor = Object.getPrototypeOf(model)
			.constructor as PersistentModelConstructor<T>;
		const namespaceName = this.namespaceResolver(modelConstructor);
		const keys = this.getIndexKeyPath(namespaceName, modelConstructor.name);

		const keyValues = keys.map(field => model[field]);
		return keyValues;
	}

	private keysEqual(keysA, keysB): boolean {
		if (keysA.length !== keysB.length) {
			return false;
		}

		return keysA.every((key, idx) => key === keysB[idx]);
	}

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

						if ((oldVersion === 1 || oldVersion === 2) && newVersion === 3) {
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

									const origIndexNames = Object.values(origStore.indexNames);
									for (const idxName of origIndexNames) {
										if (idxName === 'byId') {
											// don't migrate this index. It'll be replaced with byPk
											continue;
										}
										const idx = origStore.index(idxName);
										const { keyPath, unique } = idx;

										newStore.createIndex(idxName, keyPath, { unique });
									}

									const { namespaceName, modelName } =
										this.getNamespaceAndModelFromStorename(storeName);

									const keyPath = this.getIndexKeyPath(
										namespaceName,
										modelName
									);
									newStore.createIndex('byPk', keyPath, { unique: true });

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

	private async _get<T>(
		storeOrStoreName: idb.IDBPObjectStore | string,
		keyArr: any[]
	): Promise<T> {
		// debugger;
		// console.log(keyArr);
		let index: idb.IDBPIndex;

		if (typeof storeOrStoreName === 'string') {
			const storeName = storeOrStoreName;
			index = this.db.transaction(storeName, 'readonly').store.index('byPk');
		} else {
			const store = storeOrStoreName;
			index = store.index('byPk');
		}

		const result = await index.get(keyArr);
		// debugger;
		// debugger;
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
			this.getModelConstructorByModelName
		);
		// debugger;

		const set = new Set<string>();
		const connectionStoreNames = Object.values(connectedModels).map(
			({ modelName, item, instance }) => {
				const storeName = this.getStorename(namespaceName, modelName);
				set.add(storeName);
				const keys = this.getIndexKeyPath(namespaceName, modelName);
				return { storeName, item, instance, keys };
			}
		);

		const tx = this.db.transaction(
			[storeName, ...Array.from(set.values())],
			'readwrite'
		);
		const store = tx.objectStore(storeName);

		const keyValues = this.getIndexKeyValues(model);
		// Was getting by id here.
		// NESTED ARRAY?
		if (keyValues[0] == null) {
			debugger;
		}

		// console.log(keyValues);
		const fromDB = await this._get(store, keyValues);

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
			const { storeName, item, instance, keys } = resItem;
			const store = tx.objectStore(storeName);
			const itemKeyValues = keys.map(key => {
				const value = item[key];
				// console.log(keyValues);
				// FIRST ISSUE: ITEM IS NOT A MODEL, BUT AN ARRAY, CAUSING CONSOLE ERROR
				// debugger;
				// debugger;
				return value;
			});

			// debugger;
			// NESTED ARRAY?
			if (keyValues[0] == null) {
				debugger;
			}
			const fromDB = <T>await this._get(store, itemKeyValues);
			const opType: OpType =
				fromDB === undefined ? OpType.INSERT : OpType.UPDATE;

			const modelKeyValues = this.getIndexKeyValues(model);
			const keysEqual = this.keysEqual(itemKeyValues, modelKeyValues);

			// Even if the parent is an INSERT, the child might not be, so we need to get its key
			if (keysEqual || opType === OpType.INSERT) {
				const key = await store.index('byPk').getKey(itemKeyValues);
				// debugger;
				await store.put(item, key);

				result.push([instance, opType]);
			}
		}

		await tx.done;

		return result;
	}

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

		for await (const relation of relations) {
			// target name, metadata, set by init
			const { fieldName, modelName, targetName, targetNames } = relation;
			// console.log(targetName);
			// console.log(targetNames);
			// debugger;
			const storeName = this.getStorename(namespaceName, modelName);
			const store = tx.objectStore(storeName);
			const modelConstructor = this.getModelConstructorByModelName(
				namespaceName,
				modelName
			);

			switch (relation.relationType) {
				case 'HAS_ONE':
					for await (const recordItem of records) {
						// console.log(targetName);
						// console.log(targetNames);
						// debugger;

						// POST CPK codegen changes:
						if (targetNames.length > 0) {
							let getByFields = [];
							let allPresent;
							// iterate through all targetnames to make sure they are all present in the recordItem
							allPresent = targetNames.every(targetName => {
								return recordItem[targetName] != null;
							});
							// debugger;
							if (!allPresent) {
								break;
							}
							// const key = [recordItem[getByfield]];

							// TODO: would we ever use fieldName, here, like we do below?
							// console.log(fieldName);
							// debugger;
							getByFields = targetNames as any;

							// keys are the key values
							const keys = getByFields.map(
								getByField => recordItem[getByField]
							);

							// NESTED ARRAY?
							if (keys[0] == null) {
								debugger;
							}

							const connectionRecord = await this._get(store, keys);
							// debugger;
							// console.log('is this ever retrieved?');
							// console.log(connectionRecord);
							// debugger;
							recordItem[fieldName] =
								connectionRecord &&
								this.modelInstanceCreator(modelConstructor, connectionRecord);
						} else {
							// If single target name, using old codegen
							// debugger;
							const getByfield = recordItem[targetName]
								? targetName
								: fieldName;
							// We break here, because the recordItem does not have 'team', the `getByField`
							// TODO: also check for fields
							// debugger;
							// extract the keys on the related model.

							// debugger;
							if (!recordItem[getByfield]) break;
							// THIRD ISSUE (find):
							// if model, will grab id, and set the target name on the child.
							// see `save` switch

							const key = [recordItem[getByfield]];
							// SECOND ISSUE: CONNECTION RECORD IS NEVER POPULATED
							// This MAY be just an issue with SK, attempting with PK now
							// If so, the issue is that we are assuming there is ONE connection field.
							// debugger;
							// NESTED ARRAY?
							if (key[0] == null) {
								debugger;
							}
							const connectionRecord = await this._get(store, key);
							// console.log('is this ever retrieved?');
							// debugger;
							recordItem[fieldName] =
								connectionRecord &&
								this.modelInstanceCreator(modelConstructor, connectionRecord);
						}
					}
					break;
				case 'BELONGS_TO':
					// debugger;
					for await (const recordItem of records) {
						// console.log(targetName);
						// console.log(targetNames);
						// debugger;

						// POST CPK codegen changes:
						if (targetNames.length > 0) {
							let allPresent;
							// iterate through all targetnames to make sure they are all present in the recordItem
							allPresent = targetNames.every(targetName => {
								return recordItem[targetName] != null;
							});

							// If not present, there is not yet a connected record
							if (!allPresent) {
								break;
							}

							const keys = targetNames.map(
								targetName => recordItem[targetName]
							);
							// NESTED ARRAY?
							if (keys[0] == null) {
								debugger;
							}

							// Retrieve the connected record
							const connectionRecord = await this._get(store, keys);

							// console.log('how do we delete this??');
							// console.log('how do we delete this??');
							// debugger;
							recordItem[fieldName] =
								connectionRecord &&
								this.modelInstanceCreator(modelConstructor, connectionRecord);
							delete recordItem[targetName];
						} else if (recordItem[targetName]) {
							// debugger;
							const key = [recordItem[targetName]];
							// NESTED ARRAY?
							// debugger;
							if (key[0] == null) {
								debugger;
							}
							const connectionRecord = await this._get(store, key);

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
		const keyPath = this.getIndexKeyPath(namespaceName, modelConstructor.name);
		const queryByKey =
			predicates && this.keyValueFromPredicate(predicates, keyPath);

		const hasSort = pagination && pagination.sort;
		const hasPagination = pagination && pagination.limit;

		const records: T[] = await (async () => {
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
		})();

		return await this.load(namespaceName, modelConstructor.name, records);
	}

	private async getByKey<T extends PersistentModel>(
		storeName: string,
		keyValue: string[]
	): Promise<T> {
		// NESTED ARRAY?
		// debugger;
		if (keyValue[0] == null) {
			debugger;
		}
		const record = <T>await this._get(storeName, keyValue);
		return record;
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

		const keyValues = [];

		for (const key of keyPath) {
			const predicateObj = predicateObjs.find(
				p => isPredicateObj(p) && p.field === key && p.operator === 'eq'
			) as PredicateObject<T>;

			predicateObj && keyValues.push(predicateObj.operand);
		}

		return keyValues.length === keyPath.length ? keyValues : undefined;
	}

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
			const namespaceName = this.namespaceResolver(modelConstructor);

			const storeName = this.getStorenameForModel(modelConstructor);

			if (condition) {
				const tx = this.db.transaction([storeName], 'readwrite');
				const store = tx.objectStore(storeName);
				const keyValues = this.getIndexKeyValues(model);

				// NESTED ARRAY?
				// debugger;
				if (keyValues[0] == null) {
					debugger;
				}
				const fromDB = await this._get(store, keyValues);

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
					this.schema.namespaces[namespaceName].relationships[
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
					this.schema.namespaces[namespaceName].relationships[
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
						const keyValues = this.getIndexKeyValues(item as T);
						key = await store.index('byPk').getKey(keyValues);
					} else {
						const itemKey = [item.toString()];
						key = await store.index('byPk').getKey([itemKey]);
					}

					if (key !== undefined) {
						await store.delete(key);
					}
				}
			}
		}
	}

	private async deleteTraverse1<T extends PersistentModel>(
		relations: RelationType[],
		models: T[],
		srcModel: string,
		nameSpace: string,
		deleteQueue: { storeName: string; items: T[] }[]
	): Promise<void> {
		for await (const rel of relations) {
			const { relationType, fieldName, modelName, targetName, targetNames } =
				rel;
			// console.log(targetName);
			// console.log(targetNames);
			// debugger;
			const storeName = this.getStorename(nameSpace, modelName);

			const index: string | string[] | undefined =
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

			// console.log('was index / indices retrieved?', index);
			debugger;
			switch (relationType) {
				case 'HAS_ONE':
					for await (const model of models) {
						// const hasOneIndex = index || 'byPk';
						// TEMP:
						const hasOneIndex = 'byPk';

						// Should be byPk?
						debugger;
						// if (targetNames && targetNames.length > 0) {
						// 	// iterate over targetNames array and see if each item is present in model object
						// 	let hasOneCustomFields = targetNames.every(targetName =>
						// 		model.hasOwnProperty(targetName)
						// 	);

						// 	debugger;
						// 	const keyValues = this.getIndexKeyValues(model);

						// 	let values = [];
						// 	if (hasOneCustomFields) {
						// 		values = targetNames.map(
						// 			targetName => model[targetName]
						// 		) as any;
						// 	} else {
						// 		values = keyValues as any;
						// 	}

						// 	debugger;
						// 	if (hasOneIndex === 'byPk') {
						// 		// byPk requires an array keyValue
						// 		// should already be an array!
						// 		debugger;
						// 	}

						// 	if (values.length === 0) break;

						// 	const recordToDelete = <T>await this.db
						// 		.transaction(storeName, 'readwrite')
						// 		.objectStore(storeName)
						// 		.index(hasOneIndex as any)
						// 		.get(values);

						// 	console.log('do we get it?????');
						// 	console.log(recordToDelete);
						// 	debugger;

						// 	await this.deleteTraverse(
						// 		this.schema.namespaces[nameSpace].relationships[modelName]
						// 			.relationTypes,
						// 		recordToDelete ? [recordToDelete] : [],
						// 		modelName,
						// 		nameSpace,
						// 		deleteQueue
						// 	);
						// 	debugger;
						// 	break;
						// }
						const hasOneCustomField = targetName in model;
						// debugger;
						const keyValues = this.getIndexKeyValues(model);
						// TargetNames will always be present, when do we decide between that, and keyValues?
						debugger;
						// let value = hasOneCustomField ? model[targetName] : keyValues[0];
						let values = hasOneCustomField ? model[targetName] : keyValues;
						// targetNames? or keyValues?
						debugger;

						// Shouldn't be needed:
						// if (hasOneIndex === 'byPk') {
						// 	// byPk requires an array keyValue
						// 	value = [value];
						// }

						// if (!value) break;
						if (values.length === 0) break;

						// debugger;
						const recordToDelete = <T>await this.db
							.transaction(storeName, 'readwrite')
							.objectStore(storeName)
							.index(hasOneIndex as any)
							.get(values);

						// console.log('do we get it?????');
						// console.log('do we get it?????');
						// console.log('could also be multiple records?');
						debugger;

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
						const keyValues = this.getIndexKeyValues(model);
						// console.log(targetNames);
						// console.log('first key value?');
						// console.log('check index, could be array');
						// debugger;
						const childrenArray = await this.db
							.transaction(storeName, 'readwrite')
							.objectStore(storeName)
							.index(index as any)
							.getAll(keyValues[0]);

						// console.log('correct???');
						// debugger;

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

	private async deleteTraverse<T extends PersistentModel>(
		relations: RelationType[],
		models: T[],
		srcModel: string,
		nameSpace: string,
		deleteQueue: { storeName: string; items: T[] }[]
	): Promise<void> {
		for await (const rel of relations) {
			const { relationType, fieldName, modelName, targetName } = rel;
			const storeName = this.getStorename(nameSpace, modelName);

			const index: any =
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
						const hasOneIndex = index || 'byPk';

						// Should always be `byPk`
						debugger;
						// ignore
						const hasOneCustomField = targetName in model;
						//
						const keyValues = this.getIndexKeyValues(model);
						let values = hasOneCustomField ? model[targetName] : keyValues;

						// Should no longer be needed
						// if (hasOneIndex === 'byPk') {
						// 	// byPk requires an array keyValue
						// 	value = [value];
						// }

						if (values.length === 0) break;

						const recordToDelete = <T>(
							await this.db
								.transaction(storeName, 'readwrite')
								.objectStore(storeName)
								.index(hasOneIndex)
								.get(values)
						);

						console.log('record to delete', recordToDelete);

						debugger;
						await this.deleteTraverse(
							this.schema.namespaces[nameSpace].relationships[modelName]
								.relationTypes,
							recordToDelete ? [recordToDelete] : [],
							modelName,
							nameSpace,
							deleteQueue
						);

						debugger;
					}
					break;
				case 'HAS_MANY':
					for await (const model of models) {
						const keyValues = this.getIndexKeyValues(model);

						const childrenArray = await this.db
							.transaction(storeName, 'readwrite')
							.objectStore(storeName)
							.index(index)
							.getAll(keyValues[0]);

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

		debugger;
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

	async clear(): Promise<void> {
		await this.checkPrivate();

		this.db.close();

		await idb.deleteDB(this.dbName);

		this.db = undefined;
		this.initPromise = undefined;
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
				this.getModelConstructorByModelName
			);
			// debugger;

			const keyValues = this.getIndexKeyValues(model);
			const { _deleted } = item;
			// is this working?
			// debugger;

			const index = store.index('byPk');
			const key = await index.getKey(keyValues);

			if (!_deleted) {
				const { instance } = connectedModels.find(({ instance }) => {
					const instanceKeyValues = this.getIndexKeyValues(instance);
					return this.keysEqual(instanceKeyValues, keyValues);
				});

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

		const keyPath = this.getIndexKeyPath(namespaceName, modelName);

		store.createIndex('byPk', keyPath, { unique: true });
	}
}

export default new IndexedDBAdapter();
