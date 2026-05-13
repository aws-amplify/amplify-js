// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PlatformNotSupportedError } from '../errors';
import { SyncStorage } from '../types';

/**
 * @internal
 */
export class SyncKeyValueStorage implements SyncStorage {
	#storage?: Storage;

	constructor(storage?: Storage) {
		this.#storage = storage;
	}

	/**
	 * This is used to set a specific item in storage
	 * @param {string} key - the key for the item
	 * @param {object} value - the value
	 */
	setItem(key: string, value: string) {
		if (!this.#storage) throw new PlatformNotSupportedError();
		this.#storage.setItem(key, value);
	}

	/**
	 * This is used to get a specific key from storage
	 * @param {string} key - the key for the item
	 * @returns {string | null} the data item
	 */
	getItem(key: string) {
		if (!this.#storage) throw new PlatformNotSupportedError();

		return this.#storage.getItem(key);
	}

	/**
	 * This is used to remove an item from storage
	 * @param {string} key - the key being set
	 */
	removeItem(key: string) {
		if (!this.#storage) throw new PlatformNotSupportedError();
		this.#storage.removeItem(key);
	}

	/**
	 * This is used to clear the storage
	 */
	clear() {
		if (!this.#storage) throw new PlatformNotSupportedError();
		this.#storage.clear();
	}
}
