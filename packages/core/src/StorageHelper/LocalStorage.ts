// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PlatformNotSupportedError } from '../Errors';
import { AuthStorage } from '../types';

export class LocalStorageClass implements AuthStorage {
	storage?: Storage;

	constructor() {
		if (typeof window !== undefined) {
			this.storage = window?.localStorage;
		}
	}

	/**
	 * This is used to set a specific item in storage
	 * @param {string} key - the key for the item
	 * @param {object} value - the value
	 * @returns {string} value that was set
	 */
	async setItem(key: string, value: string): Promise<void> {
		if (!this.storage) throw PlatformNotSupportedError;
		this.storage.setItem(key, value);
	}

	/**
	 * This is used to get a specific key from storage
	 * @param {string} key - the key for the item
	 * This is used to clear the storage
	 * @returns {string} the data item
	 */
	async getItem(key: string): Promise<string | null> {
		if (!this.storage) throw PlatformNotSupportedError;
		return this.storage.getItem(key);
	}

	/**
	 * This is used to remove an item from storage
	 * @param {string} key - the key being set
	 * @returns {string} value - value that was deleted
	 */
	async removeItem(key: string): Promise<void> {
		if (!this.storage) throw PlatformNotSupportedError;
		this.storage.removeItem(key);
	}

	/**
	 * This is used to clear the storage
	 * @returns {string} nothing
	 */
	async clear(): Promise<void> {
		if (!this.storage) throw PlatformNotSupportedError;
		this.storage.clear();
	}
}

export const LocalStorage = new LocalStorageClass();
