// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger } from '../Logger';
import { KeyValueStorage } from '../storage/KeyValueStorage';
import { getLocalStorageWithFallback } from '../storage/utils';

import { defaultConfig } from './constants';
import { StorageCacheCommon } from './StorageCacheCommon';
import { Cache, CacheConfig } from './types';
import { getCurrentSizeKey, getCurrentTime } from './utils';

const logger = new ConsoleLogger('StorageCache');

/**
 * Customized storage based on the SessionStorage or LocalStorage with LRU implemented
 */
export class StorageCache extends StorageCacheCommon implements Cache {
	storage: Storage;
	/**
	 * initialize the cache
	 * @param config - the configuration of the cache
	 */
	constructor(config?: CacheConfig) {
		const storage = getLocalStorageWithFallback();
		super({ config, keyValueStorage: new KeyValueStorage(storage) });

		this.storage = storage;
		this.getItem = this.getItem.bind(this);
		this.setItem = this.setItem.bind(this);
		this.removeItem = this.removeItem.bind(this);
	}

	protected async getAllCacheKeys(options?: { omitSizeKey?: boolean }) {
		const { omitSizeKey } = options ?? {};
		const keys: string[] = [];
		for (let i = 0; i < this.storage.length; i++) {
			const key = this.storage.key(i);
			if (omitSizeKey && key === getCurrentSizeKey(this.config.keyPrefix)) {
				continue;
			}
			if (key?.startsWith(this.config.keyPrefix)) {
				keys.push(key.substring(this.config.keyPrefix.length));
			}
		}

		return keys;
	}

	/**
	 * Return a new instance of cache with customized configuration.
	 * @param {Object} config - the customized configuration
	 * @return {Object} - the new instance of Cache
	 */
	public createInstance(config: CacheConfig): Cache {
		if (!config.keyPrefix || config.keyPrefix === defaultConfig.keyPrefix) {
			logger.error('invalid keyPrefix, setting keyPrefix with timeStamp');
			config.keyPrefix = getCurrentTime.toString();
		}

		return new StorageCache(config);
	}
}
