import { ConsoleLogger as Logger } from '@aws-amplify/core';
import AsyncStorageDatabase from './AsyncStorageDatabase';
import { Adapter } from './index';
import { ModelInstanceCreator } from '../../datastore/datastore';
import { ModelPredicateCreator } from '../../predicates';
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
	DEFAULT_PRIMARY_KEY_VALUE_SEPARATOR,
	getIndex,
	getIndexFromAssociation,
	isModelConstructor,
	traverseModel,
	validatePredicate,
	inMemoryPagination,
	NAMESPACES,
	keysEqual,
	getStorename,
	getIndexKeys,
	extractPrimaryKeyValues,
	IDENTIFIER_KEY_SEPARATOR,
} from '../../util';

const logger = new Logger('DataStore');

export class AsyncStorageAdapter implements Adapter {
	// Non-null assertions (bang operators) added to most properties to make TS happy.
	// For now, we can be reasonably sure they're available when they're needed, because
	// the adapter is not used directly outside the library boundary.
	// TODO: rejigger for DI?
	private schema!: InternalSchema;
	private namespaceResolver!: NamespaceResolver;
	private modelInstanceCreator!: ModelInstanceCreator;
	private getModelConstructorByModelName!: (
		namsespaceName: NAMESPACES,
		modelName: string
	) => PersistentModelConstructor<any>;
	private db!: AsyncStorageDatabase;
	private initPromise!: Promise<void>;
	private resolve!: (value?: any) => void;
	private reject!: (value?: any) => void;

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

	// Retrieves concatenated primary key values from a model
	private getIndexKeyValuesPath<T extends PersistentModel>(model: T): string {
		return this.getIndexKeyValuesFromModel(model).join(
			DEFAULT_PRIMARY_KEY_VALUE_SEPARATOR
		);
	}

	async setUp(
		theSchema: InternalSchema,
		namespaceResolver: NamespaceResolver,
		modelInstanceCreator: ModelInstanceCreator,
		getModelConstructorByModelName: (
			namsespaceName: NAMESPACES,
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
			this.getModelConstructorByModelName as any
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
		const keyValuesPath = this.getIndexKeyValuesPath(model);

		const fromDB = await this.db.get(keyValuesPath, storeName);

		if (condition && fromDB) {
			const predicates = ModelPredicateCreator.getPredicates(condition);
			const { predicates: predicateObjs, type } = predicates!;

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
				DEFAULT_PRIMARY_KEY_VALUE_SEPARATOR
			);

			const fromDB = <T>await this.db.get(itemKeyValuesPath, storeName);
			const opType: OpType = fromDB ? OpType.UPDATE : OpType.INSERT;
			const modelKeyValues = this.getIndexKeyValuesFromModel(model);

			// If item key values and model key values are equal, save to db
			if (
				keysEqual(itemKeyValues, modelKeyValues) ||
				opType === OpType.INSERT
			) {
				await this.db.save(item, storeName, keys, itemKeyValuesPath);

				result.push([instance, opType]);
			}
		}
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
		const modelConstructor = this.getModelConstructorByModelName(
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
		const storeName = this.getStorenameForModel(modelConstructor);
		const namespaceName = this.namespaceResolver(
			modelConstructor
		) as NAMESPACES;

		const predicates =
			predicate && ModelPredicateCreator.getPredicates(predicate);
		const keys = getIndexKeys(
			this.schema.namespaces[namespaceName],
			modelConstructor.name
		);
		const queryByKey =
			predicates && this.keyValueFromPredicate(predicates, keys);

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

			if (hasSort || hasPagination) {
				const all = await this.getAll(storeName);
				return this.inMemoryPagination(all, pagination);
			}

			return this.getAll(storeName);
		})()) as T[];

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

		const keyValues = [] as any[];

		for (const key of keys) {
			const predicateObj = predicateObjs.find(
				p => isPredicateObj(p) && p.field === key && p.operator === 'eq'
			) as PredicateObject<T>;

			predicateObj && keyValues.push(predicateObj.operand);
		}

		return keyValues.length === keys.length
			? keyValues.join(DEFAULT_PRIMARY_KEY_VALUE_SEPARATOR)
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
		return inMemoryPagination(records, pagination);
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
			const modelConstructor =
				modelOrModelConstructor as PersistentModelConstructor<T>;
			const nameSpace = this.namespaceResolver(modelConstructor) as NAMESPACES;

			// models to be deleted.
			const models = await this.query(modelConstructor, condition!);
			// TODO: refactor this to use a function like getRelations()
			const relations =
				this.schema.namespaces[nameSpace].relationships![modelConstructor.name]
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
			const model = modelOrModelConstructor as T;

			const modelConstructor = Object.getPrototypeOf(model)
				.constructor as PersistentModelConstructor<T>;
			const nameSpace = this.namespaceResolver(modelConstructor) as NAMESPACES;

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
				const { predicates: predicateObjs, type } = predicates!;

				const isValid = validatePredicate(fromDB, type, predicateObjs);
				if (!isValid) {
					const msg = 'Conditional update failed';
					logger.error(msg, { model: fromDB, condition: predicateObjs });

					throw new Error(msg);
				}

				const relations =
					this.schema.namespaces[nameSpace].relationships![
						modelConstructor.name
					].relationTypes;
				await this.deleteTraverse(
					relations,
					[model],
					modelConstructor.name,
					nameSpace,
					deleteQueue
				);
			} else {
				const relations =
					this.schema.namespaces[nameSpace].relationships![
						modelConstructor.name
					].relationTypes;

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

	private async deleteItem<T extends PersistentModel>(
		deleteQueue?: { storeName: string; items: T[] | IDBValidKey[] }[]
	) {
		for await (const deleteItem of deleteQueue!) {
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

			const index: string | undefined =
				getIndex(
					this.schema.namespaces[nameSpace].relationships![modelName]
						.relationTypes,
					srcModel
				) ||
				// if we were unable to find an index via relationTypes
				// i.e. for keyName connections, attempt to find one by the
				// associatedWith property
				getIndexFromAssociation(
					this.schema.namespaces[nameSpace].relationships![modelName].indexes,
					rel.associatedWith!
				);

			switch (relationType) {
				case 'HAS_ONE':
					for await (const model of models) {
						if (targetNames && targetNames?.length) {
							let hasOneIndex;

							if (index) {
								hasOneIndex = index.split(IDENTIFIER_KEY_SEPARATOR);
							} else if (associatedWith) {
								if (Array.isArray(associatedWith)) {
									hasOneIndex = associatedWith;
								} else {
									hasOneIndex = [associatedWith];
								}
							}

							// iterate over targetNames array and see if each key is present in model object
							// targetNames here being the keys for the CHILD model
							const hasConnectedModelFields = targetNames.every(targetName =>
								model.hasOwnProperty(targetName)
							);

							// PK / Composite key for the parent model
							const keyValuesPath: string = this.getIndexKeyValuesPath(model);

							let values;

							const isUnidirectionalConnection = hasOneIndex === associatedWith;

							if (hasConnectedModelFields && isUnidirectionalConnection) {
								// Values will be that of the child model
								values = targetNames
									.filter(targetName => model[targetName] ?? false)
									.map(targetName => model[targetName]) as any;
							} else {
								// values will be that of the parent model
								values = keyValuesPath.split(
									DEFAULT_PRIMARY_KEY_VALUE_SEPARATOR
								);
							}

							if (values.length === 0) break;

							const allRecords = await this.db.getAll(storeName);

							let recordToDelete;

							// values === targetNames
							if (hasConnectedModelFields) {
								/**
								 * Retrieve record by finding the record where all
								 * targetNames are present on the connected model.
								 *
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
								this.schema.namespaces[nameSpace].relationships![modelName]
									.relationTypes,
								recordToDelete,
								modelName,
								nameSpace,
								deleteQueue
							);
						} else {
							const hasOneIndex = index || associatedWith;
							const hasOneCustomField = targetName! in model;
							const keyValuesPath: string = this.getIndexKeyValuesPath(model);
							const value = hasOneCustomField
								? model[targetName!]
								: keyValuesPath;

							if (!value) break;

							const allRecords = await this.db.getAll(storeName);

							const recordsToDelete = allRecords.filter(
								childItem => childItem[hasOneIndex as string] === value
							) as T[];

							// instantiate models before passing to deleteTraverse
							// necessary for extracting PK values via getIndexKeyValuesFromModel
							const modelsToDelete = recordsToDelete.length
								? await this.load(nameSpace, modelName, recordsToDelete)
								: [];

							await this.deleteTraverse<T>(
								this.schema.namespaces[nameSpace].relationships![modelName]
									.relationTypes,
								modelsToDelete,
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
						const keyValues: string[] = this.getIndexKeyValuesFromModel(model);

						const allRecords = await this.db.getAll(storeName);

						const indices = index!.split(IDENTIFIER_KEY_SEPARATOR);

						const childRecords = allRecords.filter(childItem =>
							indices.every(index => keyValues.includes(childItem[index]))
						) as T[];

						// instantiate models before passing to deleteTraverse
						// necessary for extracting PK values via getIndexKeyValuesFromModel
						const childModels = await this.load(
							nameSpace,
							modelName,
							childRecords
						);

						await this.deleteTraverse<T>(
							this.schema.namespaces[nameSpace].relationships![modelName]
								.relationTypes,
							childModels,
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
					throw new Error(`Invalid relationType ${relationType}`);
			}
		}

		deleteQueue.push({
			storeName: getStorename(nameSpace, srcModel),
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

		this.db = undefined!;
		this.initPromise = undefined!;
	}

	async batchSave<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<any>,
		items: ModelInstanceMetadata[]
	): Promise<[T, OpType][]> {
		const { name: modelName } = modelConstructor;
		const namespaceName = this.namespaceResolver(modelConstructor);
		const storeName = getStorename(namespaceName, modelName);
		const keys = getIndexKeys(this.schema.namespaces[namespaceName], modelName);
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
				return keysEqual([instanceKeyValuesPath], [keyValuesPath]);
			})!;

			batch.push(instance);
		}

		return await this.db.batchSave(storeName, batch, keys);
	}
}

export default new AsyncStorageAdapter();
