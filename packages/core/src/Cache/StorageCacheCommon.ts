// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger } from '../Logger';
import { KeyValueStorageInterface } from '../types';

import { currentSizeKey, defaultConfig } from './constants';
import { CacheConfig, CacheItem, CacheItemOptions } from './types';
import { getByteLength, getCurrentSizeKey, getCurrentTime } from './utils';
import { CacheErrorCode, assert } from './utils/errorHelpers';

const logger = new ConsoleLogger('StorageCache');

/**
 * Initialization of the cache
 *
 */
export abstract class StorageCacheCommon {
	protected config: CacheConfig;
	protected keyValueStorage: KeyValueStorageInterface;

	/**
	 * Initialize the cache
	 *
	 * @param config - Custom configuration for this instance.
	 */
	constructor({
		config,
		keyValueStorage,
	}: {
		config?: CacheConfig;
		keyValueStorage: KeyValueStorageInterface;
	}) {
		this.config = {
			...defaultConfig,
			...config,
		};
		this.keyValueStorage = keyValueStorage;

		this.sanitizeConfig();
	}

	protected abstract getAllCacheKeys(options?: {
		omitSizeKey?: boolean;
	}): Promise<string[]>;

	public getModuleName() {
		return 'Cache';
	}

	/**
	 * Set custom configuration for the cache instance.
	 *
	 * @param config - customized configuration (without keyPrefix, which can't be changed)
	 *
	 * @return - the current configuration
	 */
	public configure(config?: Omit<CacheConfig, 'keyPrefix'>): CacheConfig {
		if (config) {
			if ((config as CacheConfig).keyPrefix) {
				logger.warn(
					'keyPrefix can not be re-configured on an existing Cache instance.',
				);
			}

			this.config = {
				...this.config,
				...config,
			};
		}

		this.sanitizeConfig();

		return this.config;
	}

	/**
	 * return the current size of the cache
	 * @return {Promise}
	 */
	public async getCurrentCacheSize() {
		let size = await this.getStorage().getItem(
			getCurrentSizeKey(this.config.keyPrefix),
		);
		if (!size) {
			await this.getStorage().setItem(
				getCurrentSizeKey(this.config.keyPrefix),
				'0',
			);
			size = '0';
		}

		return Number(size);
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
	 *
	 * @return {Promise}
	 */
	public async setItem(
		key: string,
		value: any,
		options?: Record<string, any>,
	): Promise<void> {
		logger.debug(
			`Set item: key is ${key}, value is ${value} with options: ${options}`,
		);

		if (!key || key === currentSizeKey) {
			logger.warn(
				`Invalid key: should not be empty or reserved key: '${currentSizeKey}'`,
			);

			return;
		}

		if (typeof value === 'undefined') {
			logger.warn(`The value of item should not be undefined!`);

			return;
		}

		const cacheItemOptions = {
			priority:
				options?.priority !== undefined
					? options.priority
					: this.config.defaultPriority,
			expires:
				options?.expires !== undefined
					? options.expires
					: this.config.defaultTTL + getCurrentTime(),
		};

		if (cacheItemOptions.priority < 1 || cacheItemOptions.priority > 5) {
			logger.warn(
				`Invalid parameter: priority due to out or range. It should be within 1 and 5.`,
			);

			return;
		}

		const prefixedKey = `${this.config.keyPrefix}${key}`;
		const item = this.fillCacheItem(prefixedKey, value, cacheItemOptions);

		// check whether this item is too big;
		if (item.byteSize > this.config.itemMaxSize) {
			logger.warn(
				`Item with key: ${key} you are trying to put into is too big!`,
			);

			return;
		}

		try {
			// first look into the storage, if it exists, delete it.
			const val = await this.getStorage().getItem(prefixedKey);
			if (val) {
				await this.removeCacheItem(prefixedKey, JSON.parse(val).byteSize);
			}

			// check whether the cache is full
			if (await this.isCacheFull(item.byteSize)) {
				const validKeys = await this.clearInvalidAndGetRemainingKeys();
				if (await this.isCacheFull(item.byteSize)) {
					const sizeToPop = await this.sizeToPop(item.byteSize);
					await this.popOutItems(validKeys, sizeToPop);
				}
			}

			// put item in the cache
			return this.setCacheItem(prefixedKey, item);
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
	 *
	 * @return {Promise} - return a promise resolves to be the value of the item
	 */
	public async getItem(
		key: string,
		options?: CacheItemOptions,
	): Promise<CacheItem['data']> {
		logger.debug(`Get item: key is ${key} with options ${options}`);
		let cached;

		if (!key || key === currentSizeKey) {
			logger.warn(
				`Invalid key: should not be empty or reserved key: '${currentSizeKey}'`,
			);

			return null;
		}

		const prefixedKey = `${this.config.keyPrefix}${key}`;

		try {
			cached = await this.getStorage().getItem(prefixedKey);
			if (cached != null) {
				if (await this.isExpired(prefixedKey)) {
					// if expired, remove that item and return null
					await this.removeCacheItem(prefixedKey, JSON.parse(cached).byteSize);
				} else {
					// if not expired, update its visitedTime and return the value
					const item = await this.updateVisitedTime(
						JSON.parse(cached),
						prefixedKey,
					);

					return item.data;
				}
			}

			if (options?.callback) {
				const val = options.callback();
				if (val !== null) {
					await this.setItem(key, val, options);
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
	public async removeItem(key: string): Promise<void> {
		logger.debug(`Remove item: key is ${key}`);

		if (!key || key === currentSizeKey) {
			logger.warn(
				`Invalid key: should not be empty or reserved key: '${currentSizeKey}'`,
			);

			return;
		}

		const prefixedKey = `${this.config.keyPrefix}${key}`;

		try {
			const val = await this.getStorage().getItem(prefixedKey);
			if (val) {
				await this.removeCacheItem(prefixedKey, JSON.parse(val).byteSize);
			}
		} catch (e) {
			logger.warn(`removeItem failed! ${e}`);
		}
	}

	/**
	 * Return all the keys owned by this cache.
	 * Will return an empty array if error occurred.
	 *
	 * @return {Promise}
	 */
	public async getAllKeys() {
		try {
			return await this.getAllCacheKeys();
		} catch (e) {
			logger.warn(`getAllkeys failed! ${e}`);

			return [];
		}
	}

	protected getStorage(): KeyValueStorageInterface {
		return this.keyValueStorage;
	}

	/**
	 * check whether item is expired
	 *
	 * @param key - the key of the item
	 *
	 * @return true if the item is expired.
	 */
	protected async isExpired(key: string): Promise<boolean> {
		const text = await this.getStorage().getItem(key);
		assert(text !== null, CacheErrorCode.NoCacheItem, `Key: ${key}`);
		const item: CacheItem = JSON.parse(text);
		if (getCurrentTime() >= item.expires) {
			return true;
		}

		return false;
	}

	/**
	 * delete item from cache
	 *
	 * @param prefixedKey - the key of the item
	 * @param size - optional, the byte size of the item
	 */
	protected async removeCacheItem(
		prefixedKey: string,
		size?: number,
	): Promise<void> {
		const item = await this.getStorage().getItem(prefixedKey);
		assert(item !== null, CacheErrorCode.NoCacheItem, `Key: ${prefixedKey}`);
		const itemSize: number = size ?? JSON.parse(item).byteSize;
		// first try to update the current size of the cache
		await this.decreaseCurrentSizeInBytes(itemSize);

		// try to remove the item from cache
		try {
			await this.getStorage().removeItem(prefixedKey);
		} catch (removeItemError) {
			// if some error happened, we need to rollback the current size
			await this.increaseCurrentSizeInBytes(itemSize);
			logger.error(`Failed to remove item: ${removeItemError}`);
		}
	}

	/**
	 * produce a JSON object with meta-data and data value
	 * @param value - the value of the item
	 * @param options - optional, the specified meta-data
	 *
	 * @return - the item which has the meta-data and the value
	 */
	protected fillCacheItem(
		key: string,
		value: object | number | string | boolean,
		options: CacheItemOptions,
	): CacheItem {
		const item: CacheItem = {
			key,
			data: value,
			timestamp: getCurrentTime(),
			visitedTime: getCurrentTime(),
			priority: options.priority ?? 0,
			expires: options.expires ?? 0,
			type: typeof value,
			byteSize: 0,
		};
		// calculate byte size
		item.byteSize = getByteLength(JSON.stringify(item));
		// re-calculate using cache item with updated byteSize property
		item.byteSize = getByteLength(JSON.stringify(item));

		return item;
	}

	private sanitizeConfig(): void {
		if (this.config.itemMaxSize > this.config.capacityInBytes) {
			logger.error(
				'Invalid parameter: itemMaxSize. It should be smaller than capacityInBytes. Setting back to default.',
			);
			this.config.itemMaxSize = defaultConfig.itemMaxSize;
		}

		if (this.config.defaultPriority > 5 || this.config.defaultPriority < 1) {
			logger.error(
				'Invalid parameter: defaultPriority. It should be between 1 and 5. Setting back to default.',
			);
			this.config.defaultPriority = defaultConfig.defaultPriority;
		}

		if (
			Number(this.config.warningThreshold) > 1 ||
			Number(this.config.warningThreshold) < 0
		) {
			logger.error(
				'Invalid parameter: warningThreshold. It should be between 0 and 1. Setting back to default.',
			);
			this.config.warningThreshold = defaultConfig.warningThreshold;
		}

		// Set 5MB limit
		const cacheLimit: number = 5 * 1024 * 1024;
		if (this.config.capacityInBytes > cacheLimit) {
			logger.error(
				'Cache Capacity should be less than 5MB. Setting back to default. Setting back to default.',
			);
			this.config.capacityInBytes = defaultConfig.capacityInBytes;
		}
	}

	/**
	 * increase current size of the cache
	 *
	 * @param amount - the amount of the cache szie which need to be increased
	 */
	private async increaseCurrentSizeInBytes(amount: number): Promise<void> {
		const size = await this.getCurrentCacheSize();
		await this.getStorage().setItem(
			getCurrentSizeKey(this.config.keyPrefix),
			(size + amount).toString(),
		);
	}

	/**
	 * decrease current size of the cache
	 *
	 * @param amount - the amount of the cache size which needs to be decreased
	 */
	private async decreaseCurrentSizeInBytes(amount: number): Promise<void> {
		const size = await this.getCurrentCacheSize();
		await this.getStorage().setItem(
			getCurrentSizeKey(this.config.keyPrefix),
			(size - amount).toString(),
		);
	}

	/**
	 * update the visited time if item has been visited
	 *
	 * @param item - the item which need to be updated
	 * @param prefixedKey - the key of the item
	 *
	 * @return the updated item
	 */
	private async updateVisitedTime(
		item: CacheItem,
		prefixedKey: string,
	): Promise<CacheItem> {
		item.visitedTime = getCurrentTime();
		await this.getStorage().setItem(prefixedKey, JSON.stringify(item));

		return item;
	}

	/**
	 * put item into cache
	 *
	 * @param prefixedKey - the key of the item
	 * @param itemData - the value of the item
	 * @param itemSizeInBytes - the byte size of the item
	 */
	private async setCacheItem(
		prefixedKey: string,
		item: CacheItem,
	): Promise<void> {
		// first try to update the current size of the cache.
		await this.increaseCurrentSizeInBytes(item.byteSize);

		// try to add the item into cache
		try {
			await this.getStorage().setItem(prefixedKey, JSON.stringify(item));
		} catch (setItemErr) {
			// if some error happened, we need to rollback the current size
			await this.decreaseCurrentSizeInBytes(item.byteSize);
			logger.error(`Failed to set item ${setItemErr}`);
		}
	}

	/**
	 * total space needed when poping out items
	 *
	 * @param itemSize
	 *
	 * @return total space needed
	 */
	private async sizeToPop(itemSize: number): Promise<number> {
		const cur = await this.getCurrentCacheSize();
		const spaceItemNeed = cur + itemSize - this.config.capacityInBytes;
		const cacheThresholdSpace =
			(1 - this.config.warningThreshold) * this.config.capacityInBytes;

		return spaceItemNeed > cacheThresholdSpace
			? spaceItemNeed
			: cacheThresholdSpace;
	}

	/**
	 * see whether cache is full
	 *
	 * @param itemSize
	 *
	 * @return true if cache is full
	 */
	private async isCacheFull(itemSize: number): Promise<boolean> {
		const cur = await this.getCurrentCacheSize();

		return itemSize + cur > this.config.capacityInBytes;
	}

	/**
	 * get all the items we have, sort them by their priority,
	 * if priority is same, sort them by their last visited time
	 * pop out items from the low priority (5 is the lowest)
	 * @private
	 * @param keys - all the keys in this cache
	 * @param sizeToPop - the total size of the items which needed to be poped out
	 */
	private async popOutItems(keys: string[], sizeToPop: number): Promise<void> {
		const items: any[] = [];
		let remainedSize = sizeToPop;
		for (const key of keys) {
			const val = await this.getStorage().getItem(key);
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

		for (const item of items) {
			// pop out items until we have enough room for new item
			await this.removeCacheItem(item.key, item.byteSize);
			remainedSize -= item.byteSize;
			if (remainedSize <= 0) {
				return;
			}
		}
	}

	/**
	 * Scan the storage and combine the following operations for efficiency
	 *   1. Clear out all expired keys owned by this cache, not including the size key.
	 *   2. Return the remaining keys.
	 *
	 * @return The remaining valid keys
	 */
	private async clearInvalidAndGetRemainingKeys(): Promise<string[]> {
		const remainingKeys: string[] = [];
		const keys = await this.getAllCacheKeys({
			omitSizeKey: true,
		});
		for (const key of keys) {
			if (await this.isExpired(key)) {
				await this.removeCacheItem(key);
			} else {
				remainingKeys.push(key);
			}
		}

		return remainingKeys;
	}

	/**
	 * clear the entire cache
	 * The cache will abort and output a warning if error occurs
	 * @return {Promise}
	 */
	async clear() {
		logger.debug(`Clear Cache`);
		try {
			const keys = await this.getAllKeys();
			for (const key of keys) {
				const prefixedKey = `${this.config.keyPrefix}${key}`;
				await this.getStorage().removeItem(prefixedKey);
			}
		} catch (e) {
			logger.warn(`clear failed! ${e}`);
		}
	}
}
