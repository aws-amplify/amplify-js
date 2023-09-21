// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConsoleLogger as Logger } from '../Logger';
import { StorageCache } from './StorageCache';
import { defaultConfig, getCurrTime } from './Utils';
import { CacheConfig, CacheItem, CacheItemOptions, ICache } from './types';
import { getCurrSizeKey } from './Utils/CacheUtils';
import { assert, CacheErrorCode } from './Utils/errorHelpers';

const logger = new Logger('AsyncStorageCache');

/*
 * Customized cache which based on the AsyncStorage with LRU implemented
 */
export class AsyncStorageCache extends StorageCache implements ICache {
	/**
	 * initialize the cache
	 *
	 * @param {Object} config - the configuration of the cache
	 */
	constructor(config?: CacheConfig) {
		super(config);

		this.getItem = this.getItem.bind(this);
		this.setItem = this.setItem.bind(this);
		this.removeItem = this.removeItem.bind(this);

		logger.debug('Using AsyncStorageCache');
	}

	/**
	 * decrease current size of the cache
	 * @private
	 * @param amount - the amount of the cache size which needs to be decreased
	 */
	async _decreaseCurSizeInBytes(amount: number) {
		const curSize = await this.getCacheCurSize();
		await AsyncStorage.setItem(
			getCurrSizeKey(this.cacheConfig.keyPrefix),
			(curSize - amount).toString()
		);
	}

	/**
	 * increase current size of the cache
	 * @private
	 * @param amount - the amount of the cache szie which need to be increased
	 */
	async _increaseCurSizeInBytes(amount: number) {
		const curSize = await this.getCacheCurSize();
		await AsyncStorage.setItem(
			getCurrSizeKey(this.cacheConfig.keyPrefix),
			(curSize + amount).toString()
		);
	}

	/**
	 * update the visited time if item has been visited
	 * @private
	 * @param item - the item which need to be refreshed
	 * @param prefixedKey - the key of the item
	 *
	 * @return the refreshed item
	 */
	async _refreshItem(item: CacheItem, prefixedKey: string) {
		item.visitedTime = getCurrTime();
		await AsyncStorage.setItem(prefixedKey, JSON.stringify(item));
		return item;
	}

	/**
	 * check wether item is expired
	 * @private
	 * @param key - the key of the item
	 *
	 * @return true if the item is expired.
	 */
	async _isExpired(key: string) {
		const text = await AsyncStorage.getItem(key);
		assert(text !== null, CacheErrorCode.NoCacheItem, `Key: ${key}`);
		const item = JSON.parse(text);
		if (getCurrTime() >= item.expires) {
			return true;
		}
		return false;
	}

	/**
	 * delete item from cache
	 * @private
	 * @param prefixedKey - the key of the item
	 * @param size - optional, the byte size of the item
	 */
	async _removeItem(prefixedKey: string, size?: number) {
		const config = await AsyncStorage.getItem(prefixedKey);
		assert(!!config, CacheErrorCode.NoCacheItem, `Key: ${prefixedKey}`);
		const itemSize = size ?? JSON.parse(config).byteSize;
		// first try to update the current size of the cache
		await this._decreaseCurSizeInBytes(itemSize);

		// try to remove the item from cache
		try {
			await AsyncStorage.removeItem(prefixedKey);
		} catch (removeItemError) {
			// if some error happened, we need to rollback the current size
			await this._increaseCurSizeInBytes(itemSize);
			logger.error(`Failed to remove item: ${removeItemError}`);
		}
	}

	/**
	 * put item into cache
	 * @private
	 * @param prefixedKey - the key of the item
	 * @param itemData - the value of the item
	 * @param itemSizeInBytes - the byte size of the item
	 */
	async _setItem(prefixedKey: string, item: any) {
		// first try to update the current size of the cache.
		await this._increaseCurSizeInBytes(item.byteSize);

		// try to add the item into cache
		try {
			await AsyncStorage.setItem(prefixedKey, JSON.stringify(item));
		} catch (setItemErr) {
			// if some error happened, we need to rollback the current size
			await this._decreaseCurSizeInBytes(item.byteSize);
			logger.error(`Failed to set item ${setItemErr}`);
		}
	}

	/**
	 * total space needed when poping out items
	 * @private
	 * @param itemSize
	 *
	 * @return total space needed
	 */
	async _sizeToPop(itemSize: number) {
		const spaceItemNeed =
			(await this.getCacheCurSize()) +
			itemSize -
			this.cacheConfig.capacityInBytes;
		const cacheThresholdSpace =
			(1 - this.cacheConfig.warningThreshold) *
			this.cacheConfig.capacityInBytes;
		return spaceItemNeed > cacheThresholdSpace
			? spaceItemNeed
			: cacheThresholdSpace;
	}

	/**
	 * see whether cache is full
	 * @private
	 * @param itemSize
	 *
	 * @return true if cache is full
	 */
	async _isCacheFull(itemSize: number) {
		return (
			itemSize + (await this.getCacheCurSize()) >
			this.cacheConfig.capacityInBytes
		);
	}

	/**
	 * scan the storage and find out all the keys owned by this cache
	 * also clean the expired keys while scanning
	 * @private
	 * @return array of keys
	 */
	async _findValidKeys() {
		const keys: string[] = [];
		let keyInCache: Readonly<string[]> = [];

		keyInCache = await AsyncStorage.getAllKeys();

		for (let i = 0; i < keyInCache.length; i += 1) {
			const key = keyInCache[i];
			if (
				key.indexOf(this.cacheConfig.keyPrefix) === 0 &&
				key !== getCurrSizeKey(this.cacheConfig.keyPrefix)
			) {
				if (await this._isExpired(key)) {
					await this._removeItem(key);
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
	 * @private
	 * @param keys - all the keys in this cache
	 * @param sizeToPop - the total size of the items which needed to be poped out
	 */
	async _popOutItems(keys: string[], sizeToPop: number) {
		const items: any[] = [];
		let remainedSize = sizeToPop;
		for (let i = 0; i < keys.length; i += 1) {
			const val = await AsyncStorage.getItem(keys[i]);
			if (val != null) {
				const item = JSON.parse(val);
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
			await this._removeItem(items[i].key, items[i].byteSize);
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
	 * @param {String} key - the key of the item
	 * @param {Object} value - the value of the item
	 * @param {Object} [options] - optional, the specified meta-data
	 * @return {Promise}
	 */
	async setItem(key: string, value: any, options: Record<string, any>) {
		logger.debug(
			`Set item: key is ${key}, value is ${value} with options: ${options}`
		);
		const prefixedKey = this.cacheConfig.keyPrefix + key;
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

		const item = this.fillCacheItem(prefixedKey, value, cacheItemOptions);

		// check wether this item is too big;
		if (item.byteSize > this.cacheConfig.itemMaxSize) {
			logger.warn(
				`Item with key: ${key} you are trying to put into is too big!`
			);
			return;
		}

		try {
			// first look into the storage, if it exists, delete it.
			const val = await AsyncStorage.getItem(prefixedKey);
			if (val) {
				await this._removeItem(prefixedKey, JSON.parse(val).byteSize);
			}

			// check whether the cache is full
			if (await this._isCacheFull(item.byteSize)) {
				const validKeys = await this._findValidKeys();
				if (await this._isCacheFull(item.byteSize)) {
					const sizeToPop = await this._sizeToPop(item.byteSize);
					await this._popOutItems(validKeys, sizeToPop);
				}
			}

			// put item in the cache
			await this._setItem(prefixedKey, item);
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
	 * If error happened with AsyncStorage
	 *
	 * @param {String} key - the key of the item
	 * @param {Object} [options] - the options of callback function
	 * @return {Promise} - return a promise resolves to be the value of the item
	 */
	async getItem(key: string, options: CacheItemOptions) {
		logger.debug(`Get item: key is ${key} with options ${options}`);
		let ret = null;
		const prefixedKey = this.cacheConfig.keyPrefix + key;

		if (
			prefixedKey === this.cacheConfig.keyPrefix ||
			prefixedKey === getCurrSizeKey(this.cacheConfig.keyPrefix)
		) {
			logger.warn(`Invalid key: should not be empty or 'CurSize'`);
			return null;
		}

		try {
			ret = await AsyncStorage.getItem(prefixedKey);
			if (ret != null) {
				if (await this._isExpired(prefixedKey)) {
					// if expired, remove that item and return null
					await this._removeItem(prefixedKey, JSON.parse(ret).byteSize);
				} else {
					// if not expired, great, return the value and refresh it
					let item = JSON.parse(ret);
					item = await this._refreshItem(item, prefixedKey);
					return item.data;
				}
			}

			if (options && options.callback !== undefined) {
				const val = options.callback();
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
	 * If error happened with AsyncStorage
	 * @param {String} key - the key of the item
	 * @return {Promise}
	 */
	async removeItem(key: string) {
		logger.debug(`Remove item: key is ${key}`);
		const prefixedKey = this.cacheConfig.keyPrefix + key;

		if (
			prefixedKey === this.cacheConfig.keyPrefix ||
			prefixedKey === getCurrSizeKey(this.cacheConfig.keyPrefix)
		) {
			return;
		}

		try {
			const val = await AsyncStorage.getItem(prefixedKey);
			if (val) {
				await this._removeItem(prefixedKey, JSON.parse(val).byteSize);
			}
		} catch (e) {
			logger.warn(`removeItem failed! ${e}`);
		}
	}

	/**
	 * clear the entire cache
	 * The cache will abort output a warning:
	 * If error happened with AsyncStorage
	 * @return {Promise}
	 */
	async clear() {
		logger.debug(`Clear Cache`);
		try {
			const keys = await AsyncStorage.getAllKeys();

			const keysToRemove: string[] = [];
			for (let i = 0; i < keys.length; i += 1) {
				if (keys[i].indexOf(this.cacheConfig.keyPrefix) === 0) {
					keysToRemove.push(keys[i]);
				}
			}

			// can be improved
			for (let i = 0; i < keysToRemove.length; i += 1) {
				await AsyncStorage.removeItem(keysToRemove[i]);
			}
		} catch (e) {
			logger.warn(`clear failed! ${e}`);
		}
	}

	/**
	 * return the current size of the cache
	 * @return {Promise}
	 */
	async getCacheCurSize() {
		let ret = await AsyncStorage.getItem(
			getCurrSizeKey(this.cacheConfig.keyPrefix)
		);
		if (!ret) {
			await AsyncStorage.setItem(
				getCurrSizeKey(this.cacheConfig.keyPrefix),
				'0'
			);
			ret = '0';
		}
		return Number(ret);
	}

	/**
	 * Return all the keys in the cache.
	 * Will return an empty array if error happend.
	 * @return {Promise}
	 */
	async getAllKeys() {
		try {
			const keys = await AsyncStorage.getAllKeys();

			const retKeys: string[] = [];
			for (let i = 0; i < keys.length; i += 1) {
				if (
					keys[i].indexOf(this.cacheConfig.keyPrefix) === 0 &&
					keys[i] !== getCurrSizeKey(this.cacheConfig.keyPrefix)
				) {
					retKeys.push(keys[i].substring(this.cacheConfig.keyPrefix.length));
				}
			}
			return retKeys;
		} catch (e) {
			logger.warn(`getALlkeys failed! ${e}`);
			return [];
		}
	}

	/**
	 * Return a new instance of cache with customized configuration.
	 * @param {Object} config - the customized configuration
	 * @return {Object} - the new instance of Cache
	 */
	createInstance(config: CacheConfig): ICache {
		if (config.keyPrefix === defaultConfig.keyPrefix) {
			logger.error('invalid keyPrefix, setting keyPrefix with timeStamp');
			config.keyPrefix = getCurrTime.toString();
		}
		return new AsyncStorageCache(config);
	}
}

const instance: ICache = new AsyncStorageCache();
export { AsyncStorage, instance as Cache };
