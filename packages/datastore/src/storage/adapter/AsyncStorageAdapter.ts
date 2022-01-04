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

	private getNamespaceAndModelFromStorename(storeName: string) {
		const [namespaceName, ...modelNameArr] = storeName.split('_');
		return {
			namespaceName,
			modelName: modelNameArr.join('_'),
		};
	}

	private getIndexKeyPath(namespaceName: string, modelName: string): string[] {
		const keyPath =
			this.schema.namespaces[namespaceName].keys[modelName].primaryKey;

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
		// AsyncStorageAdapter setup
		if (!this.initPromise) {
			this.initPromise = new Promise((res, rej) => {
				this.resolve = res;
				this.reject = rej;
			});
		} else {
			await this.initPromise;
			debugger;
			return;
		}
		this.schema = theSchema;
		this.namespaceResolver = namespaceResolver;
		this.modelInstanceCreator = modelInstanceCreator;
		this.getModelConstructorByModelName = getModelConstructorByModelName;
		debugger;
		try {
			if (!this.db) {
				this.db = new AsyncStorageDatabase();
				console.log('pass schema for keys?', this.schema);
				debugger;
				await this.db.init(this.schema);
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
		debugger;
		const modelConstructor = Object.getPrototypeOf(model)
			.constructor as PersistentModelConstructor<T>;
		const storeName = this.getStorenameForModel(modelConstructor);

		const namespaceName = this.namespaceResolver(modelConstructor);

		const connectedModels = traverseModel(
			modelConstructor.name,
			model,
			// this.schema.namespaces[this.namespaceResolver(modelConstructor)],
			this.schema.namespaces[namespaceName],
			this.modelInstanceCreator,
			this.getModelConstructorByModelName
		);

		// replace above with
		debugger;
		const set = new Set<string>();
		const connectionStoreNames = Object.values(connectedModels).map(
			({ modelName, item, instance }) => {
				const storeName = this.getStorename(namespaceName, modelName);
				set.add(storeName);
				const keys = this.getIndexKeyPath(namespaceName, modelName);
				debugger;
				return { storeName, item, instance, keys };
				// return { storeName, item, instance };
			}
		);
		// const fromDB = await this.db.get(model.id, storeName);
		const keyValues = this.getIndexKeyValues(model);
		debugger;
		const fromDB = await this.db.get(keyValues, storeName);

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
			// const { storeName, item, instance } = resItem;
			const { storeName, item, instance, keys } = resItem;
			debugger;
			const { id } = item;
			const itemKeyValues = keys.map(key => item[key]);

			// DO 205 or use itemKeyValues?!?!?!?
			// const keyValues = this.getIndexKeyValues(model);
			const fromDB = <T>await this.db.get(itemKeyValues, storeName);
			// const fromDB = await this._get(store, keyValues);
			debugger;
			const opType: OpType = fromDB ? OpType.UPDATE : OpType.INSERT;

			// No replacement:
			// const modelKeyValues = this.getIndexKeyValues(model);
			// const keysEqual = this.keysEqual(itemKeyValues, modelKeyValues);
			debugger;

			if (id === model.id || opType === OpType.INSERT) {
				// if (keysEqual || opType === OpType.INSERT) {
				// Replace condition, but is anything needed to adjust how we save, as in below?
				// const key = await store.index('byPk').getKey(itemKeyValues);
				debugger;
				await this.db.save(item, storeName);

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
			const { fieldName, modelName, targetName, relationType } = relation;
			const storeName = this.getStorename(namespaceName, modelName);
			const modelConstructor = this.getModelConstructorByModelName(
				namespaceName,
				modelName
			);

			switch (relationType) {
				case 'HAS_ONE':
					for await (const recordItem of records) {
						const getByfield = recordItem[targetName] ? targetName : fieldName;
						if (!recordItem[getByfield]) break;

						const connectionRecord = await this.db.get(
							recordItem[getByfield],
							storeName
						);

						recordItem[fieldName] =
							connectionRecord &&
							this.modelInstanceCreator(modelConstructor, connectionRecord);
					}

					break;
				case 'BELONGS_TO':
					for await (const recordItem of records) {
						if (recordItem[targetName]) {
							const connectionRecord = await this.db.get(
								recordItem[targetName],
								storeName
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
		// const queryById = predicates && this.idFromPredicate(predicates);
		const keyPath = this.getIndexKeyPath(namespaceName, modelConstructor.name);
		const queryByKey =
			predicates && this.keyValueFromPredicate(predicates, keyPath);

		const hasSort = pagination && pagination.sort;
		const hasPagination = pagination && pagination.limit;

		const records: T[] = await (async () => {
			// if (queryById) {
			// 	const record = await this.getById(storeName, queryById);
			// 	return record ? [record] : [];
			// }

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
		// id: string
		keyValue: string[]
	): Promise<T> {
		// const record = <T>await this.db.get([id], storeName);
		const record = <T>await this.db.get(keyValue, storeName);

		debugger;
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
		// const idPredicate =
		// 	predicateObjs.length === 1 &&
		// 	(predicateObjs.find(
		// 		p => isPredicateObj(p) && p.field === 'id' && p.operator === 'eq'
		// 	) as PredicateObject<T>);

		// return idPredicate && idPredicate.operand;

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

		return keyValues.length === keyPath.length && keyValues;
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

			debugger;
			return records.slice(start, end);
		}
		debugger;
		return records;
	}

	async queryOne<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		firstOrLast: QueryOne = QueryOne.FIRST
	): Promise<T | undefined> {
		const storeName = this.getStorenameForModel(modelConstructor);
		const result = <T>await this.db.getOne(firstOrLast, storeName);
		debugger;
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
				debugger;
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

				debugger;
				return [models, deletedModels];
			}
		} else {
			const model = modelOrModelConstructor as any;

			const modelConstructor = Object.getPrototypeOf(model)
				.constructor as PersistentModelConstructor<T>;
			const nameSpace = this.namespaceResolver(modelConstructor);
			// const namespaceName = this.namespaceResolver(modelConstructor);

			const storeName = this.getStorenameForModel(modelConstructor);
			debugger;
			if (condition) {
				debugger;
				const fromDB = await this.db.get([model.id], storeName);
				// const keyValues = this.getIndexKeyValues(model);
				// const fromDB = await this.db.get(keyValues, storeName);

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
					this.schema.namespaces[nameSpace].relationships[modelConstructor.name]
						.relationTypes;

				// this.schema.namespaces[namespaceName].relationships[
				// 		modelConstructor.name
				// 	].relationTypes;
				await this.deleteTraverse(
					relations,
					[model],
					modelConstructor.name,
					nameSpace,
					// namespaceName,
					deleteQueue
				);
			} else {
				const relations =
					this.schema.namespaces[nameSpace].relationships[modelConstructor.name]
						.relationTypes;

				// this.schema.namespaces[namespaceName].relationships[
				// 	modelConstructor.name
				// ].relationTypes;
				debugger;

				await this.deleteTraverse(
					relations,
					[model],
					modelConstructor.name,
					nameSpace,
					// namespaceName,
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
			debugger;

			for await (const item of items) {
				if (item) {
					if (typeof item === 'object') {
						// IndexedDB:
						// const keyValues = this.getIndexKeyValues(item as T);
						// key = await store.index('byPk').getKey(keyValues);
						// TODO: inspect item, retrieve key for deletion
						// await this.db.delete(key, storeName);
						debugger;
						const id = item['id'];
						await this.db.delete(id, storeName);
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
			const { relationType, modelName, targetName } = rel;
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
						// const hasOneIndex = index || 'byPk';

						const hasOneCustomField = targetName in model;

						const value = hasOneCustomField ? model[targetName] : model.id;
						// const keyValues = this.getIndexKeyValues(model);
						// const value = hasOneCustomField ? model[targetName] : keyValues;
						debugger;

						if (!value) break;

						const allRecords = await this.db.getAll(storeName);
						const recordToDelete = allRecords.filter(
							childItem => childItem[hasOneIndex] === value
						);

						await this.deleteTraverse(
							this.schema.namespaces[nameSpace].relationships[modelName]
								.relationTypes,
							recordToDelete,
							modelName,
							nameSpace,
							deleteQueue
						);
					}
					break;
				case 'HAS_MANY':
					for await (const model of models) {
						// ADD:
						// const keyValues = this.getIndexKeyValues(model);
						debugger;
						const allRecords = await this.db.getAll(storeName);
						const childrenArray = allRecords.filter(
							childItem => childItem[index] === model.id
						);

						// Update childrenArray: .getAll(keyValues);

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

		// const namespaceName = this.namespaceResolver(modelConstructor);
		// const modelName = modelConstructor.name;
		// const model = this.modelInstanceCreator(modelConstructor, item);
		debugger;

		const batch: ModelInstanceMetadata[] = [];

		for (const item of items) {
			const { id } = item;

			// something like:
			// const keyValues = this.getIndexKeyValues(model);
			// const { _deleted } = item;

			// const index = store.index('byPk');
			// const key = await index.getKey(keyValues);
			debugger;

			const connectedModels = traverseModel(
				modelConstructor.name,
				this.modelInstanceCreator(modelConstructor, item),
				this.schema.namespaces[this.namespaceResolver(modelConstructor)],
				// replace above 3 lines with below:
				// modelName,
				// model,
				// this.schema.namespaces[namespaceName],
				this.modelInstanceCreator,
				this.getModelConstructorByModelName
			);
			debugger;

			const { instance } = connectedModels.find(
				({ instance }) => instance.id === id
			);
			// const { instance } = connectedModels.find(({ instance }) => {
			// 	const instanceKeyValues = this.getIndexKeyValues(instance);
			// 	return this.keysEqual(instanceKeyValues, keyValues);
			// });
			debugger;

			batch.push(instance);
		}

		return await this.db.batchSave(storeName, batch);
	}
}

export default new AsyncStorageAdapter();
