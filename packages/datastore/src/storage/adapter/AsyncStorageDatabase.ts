import { ULID } from 'ulid';
import {
	ModelInstanceMetadata,
	OpType,
	PaginationInput,
	PersistentModel,
	QueryOne,
} from '../../types';
import { monotonicUlidFactory } from '../../util';
import { createInMemoryStore } from './InMemoryStore';

const DB_NAME = '@AmplifyDatastore';
const COLLECTION = 'Collection';
const DATA = 'Data';

const monotonicFactoriesMap = new Map<string, ULID>();

class AsyncStorageDatabase {
	/**
	 * Maps storeNames to a map of ulid->id
	 */
	private _collectionInMemoryIndex = new Map<string, Map<string, string>>();

	private storage = createInMemoryStore();

	private getCollectionIndex(storeName: string) {
		if (!this._collectionInMemoryIndex.has(storeName)) {
			this._collectionInMemoryIndex.set(storeName, new Map());
		}

		return this._collectionInMemoryIndex.get(storeName);
	}

	private getMonotonicFactory(storeName: string): ULID {
		if (!monotonicFactoriesMap.has(storeName)) {
			monotonicFactoriesMap.set(storeName, monotonicUlidFactory());
		}

		return monotonicFactoriesMap.get(storeName);
	}

	// private getNamespaceAndModelFromStorename(storeName: string) {
	// 	const [namespaceName, ...modelNameArr] = storeName.split('_');
	// 	return {
	// 		namespaceName,
	// 		modelName: modelNameArr.join('_'),
	// 	};
	// }

	// private getIndexKeyPath(namespaceName: string, modelName: string): string[] {
	// 	const keyPath =
	// 		this.schema.namespaces[namespaceName].keys[modelName].primaryKey;

	// 	if (keyPath) {
	// 		return keyPath;
	// 	}

	// 	return ['id'];
	// }

	// private getIndexKeyValues<T extends PersistentModel>(model: T): string[] {
	// 	const modelConstructor = Object.getPrototypeOf(model)
	// 		.constructor as PersistentModelConstructor<T>;
	// 	const namespaceName = this.namespaceResolver(modelConstructor);
	// 	const keys = this.getIndexKeyPath(namespaceName, modelConstructor.name);

	// 	const keyValues = keys.map(field => model[field]);
	// 	return keyValues;
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

	async init(): Promise<void> {
		this._collectionInMemoryIndex.clear();

		// TODO: https://github.com/aws-amplify/amplify-js/pull/9379/files#diff-75c76069840355a3f346f2f35c443018e4a5716ed128191602499c3b39935cfcL82

		const allKeys: string[] = await this.storage.getAllKeys();
		debugger;

		const keysForCollectionEntries = [];

		for (const key of allKeys) {
			const [dbName, storeName, recordType, ulidOrId, id] = key.split('::');
			// TODO: Retrieve by PK instead of ID, push to collection?

			if (dbName === DB_NAME) {
				if (recordType === DATA) {
					let ulid: string;

					if (id === undefined) {
						// It is an old entry (without ulid). Need to migrate to new key format

						const id = ulidOrId;

						const newUlid = this.getMonotonicFactory(storeName)();

						const oldKey = this.getLegacyKeyForItem(storeName, id);
						const newKey = this.getKeyForItem(storeName, id, newUlid);

						const item = await this.storage.getItem(oldKey);

						await this.storage.setItem(newKey, item);
						await this.storage.removeItem(oldKey);

						ulid = newUlid;
					} else {
						ulid = ulidOrId;
					}

					this.getCollectionIndex(storeName).set(id, ulid);
				} else if (recordType === COLLECTION) {
					keysForCollectionEntries.push(key);
				}
			}
		}

		if (keysForCollectionEntries.length > 0) {
			await this.storage.multiRemove(keysForCollectionEntries);
		}
	}

	async save<T extends PersistentModel>(item: T, storeName: string) {
		// What needs to be done here?
		const ulid =
			this.getCollectionIndex(storeName).get(item.id) ||
			this.getMonotonicFactory(storeName)();

		const itemKey = this.getKeyForItem(storeName, item.id, ulid);

		this.getCollectionIndex(storeName).set(item.id, ulid);

		await this.storage.setItem(itemKey, JSON.stringify(item));
	}

	async batchSave<T extends PersistentModel>(
		storeName: string,
		items: ModelInstanceMetadata[]
	): Promise<[T, OpType][]> {
		// What needs to be done here?
		if (items.length === 0) {
			return [];
		}

		const result: [T, OpType][] = [];

		const collection = this.getCollectionIndex(storeName);

		const keysToDelete = new Set<string>();
		const keysToSave = new Set<string>();
		const allItemsKeys = [];
		const itemsMap: Record<string, { ulid: string; model: T }> = {};
		for (const item of items) {
			const { id, _deleted } = item;
			const ulid = collection.get(id) || this.getMonotonicFactory(storeName)();

			const key = this.getKeyForItem(storeName, id, ulid);

			allItemsKeys.push(key);
			itemsMap[key] = { ulid, model: <T>(<unknown>item) };

			if (_deleted) {
				keysToDelete.add(key);
			} else {
				keysToSave.add(key);
			}
		}

		const existingRecordsMap: [string, string][] = await this.storage.multiGet(
			allItemsKeys
		);
		const existingRecordsKeys = existingRecordsMap
			.filter(([, v]) => !!v)
			.reduce((set, [k]) => set.add(k), new Set<string>());

		await new Promise((resolve, reject) => {
			if (keysToDelete.size === 0) {
				resolve();
				return;
			}

			const keysToDeleteArray = Array.from(keysToDelete);

			keysToDeleteArray.forEach(key =>
				collection.delete(itemsMap[key].model.id)
			);

			this.storage.multiRemove(keysToDeleteArray, (errors?: Error[]) => {
				if (errors && errors.length > 0) {
					reject(errors);
				} else {
					resolve();
				}
			});
		});

		await new Promise((resolve, reject) => {
			if (keysToSave.size === 0) {
				resolve();
				return;
			}

			const entriesToSet = Array.from(keysToSave).map(key => [
				key,
				JSON.stringify(itemsMap[key].model),
			]);

			keysToSave.forEach(key => {
				const {
					model: { id },
					ulid,
				} = itemsMap[key];

				collection.set(id, ulid);
			});

			this.storage.multiSet(entriesToSet, (errors?: Error[]) => {
				if (errors && errors.length > 0) {
					reject(errors);
				} else {
					resolve();
				}
			});
		});

		for (const key of allItemsKeys) {
			if (keysToDelete.has(key) && existingRecordsKeys.has(key)) {
				result.push([itemsMap[key].model, OpType.DELETE]);
			} else if (keysToSave.has(key)) {
				result.push([
					itemsMap[key].model,
					existingRecordsKeys.has(key) ? OpType.UPDATE : OpType.INSERT,
				]);
			}
		}

		return result;
	}

	async get<T extends PersistentModel>(
		id: string,
		// keyArr: string[]
		storeName: string
	): Promise<T> {
		// https://github.com/aws-amplify/amplify-js/pull/9379/files#diff-75c76069840355a3f346f2f35c443018e4a5716ed128191602499c3b39935cfcR253
		// Retrieve by PK instead of ID
		const ulid = this.getCollectionIndex(storeName).get(id);
		const itemKey = this.getKeyForItem(storeName, id, ulid);
		const recordAsString = await this.storage.getItem(itemKey);
		const record = recordAsString && JSON.parse(recordAsString);
		// What needs to be done here?
		return record;
	}

	async getOne(firstOrLast: QueryOne, storeName: string) {
		// What needs to be done here?
		const collection = this.getCollectionIndex(storeName);

		const [itemId, ulid] =
			firstOrLast === QueryOne.FIRST
				? (() => {
						let id: string, ulid: string;
						for ([id, ulid] of collection) break; // Get first element of the set
						return [id, ulid];
				  })()
				: (() => {
						let id: string, ulid: string;
						for ([id, ulid] of collection); // Get last element of the set
						return [id, ulid];
				  })();
		const itemKey = this.getKeyForItem(storeName, itemId, ulid);
		const itemString = itemKey && (await this.storage.getItem(itemKey));

		const result = itemString ? JSON.parse(itemString) || undefined : undefined;

		return result;
	}

	/**
	 * This function gets all the records stored in async storage for a particular storeName
	 * It then loads all the records for that filtered set of keys using multiGet()
	 */
	async getAll<T extends PersistentModel>(
		storeName: string,
		pagination?: PaginationInput<T>
	): Promise<T[]> {
		const collection = this.getCollectionIndex(storeName);
		// What is in collection? ids are used below

		const { page = 0, limit = 0 } = pagination || {};
		const start = Math.max(0, page * limit) || 0;
		const end = limit > 0 ? start + limit : undefined;

		const keysForStore: string[] = [];
		let count = 0;
		for (const [id, ulid] of collection) {
			count++;

			if (count <= start) {
				continue;
			}

			keysForStore.push(this.getKeyForItem(storeName, id, ulid));

			if (count === end) {
				break;
			}
		}

		const storeRecordStrings = await this.storage.multiGet(keysForStore);
		const records = storeRecordStrings
			.filter(([, value]) => value)
			.map(([, value]) => JSON.parse(value));

		return records;
	}

	async delete(id: string, storeName: string) {
		// What needs to be done here?
		const ulid = this.getCollectionIndex(storeName).get(id);
		const itemKey = this.getKeyForItem(storeName, id, ulid);

		this.getCollectionIndex(storeName).delete(id);
		await this.storage.removeItem(itemKey);
	}

	/**
	 * Clear the AsyncStorage of all DataStore entries
	 */
	async clear() {
		// What needs to be done here?
		const allKeys = await this.storage.getAllKeys();
		const allDataStoreKeys = allKeys.filter(key => key.startsWith(DB_NAME));
		await this.storage.multiRemove(allDataStoreKeys);
		this._collectionInMemoryIndex.clear();
	}

	private getKeyForItem(storeName: string, id: string, ulid: string): string {
		// What needs to be done here?
		return `${this.getKeyPrefixForStoreItems(storeName)}::${ulid}::${id}`;
	}

	private getLegacyKeyForItem(storeName: string, id: string): string {
		// What needs to be done here?
		return `${this.getKeyPrefixForStoreItems(storeName)}::${id}`;
	}

	private getKeyPrefixForStoreItems(storeName: string): string {
		// What needs to be done here?
		return `${DB_NAME}::${storeName}::${DATA}`;
	}
}

export default AsyncStorageDatabase;
