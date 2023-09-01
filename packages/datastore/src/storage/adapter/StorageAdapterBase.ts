// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { ConsoleLogger as Logger } from '@aws-amplify/core';
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
} from '../../types';
import {
	NAMESPACES,
	getStorename,
	getIndexKeys,
	extractPrimaryKeyValues,
	traverseModel,
	validatePredicate,
	isModelConstructor,
	extractPrimaryKeyFieldNames,
} from '../../util';
import type { IDBPDatabase, IDBPObjectStore } from 'idb';
import type AsyncStorageDatabase from './AsyncStorageDatabase';
import { ModelRelationship } from '../relationship';

const logger = new Logger('DataStore');
const DB_NAME = 'amplify-datastore';

export abstract class StorageAdapterBase implements Adapter {
	// Non-null assertions (bang operators) added to most properties to make TS happy.
	// For now, we can be reasonably sure they're available when they're needed, because
	// the adapter is not used directly outside the library boundary.
	protected schema!: InternalSchema;
	protected namespaceResolver!: NamespaceResolver;
	protected modelInstanceCreator!: ModelInstanceCreator;
	protected getModelConstructorByModelName!: (
		namsespaceName: NAMESPACES,
		modelName: string
	) => PersistentModelConstructor<any>;
	protected initPromise!: Promise<void>;
	protected resolve!: (value?: any) => void;
	protected reject!: (value?: any) => void;
	protected dbName: string = DB_NAME;
	protected abstract db: IDBPDatabase | AsyncStorageDatabase;

	protected abstract preSetUpChecks(): Promise<void>;
	protected abstract preOpCheck(): Promise<void>;
	protected abstract initDb(): Promise<IDBPDatabase | AsyncStorageDatabase>;

	/**
	 * Initializes local DB
	 *
	 * @param theSchema
	 * @param namespaceResolver
	 * @param modelInstanceCreator
	 * @param getModelConstructorByModelName
	 * @param sessionId
	 */
	public async setUp(
		theSchema: InternalSchema,
		namespaceResolver: NamespaceResolver,
		modelInstanceCreator: ModelInstanceCreator,
		getModelConstructorByModelName: (
			namsespaceName: NAMESPACES,
			modelName: string
		) => PersistentModelConstructor<any>,
		sessionId?: string
	): Promise<void> {
		await this.preSetUpChecks();

		if (!this.initPromise) {
			this.initPromise = new Promise((res, rej) => {
				this.resolve = res;
				this.reject = rej;
			});
		} else {
			await this.initPromise;
			return;
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
				this.db = await this.initDb();
				this.resolve();
			}
		} catch (error) {
			this.reject(error);
		}
	}

	/*
	 * Abstract Methods for Adapter interface
	 * Not enough implementation similarities between the adapters
	 * to consolidate in the base class
	 */
	public abstract clear(): Promise<void>;

	public abstract save<T extends PersistentModel>(
		model: T,
		condition?: ModelPredicate<T>
	);

	public abstract query<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		predicate?: ModelPredicate<T>,
		pagination?: PaginationInput<T>
	): Promise<T[]>;

	public abstract queryOne<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		firstOrLast: QueryOne
	): Promise<T | undefined>;

	public abstract batchSave<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<any>,
		items: ModelInstanceMetadata[]
	): Promise<[T, OpType][]>;

	/**
	 * @param modelConstructor
	 * @returns local DB table name
	 */
	protected getStorenameForModel(
		modelConstructor: PersistentModelConstructor<any>
	): string {
		const namespace = this.namespaceResolver(modelConstructor);
		const { name: modelName } = modelConstructor;

		return getStorename(namespace, modelName);
	}

	/**
	 *
	 * @param model - instantiated model record
	 * @returns the record's primary key values
	 */
	protected getIndexKeyValuesFromModel<T extends PersistentModel>(
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

	/**
	 * Common metadata for `save` operation
	 * used by individual storage adapters
	 *
	 * @param model
	 */
	protected saveMetadata<T extends PersistentModel>(
		model: T
	): {
		storeName: string;
		set: Set<string>;
		connectionStoreNames;
		modelKeyValues: string[];
	} {
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

		const modelKeyValues = this.getIndexKeyValuesFromModel(model);

		return { storeName, set, connectionStoreNames, modelKeyValues };
	}

	/**
	 * Enforces conditional save. Throws if condition is not met.
	 * used by individual storage adapters
	 *
	 * @param model
	 */
	protected validateSaveCondition<T extends PersistentModel>(
		condition?: ModelPredicate<T>,
		fromDB?: unknown
	): void {
		if (!(condition && fromDB)) {
			return;
		}

		const predicates = ModelPredicateCreator.getPredicates(condition);
		const { predicates: predicateObjs, type } = predicates!;

		const isValid = validatePredicate(fromDB, type, predicateObjs);

		if (!isValid) {
			const msg = 'Conditional update failed';
			logger.error(msg, { model: fromDB, condition: predicateObjs });

			throw new Error(msg);
		}
	}

	protected abstract _get<T>(
		storeOrStoreName: IDBPObjectStore | string,
		keyArr: string[]
	): Promise<T>;

	/**
	 * Instantiate models from POJO records returned from the database
	 *
	 * @param namespaceName - string model namespace
	 * @param srcModelName - string model name
	 * @param records - array of uninstantiated records
	 * @returns
	 */
	protected async load<T>(
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

	/**
	 * Extracts operands from a predicate group into an array of key values
	 * Used in the query method
	 *
	 * @param predicates - predicate group
	 * @param keyPath - string array of key names ['id', 'sortKey']
	 * @returns string[] of key values
	 *
	 * @example
	 * ```js
	 * { and:[{ id: { eq: 'abc' }}, { sortKey: { eq: 'def' }}] }
	 * ```
	 * Becomes
	 * ```
	 * ['abc', 'def']
	 * ```
	 */
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
				p =>
					// it's a relevant predicate object only if it's an equality
					// operation for a key field from the key:
					isPredicateObj(p) &&
					p.field === key &&
					p.operator === 'eq' &&
					p.operand !== null &&
					p.operand !== undefined
			) as PredicateObject<T>;

			predicateObj && keyValues.push(predicateObj.operand);
		}

		return keyValues.length === keyPath.length ? keyValues : undefined;
	}

	/**
	 * Common metadata for `query` operation
	 * used by individual storage adapters
	 *
	 * @param modelConstructor
	 * @param predicate
	 * @param pagination
	 */
	protected queryMetadata<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		predicate?: ModelPredicate<T>,
		pagination?: PaginationInput<T>
	) {
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

		return {
			storeName,
			namespaceName,
			queryByKey,
			predicates,
			hasSort,
			hasPagination,
		};
	}

	/**
	 * Delete record
	 * Cascades to related records (for Has One and Has Many relationships)
	 *
	 * @param modelOrModelConstructor
	 * @param condition
	 * @returns
	 */
	public async delete<T extends PersistentModel>(
		modelOrModelConstructor: T | PersistentModelConstructor<T>,
		condition?: ModelPredicate<T>
	): Promise<[T[], T[]]> {
		await this.preOpCheck();

		const deleteQueue: { storeName: string; items: T[] }[] = [];

		if (isModelConstructor(modelOrModelConstructor)) {
			const modelConstructor =
				modelOrModelConstructor as PersistentModelConstructor<T>;
			const namespace = this.namespaceResolver(modelConstructor) as NAMESPACES;
			const models = await this.query(modelConstructor, condition);

			if (condition !== undefined) {
				await this.deleteTraverse(
					models,
					modelConstructor,
					namespace,
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
					models,
					modelConstructor,
					namespace,
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

			const namespaceName = this.namespaceResolver(
				modelConstructor
			) as NAMESPACES;

			const storeName = this.getStorenameForModel(modelConstructor);

			if (condition) {
				const keyValues = this.getIndexKeyValuesFromModel(model);
				const fromDB = await this._get(storeName, keyValues);

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

				await this.deleteTraverse(
					[model],
					modelConstructor,
					namespaceName,
					deleteQueue
				);
			} else {
				await this.deleteTraverse(
					[model],
					modelConstructor,
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

	protected abstract deleteItem<T extends PersistentModel>(
		deleteQueue?: {
			storeName: string;
			items: T[] | IDBValidKey[];
		}[]
	);

	/**
	 * Recursively traverse relationship graph and add
	 * all Has One and Has Many relations to `deleteQueue` param
	 *
	 * Actual deletion of records added to `deleteQueue` occurs in the `delete` method
	 *
	 * @param models
	 * @param modelConstructor
	 * @param namespace
	 * @param deleteQueue
	 */
	private async deleteTraverse<T extends PersistentModel>(
		models: T[],
		modelConstructor: PersistentModelConstructor<T>,
		namespace: NAMESPACES,
		deleteQueue: { storeName: string; items: T[] }[]
	): Promise<void> {
		const cascadingRelationTypes = ['HAS_ONE', 'HAS_MANY'];

		for await (const model of models) {
			const modelDefinition =
				this.schema.namespaces[namespace].models[modelConstructor.name];

			const modelMeta = {
				builder: modelConstructor,
				schema: modelDefinition,
				pkField: extractPrimaryKeyFieldNames(modelDefinition),
			};

			const relationships = ModelRelationship.allFrom(modelMeta).filter(r =>
				cascadingRelationTypes.includes(r.type)
			);

			for await (const r of relationships) {
				const queryObject = r.createRemoteQueryObject(model);
				if (queryObject !== null) {
					const relatedRecords = await this.query(
						r.remoteModelConstructor,
						ModelPredicateCreator.createFromFlatEqualities(
							r.remoteDefinition!,
							queryObject
						)
					);

					await this.deleteTraverse(
						relatedRecords,
						r.remoteModelConstructor,
						namespace,
						deleteQueue
					);
				}
			}
		}

		deleteQueue.push({
			storeName: getStorename(namespace, modelConstructor.name),
			items: models,
		});
	}
}
