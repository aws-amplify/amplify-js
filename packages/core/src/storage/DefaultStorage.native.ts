// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { loadAsyncStorage } from '@aws-amplify/react-native';
import { KeyValueStorageInterface } from '../types';

const MEMORY_KEY_PREFIX = '@MemoryStorage:';

/**
 * @internal
 */
export class DefaultStorage implements KeyValueStorageInterface {
	private asyncStorage: ReturnType<typeof loadAsyncStorage>;

	constructor() {
		this.asyncStorage = loadAsyncStorage();
	}

	/**
	 * This is used to set a specific item in storage
	 * @param {string} key - the key for the item
	 * @param {object} value - the value
	 * @returns {string} value that was set
	 */
	setItem(key: string, value: string) {
		return this.asyncStorage.setItem(`${MEMORY_KEY_PREFIX}${key}`, value);
	}

	/**
	 * This is used to get a specific key from storage
	 * @param {string} key - the key for the item
	 * This is used to clear the storage
	 * @returns {string} the data item
	 */
	getItem(key: string) {
		return this.asyncStorage.getItem(`${MEMORY_KEY_PREFIX}${key}`);
	}

	/**
	 * This is used to remove an item from storage
	 * @param {string} key - the key being set
	 * @returns {string} value - value that was deleted
	 */
	removeItem(key: string): Promise<void> {
		return this.asyncStorage.removeItem(`${MEMORY_KEY_PREFIX}${key}`);
	}

	/**
	 * This is used to clear the storage
	 * @returns {string} nothing
	 */
	async clear(): Promise<void> {
		const allKeys = await this.asyncStorage.getAllKeys();
		return this.asyncStorage.multiRemove(
			allKeys.filter(key => key.startsWith(MEMORY_KEY_PREFIX))
		);
	}
}
