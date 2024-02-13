// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { loadAsyncStorage } from '@aws-amplify/react-native';

import { ConsoleLogger } from '../Logger';

import { defaultConfig } from './constants';
import { StorageCacheCommon } from './StorageCacheCommon';
import { Cache, CacheConfig } from './types';
import { getCurrentSizeKey, getCurrentTime } from './utils';

const logger = new ConsoleLogger('StorageCache');
const AsyncStorage = loadAsyncStorage();

/*
 * Customized cache which based on the AsyncStorage with LRU implemented
 */
export class StorageCache extends StorageCacheCommon implements Cache {
	/**
	 * initialize the cache
	 * @param config - the configuration of the cache
	 */
	constructor(config?: CacheConfig) {
		super({ config, keyValueStorage: AsyncStorage });

		this.getItem = this.getItem.bind(this);
		this.setItem = this.setItem.bind(this);
		this.removeItem = this.removeItem.bind(this);
	}

	protected async getAllCacheKeys(options?: { omitSizeKey?: boolean }) {
		const { omitSizeKey } = options ?? {};
		const keys: string[] = [];
		for (const key of await AsyncStorage.getAllKeys()) {
			if (omitSizeKey && key === getCurrentSizeKey(this.config.keyPrefix)) {
				continue;
			}
			if (key?.startsWith(this.config.keyPrefix)) {
				keys.push(key.substring(this.config.keyPrefix.length));
			}
		}

		return keys;
	}

	protected async getAllStorageKeys() {
		try {
			return AsyncStorage.getAllKeys();
		} catch (e) {
			logger.warn(`getAllKeys failed! ${e}`);

			return [];
		}
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
