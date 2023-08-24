// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyValueStorageInterface } from '../types';

const MEMORY_KEY_PREFIX = '@MemoryStorage:';

/**
 * @internal
 */
export class LocalStorage implements KeyValueStorageInterface {
	/**
	 * This is used to set a specific item in storage
	 * @param {string} key - the key for the item
	 * @param {object} value - the value
	 * @returns {string} value that was set
	 */
	setItem(key: string, value: string) {
		return AsyncStorage.setItem(`${MEMORY_KEY_PREFIX}${key}`, value);
	}

	/**
	 * This is used to get a specific key from storage
	 * @param {string} key - the key for the item
	 * This is used to clear the storage
	 * @returns {string} the data item
	 */
	getItem(key: string) {
		return AsyncStorage.getItem(`${MEMORY_KEY_PREFIX}${key}`);
	}

	/**
	 * This is used to remove an item from storage
	 * @param {string} key - the key being set
	 * @returns {string} value - value that was deleted
	 */
	removeItem(key: string): Promise<void> {
		return AsyncStorage.removeItem(`${MEMORY_KEY_PREFIX}${key}`);
	}

	/**
	 * This is used to clear the storage
	 * @returns {string} nothing
	 */
	async clear(): Promise<void> {
		const allKeys = await AsyncStorage.getAllKeys();
		return AsyncStorage.multiRemove(
			allKeys.filter(key => key.startsWith(MEMORY_KEY_PREFIX))
		);
	}
}
