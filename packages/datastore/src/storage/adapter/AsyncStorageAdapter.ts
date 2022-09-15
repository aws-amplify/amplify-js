import { ConsoleLogger as Logger } from '@aws-amplify/core';
import AsyncStorageDatabase from './AsyncStorageDatabase';
import { Adapter } from './index';
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
	traverseModel,
	validatePredicate,
	sortCompareFunction,
} from '../../util';

const logger = new Logger('DataStore');

const DEFAULT_PRIMARY_KEY_SEPARATOR = '#';

export class AsyncStorageAdapter implements Adapter {
	private schema: InternalSchema;
	private namespaceResolver: NamespaceResolver;
	private modelInstanceCreator: ModelInstanceCreator;
	private getModelConstructorByModelName: (
		namsespaceName: string,
		modelName: string
	) => PersistentModelConstructor<any>;
	private db: AsyncStorageDatabase;
	private initPromise: Promise<void>;
	private resolve: (value?: any) => void;
	private reject: (value?: any) => void;

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

	// Returns primary keys for a model
	private getIndexKeys(namespaceName: string, modelName: string): string[] {
		const namespace = this.schema.namespaces[namespaceName];

		const keyPath = namespace?.keys[modelName]?.primaryKey;

		if (keyPath) {
			return keyPath;
		}

		return ['id'];
	}

	// Retrieves concatenated primary key values from a model
	private getIndexKeyValuesPath<T extends PersistentModel>(model: T): string {
		const modelConstructor = Object.getPrototypeOf(model)
			.constructor as PersistentModelConstructor<T>;
		const namespaceName = this.namespaceResolver(modelConstructor);
		const keys = this.getIndexKeys(namespaceName, modelConstructor.name);

		// Retrieve key values from model
		const keyValues = keys.map(field => model[field]);

		// Return concatenated key values
		return keyValues.join(DEFAULT_PRIMARY_KEY_SEPARATOR);
	}

	// Retrieves concatenated primary key values from a model
	private getIndexKeyValues<T extends PersistentModel>(model: T): string[] {
		const modelConstructor = Object.getPrototypeOf(model)
			.constructor as PersistentModelConstructor<T>;
		const namespaceName = this.namespaceResolver(modelConstructor);
		const keys = this.getIndexKeys(namespaceName, modelConstructor.name);

		// Retrieve key values from model
		return keys.map(field => model[field]);
	}

	private keysEqual(keysA, keysB): boolean {
		if (keysA.length !== keysB.length) {
			return false;
		}

		if (keysA.length === 1) {
			return keysA[0] === keysB[0];
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
		) => PersistentModelConstructor<any>
	) {
		if (!this.initPromise) {
			this.initPromise = new Promise((res, rej) => {
				this.resolve = res;
				this.reject = rej;
			});
		} else {
			await this.initPromise;
			return;
		}
		this.schema = theSchema;
		this.namespaceResolver = namespaceResolver;
		this.modelInstanceCreator = modelInstanceCreator;
		this.getModelConstructorByModelName = getModelConstructorByModelName;
		try {
			if (!this.db) {
				this.db = new AsyncStorageDatabase();
				await this.db.init();
				this.resolve();
			}
		} catch (error) {
			this.reject(error);
		}
	}

	async save<T extends PersistentModel>(
		model: T,
		condition?: ModelPredicate<T>
	): Promise<[T, OpType.INSERT | OpType.UPDATE][]> {
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

		const set = new Set<string>();
		const connectionStoreNames = Object.values(connectedModels).map(
			({ modelName, item, instance }) => {
				const storeName = this.getStorename(namespaceName, modelName);
				set.add(storeName);
				const keys = this.getIndexKeys(namespaceName, modelName);
				return { storeName, item, instance, keys };
			}
		);
		const keyValuesPath = this.getIndexKeyValuesPath(model);

		const fromDB = await this.db.get(keyValuesPath, storeName);

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

			/* Find the key values in the item, and concatenate them */
			const itemKeyValues: string[] = keys.map(key => item[key]);
			const itemKeyValuesPath: string = itemKeyValues.join(
				DEFAULT_PRIMARY_KEY_SEPARATOR
			);

			const fromDB = <T>await this.db.get(itemKeyValuesPath, storeName);
			const opType: OpType = fromDB ? OpType.UPDATE : OpType.INSERT;
			const modelKeyValues = this.getIndexKeyValues(model);
			const keysEqual = this.keysEqual(itemKeyValues, modelKeyValues);

			// If item key values and model key values are equal, save to db
			if (keysEqual || opType === OpType.INSERT) {
				await this.db.save(item, storeName, keys, itemKeyValuesPath);

				result.push([instance, opType]);
			}
		}

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

		for await (const relation of relations) {
			const { fieldName, modelName, targetName, targetNames, relationType } =
				relation;
			const storeName = this.getStorename(namespaceName, modelName);
			const modelConstructor = this.getModelConstructorByModelName(
				namespaceName,
				modelName
			);

			switch (relationType) {
				case 'HAS_ONE':
					for await (const recordItem of records) {
						// ASYNC CPK TODO: make this cleaner
						if (targetNames?.length) {
							let getByFields = [];
							let allPresent;
							// iterate through all targetnames to make sure they are all present in the recordItem
							allPresent = targetNames.every(targetName => {
								return recordItem[targetName] != null;
							});

							if (!allPresent) {
								break;
							}

							getByFields = targetNames as any;

							// keys are the key values
							const keys = getByFields
								.map(getByField => recordItem[getByField])
								.join(DEFAULT_PRIMARY_KEY_SEPARATOR);

							const connectionRecord = await this.db.get(
								keys as any,
								storeName
							);

							recordItem[fieldName] =
								connectionRecord &&
								this.modelInstanceCreator(modelConstructor, connectionRecord);
						} else {
							const getByfield = recordItem[targetName]
								? targetName
								: fieldName;
							if (!recordItem[getByfield]) break;

							const key = recordItem[getByfield];

							const connectionRecord = await this.db.get(key, storeName);

							recordItem[fieldName] =
								connectionRecord &&
								this.modelInstanceCreator(modelConstructor, connectionRecord);
						}
					}

					break;
				case 'BELONGS_TO':
					for await (const recordItem of records) {
						// ASYNC CPK TODO: make this cleaner
						if (targetNames?.length) {
							let allPresent;
							// iterate through all targetnames to make sure they are all present in the recordItem
							allPresent = targetNames.every(targetName => {
								return recordItem[targetName] != null;
							});

							// If not present, there is not yet a connected record
							if (!allPresent) {
								break;
							}

							const keys = targetNames
								.map(targetName => recordItem[targetName])
								.join(DEFAULT_PRIMARY_KEY_SEPARATOR);

							// Retrieve the connected record
							const connectionRecord = await this.db.get(
								keys as any,
								storeName
							);

							recordItem[fieldName] =
								connectionRecord &&
								this.modelInstanceCreator(modelConstructor, connectionRecord);

							targetNames?.map(targetName => {
								delete recordItem[targetName];
							});
						} else if (recordItem[targetName as any]) {
							const key = recordItem[targetName];

							const connectionRecord = await this.db.get(key, storeName);

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
					exhaustiveCheck(relationType);
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
		const storeName = this.getStorenameForModel(modelConstructor);
		const namespaceName = this.namespaceResolver(modelConstructor);

		const predicates =
			predicate && ModelPredicateCreator.getPredicates(predicate);
		const keys = this.getIndexKeys(namespaceName, modelConstructor.name);
		const queryByKey =
			predicates && this.keyValueFromPredicate(predicates, keys);

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

			if (hasSort || hasPagination) {
				const all = await this.getAll(storeName);
				return this.inMemoryPagination(all, pagination);
			}

			return this.getAll(storeName);
		})();

		return await this.load(namespaceName, modelConstructor.name, records);
	}

	private async getByKey<T extends PersistentModel>(
		storeName: string,
		keyValuePath: string
	): Promise<T> {
		const record = <T>await this.db.get(keyValuePath, storeName);
		return record;
	}

	private async getAll<T extends PersistentModel>(
		storeName: string
	): Promise<T[]> {
		return await this.db.getAll(storeName);
	}

	private keyValueFromPredicate<T extends PersistentModel>(
		predicates: PredicatesGroup<T>,
		keys: string[]
	): string | undefined {
		const { predicates: predicateObjs } = predicates;

		if (predicateObjs.length !== keys.length) {
			return;
		}

		const keyValues = [];

		for (const key of keys) {
			const predicateObj = predicateObjs.find(
				p => isPredicateObj(p) && p.field === key && p.operator === 'eq'
			) as PredicateObject<T>;

			predicateObj && keyValues.push(predicateObj.operand);
		}

		return keyValues.length === keys.length
			? keyValues.join(DEFAULT_PRIMARY_KEY_SEPARATOR)
			: undefined;
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

	async queryOne<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		firstOrLast: QueryOne = QueryOne.FIRST
	): Promise<T | undefined> {
		const storeName = this.getStorenameForModel(modelConstructor);
		const result = <T>await this.db.getOne(firstOrLast, storeName);

		return result && this.modelInstanceCreator(modelConstructor, result);
	}

	async delete<T extends PersistentModel>(
		modelOrModelConstructor: T | PersistentModelConstructor<T>,
		condition?: ModelPredicate<T>
	): Promise<[T[], T[]]> {
		const deleteQueue: { storeName: string; items: T[] }[] = [];

		if (isModelConstructor(modelOrModelConstructor)) {
			const modelConstructor = modelOrModelConstructor;
			const nameSpace = this.namespaceResolver(modelConstructor);

			// models to be deleted.
			const models = await this.query(modelConstructor, condition);
			// TODO: refactor this to use a function like getRelations()
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

				await this.deleteItem(deleteQueue);

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
				const keyValuePath = this.getIndexKeyValuesPath(model);

				const fromDB = await this.db.get(keyValuePath, storeName);

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
		deleteQueue?: { storeName: string; items: T[] | IDBValidKey[] }[]
	) {
		for await (const deleteItem of deleteQueue) {
			const { storeName, items } = deleteItem;

			for await (const item of items) {
				if (item) {
					if (typeof item === 'object') {
						const keyValuesPath: string = this.getIndexKeyValuesPath(item as T);
						await this.db.delete(keyValuesPath, storeName);
					}
				}
			}
		}
	}
	/**
	 * Populates the delete Queue with all the items to delete
	 * @param relations
	 * @param models
	 * @param srcModel
	 * @param nameSpace
	 * @param deleteQueue
	 */
	private async deleteTraverse<T extends PersistentModel>(
		relations: RelationType[],
		models: T[],
		srcModel: string,
		nameSpace: string,
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
						if (targetNames && targetNames?.length) {
							const hasOneIndex = index || associatedWith;

							// iterate over targetNames array and see if each item is present in model object
							// targetNames here being the keys for the CHILD model
							const hasConnectedModelFields = targetNames.every(targetName =>
								model.hasOwnProperty(targetName)
							);

							// PK / Composite key for the parent model
							const keyValuesPath: string = this.getIndexKeyValuesPath(model);

							let values;

							if (hasConnectedModelFields) {
								// Values will be that of the child model
								values = targetNames.map(
									targetName => model[targetName]
								) as any;
							} else {
								// values will be that of the parent model
								values = keyValuesPath;
							}

							if (values.length === 0) break;

							const allRecords = await this.db.getAll(storeName);

							let recordToDelete;

							// values === targetNames
							if (hasConnectedModelFields) {
								/**
								 * Retrieve record by finding the record where all
								 * targetNames are present on the connected model
								 */
								// recordToDelete = allRecords.filter(childItem =>
								// 	values.every(value => childItem[value] != null)
								// ) as T[];

								recordToDelete = allRecords.filter(childItem =>
									hasOneIndex.every(index => values.includes(childItem[index]))
								);
							} else {
								// values === keyValuePath
								recordToDelete = allRecords.filter(
									childItem => childItem[hasOneIndex] === values
								) as T[];
							}

							await this.deleteTraverse<T>(
								this.schema.namespaces[nameSpace].relationships[modelName]
									.relationTypes,
								recordToDelete,
								modelName,
								nameSpace,
								deleteQueue
							);
						} else {
							const hasOneIndex = index || associatedWith;
							const hasOneCustomField = targetName in model;
							const keyValuesPath: string = this.getIndexKeyValuesPath(model);
							const value = hasOneCustomField
								? model[targetName]
								: keyValuesPath;

							if (!value) break;

							const allRecords = await this.db.getAll(storeName);

							const recordToDelete = allRecords.filter(
								childItem => childItem[hasOneIndex] === value
							) as T[];

							await this.deleteTraverse<T>(
								this.schema.namespaces[nameSpace].relationships[modelName]
									.relationTypes,
								recordToDelete,
								modelName,
								nameSpace,
								deleteQueue
							);
						}
					}
					break;
				case 'HAS_MANY':
					for await (const model of models) {
						// Key values for the parent model:
						const keyValues: string[] = this.getIndexKeyValues(model);

						const allRecords = await this.db.getAll(storeName);

						// Use constant if we go with this approach
						const indices = index.split('-');

						const childrenArray = allRecords.filter(childItem =>
							indices.every(index => keyValues.includes(childItem[index]))
						) as T[];

						await this.deleteTraverse<T>(
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

	async clear(): Promise<void> {
		await this.db.clear();

		this.db = undefined;
		this.initPromise = undefined;
	}

	async batchSave<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<any>,
		items: ModelInstanceMetadata[]
	): Promise<[T, OpType][]> {
		const { name: modelName } = modelConstructor;
		const namespaceName = this.namespaceResolver(modelConstructor);
		const storeName = this.getStorename(namespaceName, modelName);
		const keys = this.getIndexKeys(namespaceName, modelName);
		const batch: ModelInstanceMetadata[] = [];

		for (const item of items) {
			const model = this.modelInstanceCreator(modelConstructor, item);

			const connectedModels = traverseModel(
				modelName,
				model,
				this.schema.namespaces[namespaceName],
				this.modelInstanceCreator,
				this.getModelConstructorByModelName
			);

			const keyValuesPath = this.getIndexKeyValuesPath(model);

			const { instance } = connectedModels.find(({ instance }) => {
				const instanceKeyValuesPath = this.getIndexKeyValuesPath(instance);
				return this.keysEqual([instanceKeyValuesPath], [keyValuesPath]);
			});

			batch.push(instance);
		}

		return await this.db.batchSave(storeName, batch, keys);
	}
}

export default new AsyncStorageAdapter();
