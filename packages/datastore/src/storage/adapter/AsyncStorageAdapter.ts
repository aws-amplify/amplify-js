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

/**
 * Adapter layer intended to sit between `StorageFacade` and AsyncStorageDatabase.
 *
 * @see AsyncStorageDatabase
 */
export class AsyncStorageAdapter implements Adapter {
	private schema: InternalSchema;

	/**
	 * A function that accepts a Model constructor and determines the
	 * namespace the model lives in.
	 *
	 * @see NamespaceResolver
	 *
	 * param modelConstructor — The Model constructor to inspects
	 * @returns — The namespace as a string.
	 */
	private namespaceResolver: NamespaceResolver;

	/**
	 * Constructs a model and records it with its metadata in a weakset.
	 * Allows for the separate storage of core model fields and
	 * Amplify/DataStore metadata fields that the customer app does not want
	 * exposed.
	 *
	 * @param modelConstructor — The model constructor.
	 * @param init — Init data that would normally be passed to the
	 * constructor.
	 * @returns — The initialized model.
	 */
	private modelInstanceCreator: ModelInstanceCreator;

	private getModelConstructorByModelName: (
		namsespaceName: string,
		modelName: string
	) => PersistentModelConstructor<any>;
	private db: AsyncStorageDatabase;
	private initPromise: Promise<void>;
	private resolve: (value?: any) => void;
	private reject: (value?: any) => void;

	/**
	 * Derives the fully qualified name from a model constructor.
	 *
	 * This name should exactly equal the table name holding the model
	 * instances in IndexedDB.
	 *
	 * @param modelConstructor A model instance constructor.
	 * @returns The full table name for the given model.
	 */
	private getStorenameForModel(
		modelConstructor: PersistentModelConstructor<any>
	) {
		const namespace = this.namespaceResolver(modelConstructor);
		const { name: modelName } = modelConstructor;

		return this.getStorename(namespace, modelName);
	}

	/**
	 * Given a namespace and model name, generates a fully qualified name.
	 *
	 * This name is intended to be used as the table name &mdash; and anywhere
	 * else an unambiguous name is required for the given namespace-model.
	 *
	 * @param namespace The namespace to contextualize the name in. (E.g., USER, STORAGE, SYNC, etc.)
	 * @param modelName The bare model name to derive from.
	 * @returns A fully qualified table name.
	 */
	private getStorename(namespace: string, modelName: string) {
		const storeName = `${namespace}_${modelName}`;

		return storeName;
	}

	/**
	 * Initializes a local database, no schema init.
	 *
	 * Also accepts methods that the adapter should use when determining
	 * namespaces for fully qualified names, the reverse of this operation,
	 * and a preferred function to use for model instantiation.
	 *
	 * Accepting a preferred function for model instantiation comes with
	 * possible side effects. E.g., it is completely expected that the instance
	 * creator function may keep a record metadata in a WeakMap for every
	 * known Model instance.
	 *
	 * SIDE EFFECT:
	 * 1. Potentially clobbers local database.
	 * 1. Places the `resolve()` and `reject()` methods on `this` to use as
	 * "cross-thread" communcation between `setUp()` attempts.
	 *
	 * @param theSchema
	 * @param namespaceResolver
	 * @param modelInstanceCreator
	 * @param getModelConstructorByModelName
	 */
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

	/**
	 * @see Adapter
	 *
	 * @param model The model instance to save.
	 * @param condition The conditions under which the save should succeed.
	 * Omission attempts to save unconditionally.
	 * @returns The a tuple of the saved model and operation type
	 * (INSERT/UPDATE) needed to affect the save. The returned model
	 * includes the new `id` field if one had to be generated.
	 */
	async save<T extends PersistentModel>(
		model: T,
		condition?: ModelPredicate<T>
	): Promise<[T, OpType.INSERT | OpType.UPDATE][]> {
		const modelConstructor = Object.getPrototypeOf(model)
			.constructor as PersistentModelConstructor<T>;
		const storeName = this.getStorenameForModel(modelConstructor);
		const connectedModels = traverseModel(
			modelConstructor.name,
			model,
			this.schema.namespaces[this.namespaceResolver(modelConstructor)],
			this.modelInstanceCreator,
			this.getModelConstructorByModelName
		);
		const namespaceName = this.namespaceResolver(modelConstructor);
		const set = new Set<string>();
		const connectionStoreNames = Object.values(connectedModels).map(
			({ modelName, item, instance }) => {
				const storeName = this.getStorename(namespaceName, modelName);
				set.add(storeName);
				return { storeName, item, instance };
			}
		);
		const fromDB = await this.db.get(model.id, storeName);

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
			const { storeName, item, instance } = resItem;
			const { id } = item;

			const fromDB = <T>await this.db.get(id, storeName);
			const opType: OpType = fromDB ? OpType.UPDATE : OpType.INSERT;

			if (id === model.id || opType === OpType.INSERT) {
				await this.db.save(item, storeName);

				result.push([instance, opType]);
			}
		}

		return result;
	}

	/**
	 * Attaches related HAS_ONE and BELONGS_TO records (non-recursively / only
	 * ONE level deep) and instantiates a Model instance from the DTO.
	 *
	 * @param namespaceName The model namespace to extract schema info from.
	 * @param srcModelName The model type name to look for schema info from.
	 * @param records The instantiated Model records.
	 */
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

	/**
	 * @see Adapter
	 * @param modelConstructor The model type to fetch.
	 * @param predicate The conditions to filter by.
	 * @param pagination The page start/size.
	 * @returns Array of model instances.
	 */
	async query<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		predicate?: ModelPredicate<T>,
		pagination?: PaginationInput<T>
	): Promise<T[]> {
		const storeName = this.getStorenameForModel(modelConstructor);
		const namespaceName = this.namespaceResolver(modelConstructor);

		const predicates =
			predicate && ModelPredicateCreator.getPredicates(predicate);
		const queryById = predicates && this.idFromPredicate(predicates);
		const hasSort = pagination && pagination.sort;
		const hasPagination = pagination && pagination.limit;

		const records: T[] = await (async () => {
			if (queryById) {
				const record = await this.getById(storeName, queryById);
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

	/**
	 * Looks for a particular model instance by PK from a particular table.
	 *
	 * @see getStorename
	 *
	 * @param storeName Fully qualified name.
	 * @param id PK for the desired item.
	 * @returns A model instance.
	 */
	private async getById<T extends PersistentModel>(
		storeName: string,
		id: string
	): Promise<T> {
		const record = <T>await this.db.get(id, storeName);
		return record;
	}

	/**
	 * Gets all model instances from a table.
	 *
	 * Does not fully instantiate the records. This must still be done with
	 * `this.load()` on the objects prior to returning to the application.
	 *
	 * @param storeName Fully qualified name.
	 * @returns Array of model instances.
	 */
	private async getAll<T extends PersistentModel>(
		storeName: string
	): Promise<T[]> {
		return await this.db.getAll(storeName);
	}

	/**
	 * Extracts the ID values form a predicate if it is AND ON ONLY IS an ID
	 * equality predicate.
	 *
	 * For this:
	 *
	 * ```
	 * p => p.id('eq', 'abc')
	 * ```
	 *
	 * Returns `"abc"`.
	 *
	 * For any of these:
	 *
	 * ```
	 * p => p.id('gt', 'abc');
	 * p => p.id('eq', 'abc').otherField('eq', 'value');
	 * p => p.otherField('eq', 'value')
	 * ```
	 *
	 * Returns `false`.
	 *
	 * @param predicates The predicate to inspect.
	 * @returns The ID value or `false`
	 */
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

	/**
	 * Returns the array of model instances from a table matching predicate.
	 *
	 * This implementation currently requires a full table scan for all
	 * predicates.
	 *
	 * NOTE: Automatic index leveraging is staged in the datastore-laziness
	 * branch and will be added when laziness is merged.
	 *
	 * @param storeName Fully qualified name.
	 * @param predicates A group of predicates to filter with.
	 * @returns Array of matching model instances.
	 */
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

	/**
	 * Paginates a set of records that is already loaded fully in memory.
	 *
	 * @param records Array of records to paginate.
	 * @param pagination Description of the page to fetch. Omit to fetch all.
	 * @returns The specified subset (page) from the records.
	 */
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

	/**
	 * @see Adapter
	 * @param modelConstructor The model type to look for.
	 * @param firstOrLast Whether to grab the first or last item in PK order.
	 * @returns A single model instance or `undefined`
	 */
	async queryOne<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		firstOrLast: QueryOne = QueryOne.FIRST
	): Promise<T | undefined> {
		const storeName = this.getStorenameForModel(modelConstructor);
		const result = <T>await this.db.getOne(firstOrLast, storeName);
		return result && this.modelInstanceCreator(modelConstructor, result);
	}

	/**
	 * @see Adapter
	 *
	 * @param modelOrConstructor The model or model instance to delete.
	 * @param condition The conditions under which the delete should succeed.
	 * Omit to attempt to delete unconditionally. An unconditional delete
	 * @returns A tuple of the model(s) attempted for deletion and the model(s)
	 * actually deleted.
	 */
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
					logger.error(msg, { model: fromDB, condition: predicateObjs });

					throw new Error(msg);
				}

				const relations =
					this.schema.namespaces[nameSpace].relationships[modelConstructor.name]
						.relationTypes;
				await this.deleteTraverse(
					relations,
					[model],
					modelConstructor.name,
					nameSpace,
					deleteQueue
				);
			} else {
				const relations =
					this.schema.namespaces[nameSpace].relationships[modelConstructor.name]
						.relationTypes;

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

	/**
	 * Deletes all items in the given queue **in-order**.
	 *
	 * It is expected that the given queue be given in toplogical order.
	 *
	 * SIDE EFFECT:
	 * 1. Creates a transaction against the database.
	 * 1. Changes database state/data.
	 *
	 * @param deleteQueue
	 */
	private async deleteItem<T extends PersistentModel>(
		deleteQueue?: { storeName: string; items: T[] | IDBValidKey[] }[]
	) {
		for await (const deleteItem of deleteQueue) {
			const { storeName, items } = deleteItem;

			for await (const item of items) {
				if (item) {
					if (typeof item === 'object') {
						const id = item['id'];
						await this.db.delete(id, storeName);
					}
				}
			}
		}
	}

	/**
	 * Recursively collects a list of model instances that would need to be
	 * deleted in addition to the *given* model records in order to maintain
	 * referential integrity. Traversal is performed in a depth-first manner to
	 * ensure items the `deleteQueue` is left in topological sort order.
	 *
	 * @todo Factor `relations` out of the signature *or* remove redundant
	 * "relations" discovery internally.
	 *
	 * `relations` is passed in from a line that *consistently* looks like
	 * this:
	 *
	 * ```
	 * const relations =
	 * 	this.schema.namespaces[nameSpace].relationships[modelConstructor.name]
	 * 		.relationTypes;
	 * ```
	 *
	 * This *appears* redundant, as this lookup is repeated internally for each
	 * given relationship. If this is not actually redundant, replace this TODO
	 * with an explanation as to why this is not actually redudant.
	 *
	 * @param relations The list of relations to treverse when looking for
	 * models that would break referential integrity.
	 * @param models The model instances in queue to be deleted.
	 * @param srcModel The name of the source model.
	 * @param nameSpace The namespace of the source model.
	 * @param deleteQueue A queue to accumulate items that will need to be
	 * deleted in order to perform a full, referentially consistent delete.
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

						const hasOneCustomField = targetName in model;
						const value = hasOneCustomField ? model[targetName] : model.id;
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
						const allRecords = await this.db.getAll(storeName);
						const childrenArray = allRecords.filter(
							childItem => childItem[index] === model.id
						);

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

	/**
	 * @see Adapter
	 */
	async clear(): Promise<void> {
		await this.db.clear();

		this.db = undefined;
		this.initPromise = undefined;
	}

	/**
	 * @see Adapter
	 *
	 * @param modelConstructor Model type to save.
	 * @param items Array of items to save.
	 * @returns Array of tuples like [SavedItem, SaveOperation][]
	 */
	async batchSave<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<any>,
		items: ModelInstanceMetadata[]
	): Promise<[T, OpType][]> {
		const { name: modelName } = modelConstructor;
		const namespaceName = this.namespaceResolver(modelConstructor);
		const storeName = this.getStorename(namespaceName, modelName);

		const batch: ModelInstanceMetadata[] = [];

		for (const item of items) {
			const { id } = item;

			const connectedModels = traverseModel(
				modelConstructor.name,
				this.modelInstanceCreator(modelConstructor, item),
				this.schema.namespaces[this.namespaceResolver(modelConstructor)],
				this.modelInstanceCreator,
				this.getModelConstructorByModelName
			);

			const { instance } = connectedModels.find(
				({ instance }) => instance.id === id
			);

			batch.push(instance);
		}

		return await this.db.batchSave(storeName, batch);
	}
}

export default new AsyncStorageAdapter();
