import { ConsoleLogger as Logger } from '@aws-amplify/core';
import SQLiteDatabase from './SQLiteDatabase';
import {
	generateSchemaStatements,
	queryByIdStatement,
	modelUpdateStatement,
	modelInsertStatement,
	queryAllStatement,
	queryOneStatement,
	modelDeleteStatement,
	SQLStatement,
} from './SQLiteUtils';

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

export class SQLiteAdapter implements Adapter {
	private schema: InternalSchema;
	private namespaceResolver: NamespaceResolver;
	private modelInstanceCreator: ModelInstanceCreator;
	private getModelConstructorByModelName: (
		namsespaceName: string,
		modelName: string
	) => PersistentModelConstructor<any>;
	private db: any;
	// private db: SQLiteDatabase;
	private initPromise: Promise<void>;
	private resolve: (value?: any) => void;
	private reject: (value?: any) => void;

	public async setUp(
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
				this.db = new SQLiteDatabase();
				await this.db.init();

				const statements = generateSchemaStatements(this.schema);
				await this.db.createSchema(statements);
				this.resolve();
			}
		} catch (error) {
			this.reject(error);
		}
	}

	async clear(): Promise<void> {
		await this.db.clear();

		this.db = undefined;
		this.initPromise = undefined;
	}

	async save<T extends PersistentModel>(
		model: T,
		condition?: ModelPredicate<T>
	): Promise<[T, OpType.INSERT | OpType.UPDATE][]> {
		const modelConstructor = Object.getPrototypeOf(model)
			.constructor as PersistentModelConstructor<T>;
		const { name: modelName } = modelConstructor;

		const [queryStatement, params] = queryByIdStatement(model.id, modelName);

		const fromDB = await this.db.get(queryStatement, params);

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

		const opType: OpType = fromDB === undefined ? OpType.INSERT : OpType.UPDATE;

		const result: [T, OpType.INSERT | OpType.UPDATE][] = [];

		const [saveStatement, saveParams] = fromDB
			? modelUpdateStatement(model, modelName)
			: modelInsertStatement(model, modelName);

		await this.db.save(saveStatement, saveParams);

		result.push([model, opType]);

		return result;
	}

	private async load<T>(
		namespaceName: string,
		srcModelName: string,
		records: T[]
	): Promise<T[]> {
		const namespace = this.schema.namespaces[namespaceName];
		const relations = namespace.relationships[srcModelName].relationTypes;
		const connectionTableNames = relations.map(({ modelName }) => modelName);

		const modelConstructor = this.getModelConstructorByModelName(
			namespaceName,
			srcModelName
		);

		if (connectionTableNames.length === 0) {
			return records.map(record =>
				this.modelInstanceCreator(modelConstructor, record)
			);
		}

		for await (const relation of relations) {
			const { fieldName, modelName, targetName, relationType } = relation;

			const modelConstructor = this.getModelConstructorByModelName(
				namespaceName,
				modelName
			);

			switch (relationType) {
				case 'HAS_ONE':
					for await (const recordItem of records) {
						if (recordItem[fieldName]) {
							const connectionRecord = await this.db.get(
								recordItem[fieldName],
								modelName
							);

							recordItem[fieldName] =
								connectionRecord &&
								this.modelInstanceCreator(modelConstructor, connectionRecord);
						}
					}

					break;
				case 'BELONGS_TO':
					for await (const recordItem of records) {
						if (recordItem[targetName]) {
							const connectionRecord = await this.db.get(
								recordItem[targetName],
								modelName
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
		const { name: tableName } = modelConstructor;
		// const storeName = this.getStorenameForModel(modelConstructor);
		const namespaceName = this.namespaceResolver(modelConstructor);

		const predicates =
			predicate && ModelPredicateCreator.getPredicates(predicate);
		const queryById = predicates && this.idFromPredicate(predicates);
		const sort = pagination && pagination.sort;
		const limit = pagination && pagination.limit;

		const records: T[] = <T[]>await (async () => {
			if (queryById) {
				const record = await this.getById(tableName, queryById);
				return record ? [record] : [];
			}

			console.log('query predicates', predicate, predicates);
			console.log('query sort', sort);
			console.log('query limit', limit);

			const [queryStatement, params] = queryAllStatement(tableName, predicates);
			return await this.db.getAll(queryStatement, params, sort, limit);
		})();

		return await this.load(namespaceName, modelConstructor.name, records);
	}

	private async getById<T extends PersistentModel>(
		tableName: string,
		id: string
	): Promise<T> {
		const [queryStatement, params] = queryByIdStatement(id, tableName);
		const record = await this.db.get(queryStatement, params);
		return record;
	}

	private async getAll<T extends PersistentModel>(
		tableName: string
	): Promise<T[]> {
		const [queryStatement, params] = queryAllStatement(tableName);
		return await this.db.getAll(queryStatement, params);
	}

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

	async queryOne<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		firstOrLast: QueryOne = QueryOne.FIRST
	): Promise<T | undefined> {
		const { name: tableName } = modelConstructor;
		const [queryStatement, params] = queryOneStatement(firstOrLast, tableName);

		const result = await this.db.get(queryStatement, params);
		return result && this.modelInstanceCreator(modelConstructor, result);
	}

	async delete<T extends PersistentModel>(
		modelOrModelConstructor: T | PersistentModelConstructor<T>,
		condition?: ModelPredicate<T>
	): Promise<[T[], T[]]> {
		const deleteQueue: { storeName: string; items: T[] }[] = [];
		return undefined;
	}
	/*
		if (isModelConstructor(modelOrModelConstructor)) {
			const modelConstructor = modelOrModelConstructor;
			const nameSpace = this.namespaceResolver(modelConstructor);

			// models to be deleted.
			const models = await this.query(modelConstructor, condition);
			// TODO: refactor this to use a function like getRelations()
			const relations = this.schema.namespaces[nameSpace].relationships[
				modelConstructor.name
			].relationTypes;

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
			const nameSpace = this.namespaceResolver(modelConstructor);

			const storeName = this.getStorenameForModel(modelConstructor);
			if (condition) {
				const fromDB = await this.db.get(model.id, storeName);

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
					logger.error(msg, {
						model: fromDB,
						condition: predicateObjs,
					});

					throw new Error(msg);
				}

				const relations = this.schema.namespaces[nameSpace].relationships[
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
				const relations = this.schema.namespaces[nameSpace].relationships[
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

						const recordToDelete = <T>await this.db
							.transaction(storeName, 'readwrite')
							.objectStore(storeName)
							.index(hasOneIndex)
							.get(value);

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
*/
	async batchSave<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<any>,
		items: ModelInstanceMetadata[]
	): Promise<[T, OpType][]> {
		const { name: tableName } = modelConstructor;

		const result: [T, OpType][] = [];

		const itemsToSave: T[] = [];
		// To determine whether an item should result in an insert or update operation
		// We first need to query the local DB on the item id
		const queryStatements = new Set<SQLStatement>();
		// Deletes don't need to be queried first, because if the item doesn't exist,
		// the delete operation will be a no-op
		const deleteStatements = new Set<SQLStatement>();
		const saveStatements = new Set<SQLStatement>();

		for (const item of items) {
			const connectedModels = traverseModel(
				modelConstructor.name,
				this.modelInstanceCreator(modelConstructor, item),
				this.schema.namespaces[this.namespaceResolver(modelConstructor)],
				this.modelInstanceCreator,
				this.getModelConstructorByModelName
			);

			const { id, _deleted } = item;

			const { instance } = connectedModels.find(
				({ instance }) => instance.id === id
			);

			if (_deleted) {
				// create the delete statements right away
				const deleteStatement = modelDeleteStatement(instance, tableName);
				deleteStatements.add(deleteStatement);
				result.push([<T>(<unknown>item), OpType.DELETE]);
			} else {
				// query statements for the saves at first
				const queryStatement = queryByIdStatement(id, tableName);
				queryStatements.add(queryStatement);
				// combination of insert and update items
				itemsToSave.push(instance);
			}
		}

		// returns the query results for each of the save items
		const queryResponses = await this.db.batchQuery(queryStatements);

		queryResponses.forEach((response, idx) => {
			if (response === undefined) {
				const insertStatement = modelInsertStatement(
					itemsToSave[idx],
					tableName
				);
				saveStatements.add(insertStatement);
				result.push([<T>(<unknown>itemsToSave[idx]), OpType.INSERT]);
			} else {
				const updateStatement = modelUpdateStatement(
					itemsToSave[idx],
					tableName
				);
				saveStatements.add(updateStatement);
				result.push([<T>(<unknown>itemsToSave[idx]), OpType.UPDATE]);
			}
		});

		// perform all of the insert/update/delete operations in a single transaction
		await this.db.batchSave(saveStatements, deleteStatements);

		return result;
	}
}

export default new SQLiteAdapter();
