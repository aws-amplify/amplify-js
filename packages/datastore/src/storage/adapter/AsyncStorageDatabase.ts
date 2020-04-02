import { AsyncStorage } from 'react-native';
import { PersistentModel, QueryOne } from '../../types';

const DB_NAME = '@AmplifyDatastore';
const COLLECTION = 'Collection';
const DATA = 'Data';

// TODO: Consider refactoring to a batch save operation.
class AsyncStorageDatabase {
	async save<T extends PersistentModel>(item: T, storeName: string) {
		const itemKey = this.getKeyForItem(storeName, item.id);
		await AsyncStorage.setItem(itemKey, JSON.stringify(item));
		const storeKey = this.getKeyForStore(storeName);
		const collectionForStoreAsString = await AsyncStorage.getItem(storeKey);
		const collectionForStore = JSON.parse(collectionForStoreAsString);
		const collection = collectionForStore || [];
		collection.push(itemKey);
		await AsyncStorage.setItem(storeKey, JSON.stringify(collection));
	}

	async get<T extends PersistentModel>(
		id: string,
		storeName: string
	): Promise<T> {
		const itemKey = this.getKeyForItem(storeName, id);
		const recordAsString = await AsyncStorage.getItem(itemKey);
		const record = JSON.parse(recordAsString);
		return record;
	}

	async getOne(firstOrLast: QueryOne, storeName: string) {
		const storeKey = this.getKeyForStore(storeName);
		const collectionForStoreAsString = await AsyncStorage.getItem(storeKey);
		const collectionForStore = JSON.parse(collectionForStoreAsString);
		const collection = collectionForStore || [];
		const itemKey =
			firstOrLast === QueryOne.FIRST
				? collection[0]
				: collection[collection.length - 1];
		const result = itemKey
			? JSON.parse(await AsyncStorage.getItem(itemKey))
			: undefined;
		return result;
	}

	/**
	 * This function gets all the records stored in async storage for a particular storeName
	 * It uses getAllKeys to first retrieve the keys and then filters based on the prefix
	 * It then loads all the records for that filtered set of keys using multiGet()
	 */
	async getAll<T extends PersistentModel>(storeName: string): Promise<T[]> {
		const allKeys = await AsyncStorage.getAllKeys();
		const prefixForStoreItems = this.getKeyPrefixForStoreItems(storeName);
		const keysForStore = allKeys.filter(key =>
			key.startsWith(prefixForStoreItems)
		);
		const storeRecordStrings = await AsyncStorage.multiGet(keysForStore);
		const records = storeRecordStrings.map(([key, value]) => JSON.parse(value));
		return records;
	}

	async delete(id: string, storeName: string) {
		const itemKey = this.getKeyForItem(storeName, id);
		const storeKey = this.getKeyForStore(storeName);
		const collectionForStoreAsString = await AsyncStorage.getItem(storeKey);
		const collectionForStore = JSON.parse(collectionForStoreAsString);
		const collection = collectionForStore || [];
		collection.splice(collection.indexOf(itemKey), 1);
		await AsyncStorage.setItem(storeKey, JSON.stringify(collection));
		await AsyncStorage.removeItem(itemKey);
	}
	/**
	 * Clear the AsyncStorage of all DataStore entries
	 */
	async clear() {
		const allKeys = await AsyncStorage.getAllKeys();
		const allDataStoreKeys = allKeys.filter(key => key.startsWith(DB_NAME));
		await AsyncStorage.multiRemove(allDataStoreKeys);
	}

	private getKeyForItem(storeName: string, id: string): string {
		return `${DB_NAME}::${storeName}::${DATA}::${id}`;
	}

	private getKeyForStore(storeName: string): string {
		return `${DB_NAME}::${storeName}::${COLLECTION}`;
	}

	private getKeyPrefixForStoreItems(storeName: string): string {
		return `${DB_NAME}::${storeName}::${DATA}`;
	}
}

export default AsyncStorageDatabase;
