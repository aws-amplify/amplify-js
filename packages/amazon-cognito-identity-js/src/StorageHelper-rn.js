/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const MEMORY_KEY_PREFIX = '@MemoryStorage:';
let dataMemory = {};

/** @class */
class MemoryStorage {
	/**
	 * This is used to set a specific item in storage
	 * @param {string} key - the key for the item
	 * @param {object} value - the value
	 * @returns {string} value that was set
	 */
	static setItem(key, value) {
		AsyncStorage.setItem(MEMORY_KEY_PREFIX + key, value);
		dataMemory[key] = value;
		return dataMemory[key];
	}

	/**
	 * This is used to get a specific key from storage
	 * @param {string} key - the key for the item
	 * This is used to clear the storage
	 * @returns {string} the data item
	 */
	static getItem(key) {
		return Object.prototype.hasOwnProperty.call(dataMemory, key)
			? dataMemory[key]
			: undefined;
	}

	/**
	 * This is used to remove an item from storage
	 * @param {string} key - the key being set
	 * @returns {string} value - value that was deleted
	 */
	static removeItem(key) {
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
	 * @param {nodeCallback<string>} callback callback with (err, 'SUCCESS')
	 * @returns {void}
	 */
	static sync(callback) {
		AsyncStorage.getAllKeys((errKeys, keys) => {
			if (errKeys) return callback(errKeys, null);
			const memoryKeys = keys.filter(key => key.startsWith(MEMORY_KEY_PREFIX));
			AsyncStorage.multiGet(memoryKeys, (err, stores) => {
				if (err) return callback(err, null);
				stores.map((result, index, store) => {
					const key = store[index][0];
					const value = store[index][1];
					const memoryKey = key.replace(MEMORY_KEY_PREFIX, '');
					dataMemory[memoryKey] = value;
					return undefined;
				});
				callback(null, 'SUCCESS');
				return undefined;
			});
			return undefined;
		});
	}
}

/** @class */
export default class StorageHelper {
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
