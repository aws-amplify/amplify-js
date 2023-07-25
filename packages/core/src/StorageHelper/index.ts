// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import * as Cookies from 'js-cookie';
import {
	CookieStorageData,
	KeyValueStorageInterface,
	SameSite,
} from '../types';
import { PlatformNotSupportedError } from '../Errors';

let dataMemory = {};

/** @class */
export class MemoryStorage {
	/**
	 * This is used to set a specific item in storage
	 * @param {string} key - the key for the item
	 * @param {object} value - the value
	 * @returns {string} value that was set
	 */
	static setItem(key: string, value: any) {
		dataMemory[key] = value;
		return dataMemory[key];
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
}

export class StorageHelper {
	private storageWindow: any;
	/**
	 * This is used to get a storage object
	 * @returns {object} the storage
	 */
	constructor() {
		try {
			this.storageWindow = window.localStorage;
			this.storageWindow.setItem('aws.amplify.test-ls', 1);
			this.storageWindow.removeItem('aws.amplify.test-ls');
		} catch (exception) {
			this.storageWindow = MemoryStorage;
		}
	}

	/**
	 * This is used to return the storage
	 * @returns {object} the storage
	 */
	getStorage(): any {
		return this.storageWindow;
	}
}

class MemoryKeyValueStorageClass implements KeyValueStorageInterface {
	myStorage: Record<string, string> = {};

	async setItem(key: string, value: string): Promise<void> {
		this.myStorage[key] = value;
		return;
	}

	async getItem(key: string): Promise<string> {
		return this.myStorage[key];
	}

	async removeItem(key: string): Promise<void> {
		delete this.myStorage[key];
		return;
	}

	async clear(): Promise<void> {
		Object.keys(this.myStorage).forEach(key => {
			delete this.myStorage[key];
		});

		return;
	}
}

export const MemoryKeyValueStorage = new MemoryKeyValueStorageClass();
export class CookieStorage implements KeyValueStorageInterface {
	domain: string;
	path: string;
	expires: number; // days;
	secure: boolean;
	sameSite: SameSite;

	constructor(data: CookieStorageData = {}) {
		if (data.domain) {
			this.domain = data.domain;
		}
		if (data.path) {
			this.path = data.path;
		} else {
			this.path = '/';
		}
		if (Object.prototype.hasOwnProperty.call(data, 'expires')) {
			this.expires = data.expires;
		} else {
			this.expires = 365;
		}
		if (Object.prototype.hasOwnProperty.call(data, 'secure')) {
			this.secure = data.secure;
		} else {
			this.secure = true;
		}
		if (Object.prototype.hasOwnProperty.call(data, 'sameSite')) {
			if (!['strict', 'lax', 'none'].includes(data.sameSite)) {
				throw new Error(
					'The sameSite value of cookieStorage must be "lax", "strict" or "none".'
				);
			}
			if (data.sameSite === 'none' && !this.secure) {
				throw new Error(
					'sameSite = None requires the Secure attribute in latest browser versions.'
				);
			}
			this.sameSite = data.sameSite;
		} else {
			this.sameSite = null;
		}
	}

	async setItem(key: string, value: string): Promise<void> {
		const options: CookieStorageData = {
			path: this.path,
			expires: this.expires,
			domain: this.domain,
			secure: this.secure,
		};

		if (this.sameSite) {
			options.sameSite = this.sameSite;
		}

		Cookies.set(key, value, options);
		return Cookies.get(key);
	}

	async getItem(key: string): Promise<string> {
		return Cookies.get(key);
	}

	async removeItem(key: string): Promise<void> {
		const options: CookieStorageData = {
			path: this.path,
			expires: this.expires,
			domain: this.domain,
			secure: this.secure,
		};

		if (this.sameSite) {
			options.sameSite = this.sameSite;
		}

		Cookies.remove(key, options);
	}

	async clear(): Promise<void> {
		const cookies = Cookies.get();
		const numKeys = Object.keys(cookies).length;
		const promiseArray: Promise<void>[] = [];
		for (let index = 0; index < numKeys; ++index) {
			promiseArray.push(this.removeItem(Object.keys(cookies)[index]));
		}
		await Promise.all(promiseArray);
	}
}

class LocalStorageClass implements KeyValueStorageInterface {
	storage?: Storage;

	constructor() {
		if (typeof window !== undefined) {
			try {
				this.storage = window?.localStorage;
			} catch (error) {}
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
class SessionStorageClass implements KeyValueStorageInterface {
	storage?: Storage;

	constructor() {
		if (typeof window !== undefined) {
			try {
				this.storage = window?.sessionStorage;
			} catch (error) {}
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

export const SessionStorage = new SessionStorageClass();
