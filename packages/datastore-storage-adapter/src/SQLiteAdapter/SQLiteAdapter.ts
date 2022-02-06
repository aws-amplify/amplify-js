import { ConsoleLogger as Logger } from '@aws-amplify/core';
import SQLiteDatabase from './SQLiteDatabase';
import {
	generateSchemaStatements,
	queryByIdStatement,
	modelUpdateStatement,
	modelInsertStatement,
	queryAllStatement,
	queryOneStatement,
	deleteByIdStatement,
	deleteByPredicateStatement,
	ParameterizedStatement,
} from './SQLiteUtils';

import {
	StorageAdapter,
	ModelInstanceCreator,
	ModelPredicateCreator,
	ModelSortPredicateCreator,
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
	utils,
} from '@aws-amplify/datastore';

const { traverseModel, validatePredicate, isModelConstructor } = utils;

const logger = new Logger('DataStore');
export class SQLiteAdapter implements StorageAdapter {
	private schema: InternalSchema;
	private namespaceResolver: NamespaceResolver;
	private modelInstanceCreator: ModelInstanceCreator;
	private getModelConstructorByModelName: (
		namsespaceName: string,
		modelName: string
	) => PersistentModelConstructor<any>;
	private db: SQLiteDatabase;
	private initPromise: Promise<void>;
	private resolve: (value?: any) => void;
	private reject: (value?: any) => void;

	// // Returns primary keys for a model
	// private getIndexKeys(namespaceName: string, modelName: string): string[] {
	// 	const keyPath =
	// 		this.schema.namespaces[namespaceName]?.keys[modelName].primaryKey;

	// 	if (keyPath) {
	// 		return keyPath;
	// 	}

	// 	return ['id'];
	// }

	// // Retrieves concatenated primary key values from a model
	// private getIndexKeyValuesPath<T extends PersistentModel<any>>(
	// 	model: T
	// ): string {
	// 	const modelConstructor = Object.getPrototypeOf(model)
	// 		.constructor as PersistentModelConstructor<T, any>;
	// 	const namespaceName = this.namespaceResolver(modelConstructor);
	// 	const keys = this.getIndexKeys(namespaceName, modelConstructor.name);

	// 	// Retrieve key values from model
	// 	const keyValues = keys.map(field => model[field]);

	// 	// Return concatenated key values
	// 	return keyValues.join(DEFAULT_PRIMARY_KEY_SEPARATOR);
	// }

	// // Retrieves concatenated primary key values from a model
	// private getIndexKeyValues<T extends PersistentModel<any>>(
	// 	model: T
	// ): string[] {
	// 	const modelConstructor = Object.getPrototypeOf(model)
	// 		.constructor as PersistentModelConstructor<T, any>;
	// 	const namespaceName = this.namespaceResolver(modelConstructor);
	// 	const keys = this.getIndexKeys(namespaceName, modelConstructor.name);

	// 	// Retrieve key values from model
	// 	return keys.map(field => model[field]);
	// }

	// private keysEqual(keysA, keysB): boolean {
	// 	if (keysA.length !== keysB.length) {
	// 		return false;
	// 	}

	// 	if (keysA.length === 1) {
	// 		return keysA[0] === keysB[0];
	// 	}

	// 	return keysA.every((key, idx) => key === keysB[idx]);
	// }

	public async setUp(
		theSchema: InternalSchema,
		namespaceResolver: NamespaceResolver,
		modelInstanceCreator: ModelInstanceCreator,
		getModelConstructorByModelName: (
			namsespaceName: string,
			modelName: string
		) => PersistentModelConstructor<any, any>
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

	async save<T extends PersistentModel<any>>(
		model: T,
		condition?: ModelPredicate<T>
	): Promise<[T, OpType.INSERT | OpType.UPDATE][]> {
		const modelConstructor = Object.getPrototypeOf(model)
			.constructor as PersistentModelConstructor<T, any>;

		const { name: tableName } = modelConstructor;

		// const namespaceName = this.namespaceResolver(modelConstructor);

		const connectedModels = traverseModel(
			modelConstructor.name,
			model,
			// this.schema.namespaces[namespaceName],
			this.schema.namespaces[this.namespaceResolver(modelConstructor)],
			this.modelInstanceCreator,
			this.getModelConstructorByModelName
		);
		const connectionStoreNames = Object.values(connectedModels).map(
			({ modelName, item, instance }) => {
				// const keys = this.getIndexKeyPath(namespaceName, modelName);
				// return { modelName, item, instance, keys };
				return { modelName, item, instance };
			}
		);

		// const keyValues = this.getIndexKeyValues(model);
		// TODO: update query by id statement
		const [queryStatement, params] = queryByIdStatement(model.id, tableName);

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

		const result: [T, OpType.INSERT | OpType.UPDATE][] = [];
		const saveStatements = new Set<ParameterizedStatement>();

		for await (const resItem of connectionStoreNames) {
			// TODO: remove these lines
			const { modelName, item, instance } = resItem;
			const { id } = item;
			// const { storeName, item, instance, keys } = resItem;

			/* Extract keys from concatenated key path,
			find the values in the item, and concatenate them */
			// const itemKeyValues = [
			// 	keys[0]
			// 		.split(DEFAULT_PRIMARY_KEY_SEPARATOR)
			// 		.map(key => item[key])
			// 		.join(DEFAULT_PRIMARY_KEY_SEPARATOR),
			// ];

			// const fromDB = <T>await this.db.get(itemKeyValues, storeName);

			// TODO: replace
			const [queryStatement, params] = queryByIdStatement(id, modelName);
			const fromDB = await this.db.get(queryStatement, params);

			const opType: OpType =
				fromDB === undefined ? OpType.INSERT : OpType.UPDATE;

			// TODO: add
			// const modelKeyValues = this.getIndexKeyValues(model);
			// const keysEqual = this.keysEqual(itemKeyValues, modelKeyValues);

			// From Async:
			// If item key values and model key values are equal, save to db
			// if (keysEqual || opType === OpType.INSERT) {
			// 	await this.db.save(item, storeName, keys, itemKeyValues);
			// TODO: replace below:
			const saveStatement = fromDB
				? modelUpdateStatement(instance, modelName)
				: modelInsertStatement(instance, modelName);

			saveStatements.add(saveStatement);

			result.push([instance, opType]);
		}

		await this.db.batchSave(saveStatements);

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
			const {
				fieldName,
				modelName: tableName,
				targetName,
				relationType,
			} = relation;

			const modelConstructor = this.getModelConstructorByModelName(
				namespaceName,
				tableName
			);

			// TODO: use SQL JOIN instead
			switch (relationType) {
				case 'HAS_ONE':
					for await (const recordItem of records) {
						const getByfield = recordItem[targetName] ? targetName : fieldName;
						if (!recordItem[getByfield]) break;

						const [queryStatement, params] = queryByIdStatement(
							recordItem[getByfield],
							tableName
						);

						// TODO: replace
						const connectionRecord = await this.db.get(queryStatement, params);
						// WITH:
						// const key = [recordItem[getByfield]];

						// const connectionRecord = await this.db.get(key, storeName);

						recordItem[fieldName] =
							connectionRecord &&
							this.modelInstanceCreator(modelConstructor, connectionRecord);
					}

					break;
				case 'BELONGS_TO':
					for await (const recordItem of records) {
						if (recordItem[targetName]) {
							const [queryStatement, params] = queryByIdStatement(
								recordItem[targetName],
								tableName
							);
							// REPLACE:
							const connectionRecord = await this.db.get(
								queryStatement,
								params
							);
							// WITH:
							// const key = [recordItem[targetName]];

							// const connectionRecord = await this.db.get(key, storeName);

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
					const _: never = relationType as never;
					throw new Error(`invalid relation type ${relationType}`);
					break;
			}
		}

		return records.map(record =>
			this.modelInstanceCreator(modelConstructor, record)
		);
	}

	async query<T extends PersistentModel<any>>(
		modelConstructor: PersistentModelConstructor<T, any>,
		predicate?: ModelPredicate<T>,
		pagination?: PaginationInput<T>
	): Promise<T[]> {
		const { name: tableName } = modelConstructor;
		const namespaceName = this.namespaceResolver(modelConstructor);

		const predicates =
			predicate && ModelPredicateCreator.getPredicates(predicate);
		const sortPredicates =
			pagination &&
			pagination.sort &&
			ModelSortPredicateCreator.getPredicates(pagination.sort);
		const limit = pagination && pagination.limit;
		const page = limit && pagination.page;

		// TODO: replace
		const queryById = predicates && this.idFromPredicate(predicates);
		// const keyPath = this.getIndexKeyPath(namespaceName, modelConstructor.name);
		// const queryByKey =
		// 	predicates && this.keyValueFromPredicate(predicates, keyPath);

		const records: T[] = <T[]>await (async () => {
			// TODO: replace
			if (queryById) {
				const record = await this.getById(tableName, queryById);
				return record ? [record] : [];
			}
			// if (queryByKey) {
			// 	const record = await this.getByKey(storeName, queryByKey);
			// 	return record ? [record] : [];
			// }

			const [queryStatement, params] = queryAllStatement(
				tableName,
				predicates,
				sortPredicates,
				limit,
				page
			);

			return await this.db.getAll(queryStatement, params);
		})();

		return await this.load(namespaceName, modelConstructor.name, records);
	}

	// private async getByKey<T extends PersistentModel>(
	private async getById<T extends PersistentModel>(
		tableName: string,
		id: string
		// keyValue: string[]
	): Promise<T> {
		// Something like:
		// const record = <T>await this.db.get(keyValue, storeName);
		const [queryStatement, params] = queryByIdStatement(id, tableName);
		const record = await this.db.get<T>(queryStatement, params);
		return record;
	}

	// private keyValueFromPredicate<T extends PersistentModel>(
	// 	predicates: PredicatesGroup<T>,
	// 	keyPathJoined: string[]
	// ): string[] | undefined {
	private idFromPredicate<T extends PersistentModel>(
		predicates: PredicatesGroup<T>
	) {
		const { predicates: predicateObjs } = predicates;

		// TODO: replace:
		const idPredicate =
			predicateObjs.length === 1 &&
			(predicateObjs.find(
				p => isPredicateObj(p) && p.field === 'id' && p.operator === 'eq'
			) as PredicateObject<T>);

		return idPredicate && idPredicate.operand;

		// with:
		// Extract keys from concatenated key path
		// const keyPath = keyPathJoined[0].split(DEFAULT_PRIMARY_KEY_SEPARATOR);

		// if (predicateObjs.length !== keyPath.length) {
		// 	return;
		// }

		// const keyValues = [];

		// for (const key of keyPath) {
		// 	const predicateObj = predicateObjs.find(
		// 		p => isPredicateObj(p) && p.field === key && p.operator === 'eq'
		// 	) as PredicateObject<T>;

		// 	predicateObj && keyValues.push(predicateObj.operand);
		// }

		// return (
		// 	keyValues.length === keyPath.length && [
		// 		keyValues.join(DEFAULT_PRIMARY_KEY_SEPARATOR),
		// 	]
		// );
	}

	async queryOne<T extends PersistentModel<any>>(
		modelConstructor: PersistentModelConstructor<T, any>,
		firstOrLast: QueryOne = QueryOne.FIRST
	): Promise<T | undefined> {
		const { name: tableName } = modelConstructor;
		const [queryStatement, params] = queryOneStatement(firstOrLast, tableName);

		const result = await this.db.get<T>(queryStatement, params);

		const modelInstance =
			result && this.modelInstanceCreator(modelConstructor, result);

		return modelInstance;
	}

	// TODO: resume here:
	// Currently does not cascade
	// TODO: use FKs in relations and have `ON DELETE CASCADE` set
	// For Has Many and Has One relations to have SQL handle cascades automatically
	async delete<T extends PersistentModel<any>>(
		modelOrModelConstructor: T | PersistentModelConstructor<T, any>,
		condition?: ModelPredicate<T>
	): Promise<[T[], T[]]> {
		if (isModelConstructor(modelOrModelConstructor)) {
			const modelConstructor = modelOrModelConstructor;
			const namespaceName = this.namespaceResolver(modelConstructor);
			const { name: tableName } = modelConstructor;

			const predicates =
				condition && ModelPredicateCreator.getPredicates(condition);

			const queryStatement = queryAllStatement(tableName, predicates);
			const deleteStatement = deleteByPredicateStatement(tableName, predicates);

			const models = await this.db.selectAndDelete(
				queryStatement,
				deleteStatement
			);

			const modelInstances = await this.load(
				namespaceName,
				modelConstructor.name,
				models
			);

			return [modelInstances, modelInstances];
		} else {
			const model = modelOrModelConstructor as T;
			const modelConstructor = Object.getPrototypeOf(model)
				.constructor as PersistentModelConstructor<T, any>;
			const { name: tableName } = modelConstructor;

			// namespace?

			if (condition) {
				// TODO: replace with queryByKey
				// const keyValues = this.getIndexKeyValues(model);
				// const fromDB = await this.db.get(keyValues, storeName);

				const [queryStatement, params] = queryByIdStatement(
					model.id,
					tableName
				);

				const fromDB = await this.db.get(queryStatement, params);

				if (fromDB === undefined) {
					const msg = 'Model instance not found in storage';
					logger.warn(msg, { model });

					return [[model], []];
				}

				const predicates = ModelPredicateCreator.getPredicates(condition);
				const { predicates: predicateObjs, type } = predicates;

				const isValid = validatePredicate<T>(fromDB, type, predicateObjs);

				if (!isValid) {
					const msg = 'Conditional update failed';
					logger.error(msg, { model: fromDB, condition: predicateObjs });

					throw new Error(msg);
				}

				// No relations?

				// UPDATE:
				const [deleteStatement, deleteParams] = deleteByIdStatement(
					model.id,
					tableName
				);
				await this.db.save(deleteStatement, deleteParams);
				return [[model], [model]];
			} else {
				// UPDATE:
				const [deleteStatement, params] = deleteByIdStatement(
					model.id,
					tableName
				);
				await this.db.save(deleteStatement, params);
				return [[model], [model]];
			}
		}
	}

	async batchSave<T extends PersistentModel<any>>(
		modelConstructor: PersistentModelConstructor<any>,
		items: ModelInstanceMetadata[]
	): Promise<[T, OpType][]> {
		const { name: tableName } = modelConstructor;

		const result: [T, OpType][] = [];

		const itemsToSave: T[] = [];
		// To determine whether an item should result in an insert or update operation
		// We first need to query the local DB on the item id
		const queryStatements = new Set<ParameterizedStatement>();
		// Deletes don't need to be queried first, because if the item doesn't exist,
		// the delete operation will be a no-op
		const deleteStatements = new Set<ParameterizedStatement>();
		const saveStatements = new Set<ParameterizedStatement>();

		// NEED THIS?
		// const keyPath = this.getIndexKeyPath(namespaceName, modelName);

		for (const item of items) {
			// ADD:
			// const model = this.modelInstanceCreator(modelConstructor, item);

			// REPLACE:
			const connectedModels = traverseModel(
				// name,
				modelConstructor.name,
				// model,
				this.modelInstanceCreator(modelConstructor, item),
				// this.schema.namespaces[namespaceName],
				this.schema.namespaces[this.namespaceResolver(modelConstructor)],
				this.modelInstanceCreator,
				this.getModelConstructorByModelName
			);

			// Don't need id, but what is _deleted, here?
			const { id, _deleted } = item as ModelInstanceMetadata & { id: string };

			// REPLACE:
			const { instance } = connectedModels.find(
				({ instance }) => instance.id === id
			);
			// WITH:
			// const keyValues = this.getIndexKeyValues(model);

			// const { instance } = connectedModels.find(({ instance }) => {
			// 	const instanceKeyValues = [this.getIndexKeyValues(instance)[0]];
			// 	return this.keysEqual(instanceKeyValues, [keyValues[0]]);
			// });

			if (_deleted) {
				// create the delete statements right away
				// TODO: should be deleteByKeyStatement:
				const deleteStatement = deleteByIdStatement(instance.id, tableName);
				deleteStatements.add(deleteStatement);
				result.push([<T>(<unknown>item), OpType.DELETE]);
			} else {
				// query statements for the saves at first
				// TODO: should be queryByKeyStatement:
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
