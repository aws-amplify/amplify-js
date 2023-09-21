// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger as Logger } from '../Logger';
import { defaultConfig, getCurrTime } from './Utils';
import { StorageCache } from './StorageCache';
import { ICache, CacheConfig, CacheItem, CacheItemOptions } from './types';
import { getCurrSizeKey } from './Utils/CacheUtils';
import { assert, CacheErrorCode } from './Utils/errorHelpers';

const logger = new Logger('Cache');

/**
 * Customized storage based on the SessionStorage or LocalStorage with LRU implemented
 */
export class BrowserStorageCacheClass extends StorageCache implements ICache {
	/**
	 * initialize the cache
	 * @param config - the configuration of the cache
	 */
	constructor(config?: CacheConfig) {
		super(config);

		assert(!!this.cacheConfig.storage, CacheErrorCode.NoCacheStorage);
		this.cacheConfig.storage = this.cacheConfig.storage;
		this.getItem = this.getItem.bind(this);
		this.setItem = this.setItem.bind(this);
		this.removeItem = this.removeItem.bind(this);
	}
	private getStorage(): Storage {
		assert(!!this.cacheConfig.storage, CacheErrorCode.NoCacheStorage);
		return this.cacheConfig.storage;
	}
	/**
	 * decrease current size of the cache
	 *
	 * @private
	 * @param amount - the amount of the cache size which needs to be decreased
	 */
	private _decreaseCurSizeInBytes(amount: number): void {
		const curSize: number = this.getCacheCurSize();
		this.getStorage().setItem(
			getCurrSizeKey(this.cacheConfig.keyPrefix),
			(curSize - amount).toString()
		);
	}

	/**
	 * increase current size of the cache
	 *
	 * @private
	 * @param amount - the amount of the cache szie which need to be increased
	 */
	private _increaseCurSizeInBytes(amount: number): void {
		const curSize: number = this.getCacheCurSize();
		this.getStorage().setItem(
			getCurrSizeKey(this.cacheConfig.keyPrefix),
			(curSize + amount).toString()
		);
	}

	/**
	 * update the visited time if item has been visited
	 *
	 * @private
	 * @param item - the item which need to be refreshed
	 * @param prefixedKey - the key of the item
	 *
	 * @return the refreshed item
	 */
	private _refreshItem(item: CacheItem, prefixedKey: string): CacheItem {
		item.visitedTime = getCurrTime();
		this.getStorage().setItem(prefixedKey, JSON.stringify(item));
		return item;
	}

	/**
	 * check wether item is expired
	 *
	 * @private
	 * @param key - the key of the item
	 *
	 * @return true if the item is expired.
	 */
	private _isExpired(key: string): boolean {
		const text: string | null = this.getStorage().getItem(key);
		assert(text !== null, CacheErrorCode.NoCacheItem, `Key: ${key}`);
		const item: CacheItem = JSON.parse(text);
		if (getCurrTime() >= item.expires) {
			return true;
		}
		return false;
	}

	/**
	 * delete item from cache
	 *
	 * @private
	 * @param prefixedKey - the key of the item
	 * @param size - optional, the byte size of the item
	 */
	private _removeItem(prefixedKey: string, size?: number): void {
		const item = this.getStorage().getItem(prefixedKey);
		assert(item !== null, CacheErrorCode.NoCacheItem, `Key: ${prefixedKey}`);
		const itemSize: number = size ?? JSON.parse(item).byteSize;
		this._decreaseCurSizeInBytes(itemSize);
		// remove the cache item
		this.getStorage().removeItem(prefixedKey);
	}

	/**
	 * put item into cache
	 *
	 * @private
	 * @param prefixedKey - the key of the item
	 * @param itemData - the value of the item
	 * @param itemSizeInBytes - the byte size of the item
	 */
	private _setItem(prefixedKey: string, item: CacheItem): void {
		// update the cache size
		this._increaseCurSizeInBytes(item.byteSize);

		try {
			this.getStorage().setItem(prefixedKey, JSON.stringify(item));
		} catch (setItemErr) {
			// if failed, we need to rollback the cache size
			this._decreaseCurSizeInBytes(item.byteSize);
			logger.error(`Failed to set item ${setItemErr}`);
		}
	}

	/**
	 * total space needed when poping out items
	 *
	 * @private
	 * @param itemSize
	 *
	 * @return total space needed
	 */
	private _sizeToPop(itemSize: number): number {
		const spaceItemNeed =
			this.getCacheCurSize() + itemSize - this.cacheConfig.capacityInBytes;
		const cacheThresholdSpace =
			(1 - this.cacheConfig.warningThreshold) *
			this.cacheConfig.capacityInBytes;
		return spaceItemNeed > cacheThresholdSpace
			? spaceItemNeed
			: cacheThresholdSpace;
	}

	/**
	 * see whether cache is full
	 *
	 * @private
	 * @param itemSize
	 *
	 * @return true if cache is full
	 */
	private _isCacheFull(itemSize: number): boolean {
		return itemSize + this.getCacheCurSize() > this.cacheConfig.capacityInBytes;
	}

	/**
	 * scan the storage and find out all the keys owned by this cache
	 * also clean the expired keys while scanning
	 *
	 * @private
	 *
	 * @return array of keys
	 */
	private _findValidKeys(): string[] {
		const keys: string[] = [];
		const keyInCache: string[] = [];
		// get all keys in Storage
		for (let i = 0; i < this.getStorage().length; i += 1) {
			const key = this.getStorage().key(i);
			if (key) {
				keyInCache.push(key);
			}
		}

		// find those items which belong to our cache and also clean those expired items
		for (let i = 0; i < keyInCache.length; i += 1) {
			const key: string = keyInCache[i];
			if (
				key.indexOf(this.cacheConfig.keyPrefix) === 0 &&
				key !== getCurrSizeKey(this.cacheConfig.keyPrefix)
			) {
				if (this._isExpired(key)) {
					this._removeItem(key);
				} else {
					keys.push(key);
				}
			}
		}
		return keys;
	}

	/**
	 * get all the items we have, sort them by their priority,
	 * if priority is same, sort them by their last visited time
	 * pop out items from the low priority (5 is the lowest)
	 *
	 * @private
	 * @param keys - all the keys in this cache
	 * @param sizeToPop - the total size of the items which needed to be poped out
	 */
	private _popOutItems(keys: string[], sizeToPop: number): void {
		const items: CacheItem[] = [];
		let remainedSize: number = sizeToPop;
		// get the items from Storage
		for (let i = 0; i < keys.length; i += 1) {
			const val: string | null = this.getStorage().getItem(keys[i]);
			if (val != null) {
				const item: CacheItem = JSON.parse(val);
				items.push(item);
			}
		}

		// first compare priority
		// then compare visited time
		items.sort((a, b) => {
			if (a.priority > b.priority) {
				return -1;
			} else if (a.priority < b.priority) {
				return 1;
			} else {
				if (a.visitedTime < b.visitedTime) {
					return -1;
				} else return 1;
			}
		});

		for (let i = 0; i < items.length; i += 1) {
			// pop out items until we have enough room for new item
			this._removeItem(items[i].key, items[i].byteSize);
			remainedSize -= items[i].byteSize;
			if (remainedSize <= 0) {
				return;
			}
		}
	}

	/**
	 * Set item into cache. You can put number, string, boolean or object.
	 * The cache will first check whether has the same key.
	 * If it has, it will delete the old item and then put the new item in
	 * The cache will pop out items if it is full
	 * You can specify the cache item options. The cache will abort and output a warning:
	 * If the key is invalid
	 * If the size of the item exceeds itemMaxSize.
	 * If the value is undefined
	 * If incorrect cache item configuration
	 * If error happened with browser storage
	 *
	 * @param key - the key of the item
	 * @param value - the value of the item
	 * @param {Object} [options] - optional, the specified meta-data
	 */
	public setItem(
		key: string,
		value: object | number | string | boolean,
		options?: CacheItemOptions
	): void {
		logger.log(
			`Set item: key is ${key}, value is ${value} with options: ${options}`
		);
		const prefixedKey: string = this.cacheConfig.keyPrefix + key;
		// invalid keys
		if (
			prefixedKey === this.cacheConfig.keyPrefix ||
			prefixedKey === getCurrSizeKey(this.cacheConfig.keyPrefix)
		) {
			logger.warn(`Invalid key: should not be empty or 'CurSize'`);
			return;
		}

		if (typeof value === 'undefined') {
			logger.warn(`The value of item should not be undefined!`);
			return;
		}

		const cacheItemOptions = {
			priority:
				options && options.priority !== undefined
					? options.priority
					: this.cacheConfig.defaultPriority,
			expires:
				options && options.expires !== undefined
					? options.expires
					: this.cacheConfig.defaultTTL + getCurrTime(),
		};

		if (cacheItemOptions.priority < 1 || cacheItemOptions.priority > 5) {
			logger.warn(
				`Invalid parameter: priority due to out or range. It should be within 1 and 5.`
			);
			return;
		}

		const item: CacheItem = this.fillCacheItem(
			prefixedKey,
			value,
			cacheItemOptions
		);

		// check wether this item is too big;
		if (item.byteSize > this.cacheConfig.itemMaxSize) {
			logger.warn(
				`Item with key: ${key} you are trying to put into is too big!`
			);
			return;
		}

		try {
			// first look into the storage, if it exists, delete it.
			const val: string | null = this.getStorage().getItem(prefixedKey);
			if (val) {
				this._removeItem(prefixedKey, JSON.parse(val).byteSize);
			}

			// check whether the cache is full
			if (this._isCacheFull(item.byteSize)) {
				const validKeys: string[] = this._findValidKeys();
				// check again and then pop out items
				if (this._isCacheFull(item.byteSize)) {
					const sizeToPop: number = this._sizeToPop(item.byteSize);
					this._popOutItems(validKeys, sizeToPop);
				}
			}

			// put item in the cache
			// may failed due to storage full
			this._setItem(prefixedKey, item);
		} catch (e) {
			logger.warn(`setItem failed! ${e}`);
		}
	}

	/**
	 * Get item from cache. It will return null if item doesn’t exist or it has been expired.
	 * If you specified callback function in the options,
	 * then the function will be executed if no such item in the cache
	 * and finally put the return value into cache.
	 * Please make sure the callback function will return the value you want to put into the cache.
	 * The cache will abort output a warning:
	 * If the key is invalid
	 * If error happened with browser storage
	 *
	 * @param key - the key of the item
	 * @param {Object} [options] - the options of callback function
	 *
	 * @return - return the value of the item
	 */
	public getItem(key: string, options?: CacheItemOptions): any {
		logger.log(`Get item: key is ${key} with options ${options}`);
		let ret: string | null = null;
		const prefixedKey: string = this.cacheConfig.keyPrefix + key;

		if (
			prefixedKey === this.cacheConfig.keyPrefix ||
			prefixedKey === getCurrSizeKey(this.cacheConfig.keyPrefix)
		) {
			logger.warn(`Invalid key: should not be empty or 'CurSize'`);
			return null;
		}

		try {
			ret = this.getStorage().getItem(prefixedKey);
			if (ret != null) {
				if (this._isExpired(prefixedKey)) {
					// if expired, remove that item and return null
					this._removeItem(prefixedKey, JSON.parse(ret).byteSize);
					ret = null;
				} else {
					// if not expired, great, return the value and refresh it
					let item: CacheItem = JSON.parse(ret);
					item = this._refreshItem(item, prefixedKey);
					return item.data;
				}
			}

			if (options && options.callback !== undefined) {
				const val: object | string | number | boolean = options.callback();
				if (val !== null) {
					this.setItem(key, val, options);
				}
				return val;
			}
			return null;
		} catch (e) {
			logger.warn(`getItem failed! ${e}`);
			return null;
		}
	}

	/**
	 * remove item from the cache
	 * The cache will abort output a warning:
	 * If error happened with browser storage
	 * @param key - the key of the item
	 */
	public removeItem(key: string): void {
		logger.log(`Remove item: key is ${key}`);
		const prefixedKey: string = this.cacheConfig.keyPrefix + key;

		if (
			prefixedKey === this.cacheConfig.keyPrefix ||
			prefixedKey === getCurrSizeKey(this.cacheConfig.keyPrefix)
		) {
			return;
		}

		try {
			const val: string | null = this.getStorage().getItem(prefixedKey);
			if (val) {
				this._removeItem(prefixedKey, JSON.parse(val).byteSize);
			}
		} catch (e) {
			logger.warn(`removeItem failed! ${e}`);
		}
	}

	/**
	 * clear the entire cache
	 * The cache will abort output a warning:
	 * If error happened with browser storage
	 */
	public clear(): void {
		logger.log(`Clear Cache`);
		const keysToRemove: string[] = [];

		for (let i = 0; i < this.getStorage().length; i += 1) {
			const key = this.getStorage().key(i);
			if (key?.indexOf(this.cacheConfig.keyPrefix) === 0) {
				keysToRemove.push(key);
			}
		}

		try {
			for (let i = 0; i < keysToRemove.length; i += 1) {
				this.getStorage().removeItem(keysToRemove[i]);
			}
		} catch (e) {
			logger.warn(`clear failed! ${e}`);
		}
	}

	/**
	 * Return all the keys in the cache.
	 *
	 * @return - all keys in the cache
	 */
	public getAllKeys(): string[] {
		const keys: string[] = [];
		for (let i = 0; i < this.getStorage().length; i += 1) {
			const key = this.getStorage().key(i);
			if (
				key &&
				key.indexOf(this.cacheConfig.keyPrefix) === 0 &&
				key !== getCurrSizeKey(this.cacheConfig.keyPrefix)
			) {
				keys.push(key.substring(this.cacheConfig.keyPrefix.length));
			}
		}
		return keys;
	}

	/**
	 * return the current size of the cache
	 *
	 * @return - current size of the cache
	 */
	public getCacheCurSize(): number {
		let ret: string | null = this.getStorage().getItem(
			getCurrSizeKey(this.cacheConfig.keyPrefix)
		);
		if (!ret) {
			this.getStorage().setItem(
				getCurrSizeKey(this.cacheConfig.keyPrefix),
				'0'
			);
			ret = '0';
		}
		return Number(ret);
	}

	/**
	 * Return a new instance of cache with customized configuration.
	 * @param config - the customized configuration
	 *
	 * @return - new instance of Cache
	 */
	public createInstance(config: CacheConfig): ICache {
		if (!config.keyPrefix || config.keyPrefix === defaultConfig.keyPrefix) {
			logger.error('invalid keyPrefix, setting keyPrefix with timeStamp');
			config.keyPrefix = getCurrTime.toString();
		}

		return new BrowserStorageCacheClass(config);
	}
}

export const BrowserStorageCache: ICache = new BrowserStorageCacheClass();
