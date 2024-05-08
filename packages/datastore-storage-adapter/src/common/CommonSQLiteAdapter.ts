// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { ConsoleLogger } from '@aws-amplify/core';
import {
	InternalSchema,
	ModelInstanceCreator,
	ModelPredicate,
	ModelPredicateCreator,
	ModelSortPredicateCreator,
	NAMESPACES,
	NamespaceResolver,
	OpType,
	PaginationInput,
	PersistentModel,
	PersistentModelConstructor,
	PredicateObject,
	PredicatesGroup,
	QueryOne,
	StorageAdapter,
	isPredicateObj,
	utils,
} from '@aws-amplify/datastore';

import {
	deleteByIdStatement,
	deleteByPredicateStatement,
	generateSchemaStatements,
	modelInsertStatement,
	modelUpdateStatement,
	queryAllStatement,
	queryByIdStatement,
	queryOneStatement,
} from '../common/SQLiteUtils';

import {
	CommonSQLiteDatabase,
	ModelInstanceMetadataWithId,
	ParameterizedStatement,
} from './types';

const { traverseModel, validatePredicate, isModelConstructor } = utils;

const logger = new ConsoleLogger('DataStore');

export class CommonSQLiteAdapter implements StorageAdapter {
	private schema: InternalSchema;
	private namespaceResolver: NamespaceResolver;
	private modelInstanceCreator: ModelInstanceCreator;
	private getModelConstructorByModelName: (
		namsespaceName: string,
		modelName: string,
	) => PersistentModelConstructor<any>;

	private db: CommonSQLiteDatabase;
	private initPromise: Promise<void>;
	private resolve: (value?: any) => void;
	private reject: (value?: any) => void;

	constructor(db: CommonSQLiteDatabase) {
		this.db = db;
	}

	public async setUp(
		theSchema: InternalSchema,
		namespaceResolver: NamespaceResolver,
		modelInstanceCreator: ModelInstanceCreator,
		getModelConstructorByModelName: (
			namsespaceName: NAMESPACES,
			modelName: string,
		) => PersistentModelConstructor<any>,
	) {
		if (!this.initPromise) {
			this.initPromise = new Promise((_resolve, _reject) => {
				this.resolve = _resolve;
				this.reject = _reject;
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
			const usesCPKCodegen = Object.values(
				this.schema.namespaces.user.models,
			).some(model =>
				Object.values(model.fields).some(field =>
					// eslint-disable-next-line no-prototype-builtins
					field.association?.hasOwnProperty('targetNames'),
				),
			);
			if (usesCPKCodegen) {
				logger.error(
					'The SQLite adapter does not support schemas using custom primary key. Set `graphQLTransformer.respectPrimaryKeyAttributesOnConnectionField in `amplify/cli.json` to false to disable custom primary key. To regenerate your API, add or remove an empty newline to your GraphQL schema (to change the computed hash) then run `amplify push`.',
				);
			}
			await this.db.init();
			const statements = generateSchemaStatements(this.schema);
			await this.db.createSchema(statements);

			this.resolve();
		} catch (error) {
			this.reject(error);
		}
	}

	async clear(): Promise<void> {
		await this.db.clear();

		this.initPromise = undefined;
	}

	async save<T extends PersistentModel>(
		model: T,
		condition?: ModelPredicate<T>,
	): Promise<[T, OpType.INSERT | OpType.UPDATE][]> {
		const modelConstructor = Object.getPrototypeOf(model)
			.constructor as PersistentModelConstructor<T>;
		const { name: tableName } = modelConstructor;
		const connectedModels = traverseModel(
			modelConstructor.name,
			model,
			this.schema.namespaces[this.namespaceResolver(modelConstructor)],
			this.modelInstanceCreator,
			this.getModelConstructorByModelName,
		);
		const connectionStoreNames = Object.values(connectedModels).map(
			({ modelName, item, instance }) => {
				return { modelName, item, instance };
			},
		);

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
			const { modelName, item, instance } = resItem;
			const { id } = item;

			const [queryStatementForRestItem, paramsForRestItem] = queryByIdStatement(
				id,
				modelName,
			);
			const fromDBForRestItem = await this.db.get(
				queryStatementForRestItem,
				paramsForRestItem,
			);

			const opType: OpType =
				fromDBForRestItem === undefined ? OpType.INSERT : OpType.UPDATE;

			const saveStatement = fromDBForRestItem
				? modelUpdateStatement(instance, modelName)
				: modelInsertStatement(instance, modelName);

			if (id === model.id || opType === OpType.INSERT) {
				saveStatements.add(saveStatement);
				result.push([instance, opType]);
			}
		}

		await this.db.batchSave(saveStatements);

		return result;
	}

	private async load<T>(
		namespaceName: string,
		srcModelName: string,
		records: T[],
	): Promise<T[]> {
		const namespace = this.schema.namespaces[namespaceName];
		const relations = namespace.relationships[srcModelName].relationTypes;
		const connectionTableNames = relations.map(({ modelName }) => modelName);

		const modelConstructor = this.getModelConstructorByModelName(
			namespaceName,
			srcModelName,
		);

		if (connectionTableNames.length === 0) {
			return records.map(record =>
				this.modelInstanceCreator(modelConstructor, record),
			);
		}

		// Remove related-model fields. They're all `null` in the database,
		// and any that happen to be required will result in a false validation
		// error when DataStore attempts to initialize with `null`.
		// These fields aren't actually needed here. DataStore will use the FK's
		// from the schema model.
		return records.map(record => {
			for (const r of relations) {
				delete record[r.fieldName];
			}

			return this.modelInstanceCreator(modelConstructor, record);
		});
	}

	async query<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		predicate?: ModelPredicate<T>,
		pagination?: PaginationInput<T>,
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

		const queryById = predicates && this.idFromPredicate(predicates);

		const records: T[] = (await (async () => {
			if (queryById) {
				const record = await this.getById(tableName, queryById);

				return record ? [record] : [];
			}

			const [queryStatement, params] = queryAllStatement(
				tableName,
				predicates,
				sortPredicates,
				limit,
				page,
			);

			return this.db.getAll(queryStatement, params);
		})()) as T[];

		return this.load(namespaceName, modelConstructor.name, records);
	}

	private async getById<T extends PersistentModel>(
		tableName: string,
		id: string,
	): Promise<T> {
		const [queryStatement, params] = queryByIdStatement(id, tableName);
		const record = await this.db.get<T>(queryStatement, params);

		return record;
	}

	private idFromPredicate<T extends PersistentModel>(
		predicates: PredicatesGroup<T>,
	) {
		const { predicates: predicateObjs } = predicates;
		const idPredicate =
			predicateObjs.length === 1 &&
			(predicateObjs.find(
				p => isPredicateObj(p) && p.field === 'id' && p.operator === 'eq',
			) as PredicateObject<T>);

		return idPredicate && idPredicate.operand;
	}

	async queryOne<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		firstOrLast: QueryOne = QueryOne.FIRST,
	): Promise<T | undefined> {
		const { name: tableName } = modelConstructor;
		const [queryStatement, params] = queryOneStatement(firstOrLast, tableName);

		const result = await this.db.get<T>(queryStatement, params);

		const modelInstance =
			result && this.modelInstanceCreator(modelConstructor, result);

		return modelInstance;
	}

	// Currently does not cascade
	// TODO: use FKs in relations and have `ON DELETE CASCADE` set
	// For Has Many and Has One relations to have SQL handle cascades automatically
	async delete<T extends PersistentModel>(
		modelOrModelConstructor: T | PersistentModelConstructor<T>,
		condition?: ModelPredicate<T>,
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
				deleteStatement,
			);

			const modelInstances = await this.load(
				namespaceName,
				modelConstructor.name,
				models,
			);

			return [modelInstances, modelInstances];
		} else {
			const model = modelOrModelConstructor as T;
			const modelConstructor = Object.getPrototypeOf(model)
				.constructor as PersistentModelConstructor<T>;
			const { name: tableName } = modelConstructor;

			if (condition) {
				const [queryStatement, params] = queryByIdStatement(
					model.id,
					tableName,
				);

				const fromDB = await this.db.get(queryStatement, params);

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

				const [deleteStatement, deleteParams] = deleteByIdStatement(
					model.id,
					tableName,
				);
				await this.db.save(deleteStatement, deleteParams);

				return [[model], [model]];
			} else {
				const [deleteStatement, params] = deleteByIdStatement(
					model.id,
					tableName,
				);
				await this.db.save(deleteStatement, params);

				return [[model], [model]];
			}
		}
	}

	async batchSave<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<any>,
		items: ModelInstanceMetadataWithId[],
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

		for (const item of items) {
			const connectedModels = traverseModel(
				modelConstructor.name,
				this.modelInstanceCreator(modelConstructor, item),
				this.schema.namespaces[this.namespaceResolver(modelConstructor)],
				this.modelInstanceCreator,
				this.getModelConstructorByModelName,
			);

			const { id, _deleted } = item;

			const { instance } = connectedModels.find(
				({ instance: connectedModelInstance }) =>
					connectedModelInstance.id === id,
			);

			if (_deleted) {
				// create the delete statements right away
				const deleteStatement = deleteByIdStatement(instance.id, tableName);
				deleteStatements.add(deleteStatement);
				result.push([item as unknown as T, OpType.DELETE]);
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
					tableName,
				);
				saveStatements.add(insertStatement);
				result.push([itemsToSave[idx] as unknown as T, OpType.INSERT]);
			} else {
				const updateStatement = modelUpdateStatement(
					itemsToSave[idx],
					tableName,
				);
				saveStatements.add(updateStatement);
				result.push([itemsToSave[idx] as unknown as T, OpType.UPDATE]);
			}
		});

		// perform all of the insert/update/delete operations in a single transaction
		await this.db.batchSave(saveStatements, deleteStatements);

		return result;
	}
}
