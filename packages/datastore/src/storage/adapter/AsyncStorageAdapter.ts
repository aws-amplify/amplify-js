import AsyncStorageDatabase from './AsyncStorageDatabase';
import {
	ModelInstanceMetadata,
	ModelPredicate,
	OpType,
	PaginationInput,
	PersistentModel,
	PersistentModelConstructor,
	PredicatesGroup,
	QueryOne,
	RelationType,
} from '../../types';
import {
	DEFAULT_PRIMARY_KEY_VALUE_SEPARATOR,
	getIndex,
	getIndexFromAssociation,
	traverseModel,
	validatePredicate,
	inMemoryPagination,
	NAMESPACES,
	keysEqual,
	getStorename,
	getIndexKeys,
	IDENTIFIER_KEY_SEPARATOR,
} from '../../util';
import { StorageAdapterBase } from './StorageAdapterBase';

export class AsyncStorageAdapter extends StorageAdapterBase {
	protected db!: AsyncStorageDatabase;

	// no-ops for this adapter
	protected async preSetUpChecks() {}
	protected async preOpCheck() {}

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
		items: ModelInstanceMetadata[]
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

	protected async _get<T>(storeName: string, keyArr: string[]): Promise<T> {
		const itemKeyValuesPath: string = keyArr.join(
			DEFAULT_PRIMARY_KEY_VALUE_SEPARATOR
		);

		return <T>await this.db.get(itemKeyValuesPath, storeName);
	}

	async save<T extends PersistentModel>(
		model: T,
		condition?: ModelPredicate<T>
	): Promise<[T, OpType.INSERT | OpType.UPDATE][]> {
		const { storeName, connectionStoreNames, modelKeyValues } =
			this.saveMetadata(model);

		const fromDB = await this._get(storeName, modelKeyValues);

		this.validateSaveCondition(condition, fromDB);

		const result: [T, OpType.INSERT | OpType.UPDATE][] = [];
		for await (const resItem of connectionStoreNames) {
			const { storeName, item, instance, keys } = resItem;

			const itemKeyValues: string[] = keys.map(key => item[key]);

			const fromDB = <T>await this._get(storeName, itemKeyValues);
			const opType: OpType = fromDB ? OpType.UPDATE : OpType.INSERT;

			if (
				keysEqual(itemKeyValues, modelKeyValues) ||
				opType === OpType.INSERT
			) {
				await this.db.save(
					item,
					storeName,
					keys,
					itemKeyValues.join(DEFAULT_PRIMARY_KEY_VALUE_SEPARATOR)
				);

				result.push([instance, opType]);
			}
		}
		return result;
	}

	async query<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		predicate?: ModelPredicate<T>,
		pagination?: PaginationInput<T>
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

		return await this.load(namespaceName, modelConstructor.name, records);
	}

	private async getByKey<T extends PersistentModel>(
		storeName: string,
		keyValuePath: string
	): Promise<T> {
		return <T>await this.db.get(keyValuePath, storeName);
	}

	private async getAll<T extends PersistentModel>(
		storeName: string
	): Promise<T[]> {
		return await this.db.getAll(storeName);
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

	protected async deleteItem<T extends PersistentModel>(
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
	 * Gets related Has One record for `model`
	 *
	 * @param model
	 * @param srcModel
	 * @param namespace
	 * @param rel
	 * @returns
	 */
	protected async getHasOneChild<T extends PersistentModel>(
		model: T,
		srcModel: string,
		namespace: NAMESPACES,
		rel: RelationType
	) {
		let hasOneIndex;
		const { modelName, targetNames, associatedWith } = rel;
		const storeName = getStorename(namespace, modelName);
		const index: string | undefined =
			getIndex(
				this.schema.namespaces[namespace].relationships![modelName]
					.relationTypes,
				srcModel
			) ||
			// if we were unable to find an index via relationTypes
			// i.e. for keyName connections, attempt to find one by the
			// associatedWith property
			getIndexFromAssociation(
				this.schema.namespaces[namespace].relationships![modelName].indexes,
				rel.associatedWith!
			);

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
		const hasConnectedModelFields = targetNames!.every(targetName =>
			model.hasOwnProperty(targetName)
		);

		// PK / Composite key for the parent model
		const keyValuesPath: string = this.getIndexKeyValuesPath(model);

		let values;

		const isUnidirectionalConnection = hasOneIndex === associatedWith;

		if (hasConnectedModelFields && isUnidirectionalConnection) {
			// Values will be that of the child model
			values = targetNames!
				.filter(targetName => model[targetName] ?? false)
				.map(targetName => model[targetName]);
		} else {
			// values will be that of the parent model
			values = keyValuesPath.split(DEFAULT_PRIMARY_KEY_VALUE_SEPARATOR);
		}

		if (values.length === 0) return;

		const allRecords = await this.db.getAll(storeName);

		let recordToDelete;

		// values === targetNames
		if (hasConnectedModelFields) {
			/**
			 * Retrieve record by finding the record where all
			 * targetNames are present on the connected model.
			 *
			 */

			recordToDelete = allRecords.find(childItem =>
				hasOneIndex.every(index => values.includes(childItem[index]))
			);
		} else {
			// values === keyValuePath
			recordToDelete = allRecords.find(
				childItem => childItem[hasOneIndex] === values
			) as T[];
		}

		return recordToDelete;
	}

	/**
	 * Backwards compatability for pre-CPK codegen
	 * TODO - deprecate this in v6; will need to re-gen MIPR for older unit
	 * tests that hit this path
	 */
	protected async getHasOneChildLegacy<T extends PersistentModel>(
		model: T,
		srcModel: string,
		namespace: NAMESPACES,
		rel: RelationType
	) {
		const { modelName, targetName, associatedWith } = rel;
		const storeName = getStorename(namespace, modelName);
		const index: string | undefined =
			getIndex(
				this.schema.namespaces[namespace].relationships![modelName]
					.relationTypes,
				srcModel
			) ||
			// if we were unable to find an index via relationTypes
			// i.e. for keyName connections, attempt to find one by the
			// associatedWith property
			getIndexFromAssociation(
				this.schema.namespaces[namespace].relationships![modelName].indexes,
				rel.associatedWith!
			);
		const hasOneIndex = index || associatedWith;
		const hasOneCustomField = targetName! in model;
		const keyValuesPath: string = this.getIndexKeyValuesPath(model);
		const value = hasOneCustomField ? model[targetName!] : keyValuesPath;

		if (!value) return;

		const allRecords = await this.db.getAll(storeName);

		const recordToDelete = allRecords.find(
			childItem => childItem[hasOneIndex as string] === value
		) as T;

		return recordToDelete;
	}

	/**
	 *  Gets related Has Many records by given `storeName`, `index`, and `keyValues`
	 *
	 * @param storeName
	 * @param index
	 * @param keyValues
	 * @returns
	 */
	protected async getHasManyChildren<T extends PersistentModel>(
		storeName: string,
		index: string,
		keyValues: string[]
	): Promise<T[]> {
		const allRecords = await this.db.getAll(storeName);
		const indices = index!.split(IDENTIFIER_KEY_SEPARATOR);

		const childRecords = allRecords.filter(childItem =>
			indices.every(index => keyValues.includes(childItem[index]))
		) as T[];

		return childRecords;
	}

	//#region platform-specific helper methods

	/**
	 * Retrieves concatenated primary key values from a model
	 *
	 * @param model
	 * @returns
	 */
	private getIndexKeyValuesPath<T extends PersistentModel>(model: T): string {
		return this.getIndexKeyValuesFromModel(model).join(
			DEFAULT_PRIMARY_KEY_VALUE_SEPARATOR
		);
	}

	//#endregion
}

export default new AsyncStorageAdapter();
