// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	ModelInstanceMetadata,
	ModelPredicate,
	OpType,
	PaginationInput,
	PersistentModel,
	PersistentModelConstructor,
	PredicatesGroup,
	QueryOne,
} from '../../types';
import {
	DEFAULT_PRIMARY_KEY_VALUE_SEPARATOR,
	getIndexKeys,
	getStorename,
	inMemoryPagination,
	keysEqual,
	traverseModel,
	validatePredicate,
} from '../../util';

import AsyncStorageDatabase from './AsyncStorageDatabase';
import { StorageAdapterBase } from './StorageAdapterBase';

export class AsyncStorageAdapter extends StorageAdapterBase {
	protected db!: AsyncStorageDatabase;

	protected async preSetUpChecks() {
		// no-ops for AsyncStorageAdapter
	}

	protected async preOpCheck() {
		// no-ops for AsyncStorageAdapter
	}

	/**
	 * Open AsyncStorage database
	 * Create new DB if one doesn't exist
	 *
	 * Called by `StorageAdapterBase.setUp()`
	 *
	 * @returns AsyncStorageDatabase instance
	 */
	protected async initDb(): Promise<AsyncStorageDatabase> {
		const db = new AsyncStorageDatabase();
		await db.init();

		return db;
	}

	async clear(): Promise<void> {
		await this.db.clear();

		this.db = undefined!;
		this.initPromise = undefined!;
	}

	async batchSave<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<any>,
		items: ModelInstanceMetadata[],
	): Promise<[T, OpType][]> {
		if (items.length === 0) {
			return [];
		}

		const modelName = modelConstructor.name;
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
				this.getModelConstructorByModelName,
			);

			const keyValuesPath = this.getIndexKeyValuesPath(model);

			const { instance } = connectedModels.find(
				({ instance: connectedModelInstance }) => {
					const instanceKeyValuesPath = this.getIndexKeyValuesPath(
						connectedModelInstance,
					);

					return keysEqual([instanceKeyValuesPath], [keyValuesPath]);
				},
			)!;

			batch.push(instance);
		}

		return this.db.batchSave(storeName, batch, keys);
	}

	protected async _get<T>(storeName: string, keyArr: string[]): Promise<T> {
		const itemKeyValuesPath: string = keyArr.join(
			DEFAULT_PRIMARY_KEY_VALUE_SEPARATOR,
		);

		return (await this.db.get(itemKeyValuesPath, storeName)) as T;
	}

	async save<T extends PersistentModel>(
		model: T,
		condition?: ModelPredicate<T>,
	): Promise<[T, OpType.INSERT | OpType.UPDATE][]> {
		const { storeName, connectionStoreNames, modelKeyValues } =
			this.saveMetadata(model);

		const fromDB = await this._get(storeName, modelKeyValues);

		this.validateSaveCondition(condition, fromDB);

		const result: [T, OpType.INSERT | OpType.UPDATE][] = [];
		for await (const resItem of connectionStoreNames) {
			const { storeName: storeNameForRestItem, item, instance, keys } = resItem;

			const itemKeyValues: string[] = keys.map(key => item[key]);

			const fromDBForRestItem = (await this._get(
				storeNameForRestItem,
				itemKeyValues,
			)) as T;
			const opType: OpType = fromDBForRestItem ? OpType.UPDATE : OpType.INSERT;

			if (
				keysEqual(itemKeyValues, modelKeyValues) ||
				opType === OpType.INSERT
			) {
				await this.db.save(
					item,
					storeNameForRestItem,
					keys,
					itemKeyValues.join(DEFAULT_PRIMARY_KEY_VALUE_SEPARATOR),
				);

				result.push([instance, opType]);
			}
		}

		return result;
	}

	async query<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		predicate?: ModelPredicate<T>,
		pagination?: PaginationInput<T>,
	): Promise<T[]> {
		const {
			storeName,
			namespaceName,
			queryByKey,
			predicates,
			hasSort,
			hasPagination,
		} = this.queryMetadata(modelConstructor, predicate, pagination);

		const records: T[] = (await (async () => {
			if (queryByKey) {
				const keyValues = queryByKey.join(DEFAULT_PRIMARY_KEY_VALUE_SEPARATOR);
				const record = await this.getByKey(storeName, keyValues);

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

		return this.load(namespaceName, modelConstructor.name, records);
	}

	private async getByKey<T extends PersistentModel>(
		storeName: string,
		keyValuePath: string,
	): Promise<T> {
		return (await this.db.get(keyValuePath, storeName)) as T;
	}

	private async getAll<T extends PersistentModel>(
		storeName: string,
	): Promise<T[]> {
		return this.db.getAll(storeName);
	}

	private async filterOnPredicate<T extends PersistentModel>(
		storeName: string,
		predicates: PredicatesGroup<T>,
	) {
		const { predicates: predicateObjs, type } = predicates;

		const all = (await this.getAll(storeName)) as T[];

		const filtered = predicateObjs
			? all.filter(m => validatePredicate(m, type, predicateObjs))
			: all;

		return filtered;
	}

	private inMemoryPagination<T extends PersistentModel>(
		records: T[],
		pagination?: PaginationInput<T>,
	): T[] {
		return inMemoryPagination(records, pagination);
	}

	async queryOne<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		firstOrLast: QueryOne = QueryOne.FIRST,
	): Promise<T | undefined> {
		const storeName = this.getStorenameForModel(modelConstructor);
		const result = (await this.db.getOne(firstOrLast, storeName)) as T;

		return result && this.modelInstanceCreator(modelConstructor, result);
	}

	protected async deleteItem<T extends PersistentModel>(
		deleteQueue?: { storeName: string; items: T[] | IDBValidKey[] }[],
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

	// #region platform-specific helper methods

	/**
	 * Retrieves concatenated primary key values from a model
	 *
	 * @param model
	 * @returns
	 */
	private getIndexKeyValuesPath<T extends PersistentModel>(model: T): string {
		return this.getIndexKeyValuesFromModel(model).join(
			DEFAULT_PRIMARY_KEY_VALUE_SEPARATOR,
		);
	}

	// #endregion
}

export default new AsyncStorageAdapter();
