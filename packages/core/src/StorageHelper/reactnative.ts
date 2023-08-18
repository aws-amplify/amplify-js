// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyValueStorageInterface } from '../types';

const MEMORY_KEY_PREFIX = '@MemoryStorage:';
let dataMemory: Record<string, string | null> = {};

/** @class */
class MemoryStorage {
	static syncPromise: Promise<void> | null = null;
	/**
	 * This is used to set a specific item in storage
	 * @param {string} key - the key for the item
	 * @param {object} value - the value
	 * @returns {string} value that was set
	 */
	static setItem(key: string, value: string) {
		if (value) {
			AsyncStorage.setItem(MEMORY_KEY_PREFIX + key, value);
			dataMemory[key] = value;
			return dataMemory[key];
		}
	}

	/**
	 * This is used to get a specific key from storage
	 * @param {string} key - the key for the item
	 * This is used to clear the storage
	 * @returns {string} the data item
	 */
	static getItem(key: string) {
		return Object.prototype.hasOwnProperty.call(dataMemory, key)
			? dataMemory[key]
			: undefined;
	}

	/**
	 * This is used to remove an item from storage
	 * @param {string} key - the key being set
	 * @returns {string} value - value that was deleted
	 */
	static removeItem(key: string) {
		AsyncStorage.removeItem(MEMORY_KEY_PREFIX + key);
		return delete dataMemory[key];
	}

	/**
	 * This is used to clear the storage
	 * @returns {string} nothing
	 */
	static clear() {
		dataMemory = {};
		return dataMemory;
	}

	/**
	 * Will sync the MemoryStorage data from AsyncStorage to storageWindow MemoryStorage
	 * @returns {void}
	 */
	static sync() {
		if (!MemoryStorage.syncPromise) {
			MemoryStorage.syncPromise = new Promise<void>((res, rej) => {
				AsyncStorage.getAllKeys((errKeys, keys) => {
					if (errKeys) rej(errKeys);

					const memoryKeys =
						keys?.filter(key => key.startsWith(MEMORY_KEY_PREFIX)) ?? [];

					AsyncStorage.multiGet(memoryKeys, (err, stores) => {
						if (err) rej(err);
						stores &&
							stores.map((result, index, store) => {
								const key = store[index][0];
								const value = store[index][1];
								const memoryKey = key.replace(MEMORY_KEY_PREFIX, '');
								dataMemory[memoryKey] = value;
							});
						res();
					});
				});
			});
		}
		return MemoryStorage.syncPromise;
	}
}

export class StorageHelper {
	private storageWindow;
	/**
	 * This is used to get a storage object
	 * @returns {object} the storage
	 */
	constructor() {
		this.storageWindow = MemoryStorage;
	}

	/**
	 * This is used to return the storage
	 * @returns {object} the storage
	 */
	getStorage() {
		return this.storageWindow;
	}
}

class AsyncStorageClass implements KeyValueStorageInterface {
	syncPromise: Promise<void> | null = null;
	/**
	 * This is used to set a specific item in storage
	 * @param {string} key - the key for the item
	 * @param {object} value - the value
	 * @returns {string} value that was set
	 */
	async setItem(key: string, value: string): Promise<void> {
		if (value) {
			await AsyncStorage.setItem(MEMORY_KEY_PREFIX + key, value);
			dataMemory[key] = value;
		}
	}

	/**
	 * This is used to get a specific key from storage
	 * @param {string} key - the key for the item
	 * This is used to clear the storage
	 * @returns {string} the data item
	 */
	async getItem(key: string): Promise<string | null> {
		return Object.prototype.hasOwnProperty.call(dataMemory, key)
			? dataMemory[key]
			: null;
	}

	/**
	 * This is used to remove an item from storage
	 * @param {string} key - the key being set
	 * @returns {string} value - value that was deleted
	 */
	async removeItem(key: string): Promise<void> {
		await AsyncStorage.removeItem(MEMORY_KEY_PREFIX + key);
		delete dataMemory[key];
	}

	/**
	 * This is used to clear the storage
	 * @returns {string} nothing
	 */
	async clear(): Promise<void> {
		dataMemory = {};
	}

	/**
	 * Will sync the MemoryStorage data from AsyncStorage to storageWindow MemoryStorage
	 * @returns {void}
	 */
	async sync() {
		if (!this.syncPromise) {
			this.syncPromise = new Promise<void>((res, rej) => {
				AsyncStorage.getAllKeys((errKeys, keys) => {
					if (errKeys) rej(errKeys);
					const memoryKeys =
						keys?.filter(key => key.startsWith(MEMORY_KEY_PREFIX)) ?? [];

					AsyncStorage.multiGet(memoryKeys, (err, stores) => {
						if (err) rej(err);
						stores &&
							stores.map((result, index, store) => {
								const key = store[index][0];
								const value = store[index][1];
								const memoryKey = key.replace(MEMORY_KEY_PREFIX, '');
								dataMemory[memoryKey] = value;
							});
						res();
					});
				});
			});
		}
	}
}

// TODO: Add this to the react-native Amplify package.
export const AsyncStorageKeyValue = new AsyncStorageClass();
