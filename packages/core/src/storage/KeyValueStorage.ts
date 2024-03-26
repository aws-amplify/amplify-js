// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PlatformNotSupportedError } from '../errors';
import { KeyValueStorageInterface } from '../types';

/**
 * @internal
 */
export class KeyValueStorage implements KeyValueStorageInterface {
	storage?: Storage;

	constructor(storage?: Storage) {
		this.storage = storage;
	}

	/**
	 * This is used to set a specific item in storage
	 * @param {string} key - the key for the item
	 * @param {object} value - the value
	 * @returns {string} value that was set
	 */
	async setItem(key: string, value: string) {
		if (!this.storage) throw new PlatformNotSupportedError();
		this.storage.setItem(key, value);
	}

	/**
	 * This is used to get a specific key from storage
	 * @param {string} key - the key for the item
	 * This is used to clear the storage
	 * @returns {string} the data item
	 */
	async getItem(key: string) {
		if (!this.storage) throw new PlatformNotSupportedError();

		return this.storage.getItem(key);
	}

	/**
	 * This is used to remove an item from storage
	 * @param {string} key - the key being set
	 * @returns {string} value - value that was deleted
	 */
	async removeItem(key: string) {
		if (!this.storage) throw new PlatformNotSupportedError();
		this.storage.removeItem(key);
	}

	/**
	 * This is used to clear the storage
	 * @returns {string} nothing
	 */
	async clear() {
		if (!this.storage) throw new PlatformNotSupportedError();
		this.storage.clear();
	}
}
