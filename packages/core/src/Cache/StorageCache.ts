// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getCurrTime, getByteLength, defaultConfig } from './Utils';
import { Amplify } from '../singleton';
import { CacheConfig, CacheItem, CacheItemOptions } from './types';
import { ConsoleLogger as Logger } from '../Logger';

const logger = new Logger('StorageCache');

/**
 * Initialization of the cache
 *
 */
export class StorageCache {
	// Contains any fields that have been customized for this Cache instance (i.e. without default values)
	private instanceConfig?: CacheConfig;

	/**
	 * Initialize the cache
	 *
	 * @param config - Custom configuration for this instance.
	 */
	constructor(config?: CacheConfig) {
		if (config) {
			// A configuration was specified for this specific instance
			this.instanceConfig = config;
		}

		this.sanitizeConfig();
	}

	public getModuleName() {
		return 'Cache';
	}

	private sanitizeConfig(): void {
		const tempInstanceConfig = this.instanceConfig || ({} as CacheConfig);

		if (this.cacheConfig.itemMaxSize > this.cacheConfig.capacityInBytes) {
			logger.error(
				'Invalid parameter: itemMaxSize. It should be smaller than capacityInBytes. Setting back to default.'
			);
			tempInstanceConfig.itemMaxSize = defaultConfig.itemMaxSize;
		}

		if (
			this.cacheConfig.defaultPriority > 5 ||
			this.cacheConfig.defaultPriority < 1
		) {
			logger.error(
				'Invalid parameter: defaultPriority. It should be between 1 and 5. Setting back to default.'
			);
			tempInstanceConfig.defaultPriority = defaultConfig.defaultPriority;
		}

		if (
			Number(this.cacheConfig.warningThreshold) > 1 ||
			Number(this.cacheConfig.warningThreshold) < 0
		) {
			logger.error(
				'Invalid parameter: warningThreshold. It should be between 0 and 1. Setting back to default.'
			);
			tempInstanceConfig.warningThreshold = defaultConfig.warningThreshold;
		}

		// Set 5MB limit
		const cacheLimit: number = 5 * 1024 * 1024;
		if (this.cacheConfig.capacityInBytes > cacheLimit) {
			logger.error(
				'Cache Capacity should be less than 5MB. Setting back to default. Setting back to default.'
			);
			tempInstanceConfig.capacityInBytes = defaultConfig.capacityInBytes;
		}

		// Apply sanitized values to the instance config
		if (Object.keys(tempInstanceConfig).length > 0) {
			this.instanceConfig = tempInstanceConfig;
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
		options: CacheItemOptions
	): CacheItem {
		const ret: CacheItem = {
			key,
			data: value,
			timestamp: getCurrTime(),
			visitedTime: getCurrTime(),
			priority: options.priority ?? 0,
			expires: options.expires ?? 0,
			type: typeof value,
			byteSize: 0,
		};

		ret.byteSize = getByteLength(JSON.stringify(ret));

		// for accurate size
		ret.byteSize = getByteLength(JSON.stringify(ret));
		return ret;
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
					'keyPrefix can not be re-configured on an existing Cache instance.'
				);
			}

			this.instanceConfig = this.instanceConfig
				? Object.assign({}, this.instanceConfig, config)
				: (config as CacheConfig);
		}

		this.sanitizeConfig();

		return this.cacheConfig;
	}

	/**
	 * Returns an appropriate configuration for the Cache instance. Will apply any custom configuration for this
	 * instance on top of the global configuration. Default configuration will be applied in all cases.
	 *
	 * @internal
	 */
	protected get cacheConfig(): CacheConfig {
		// const globalCacheConfig = Amplify.getConfig().Cache || {};
		const globalCacheConfig = {};

		if (this.instanceConfig) {
			return Object.assign(
				{},
				defaultConfig,
				globalCacheConfig,
				this.instanceConfig
			);
		} else {
			return Object.assign({}, defaultConfig, globalCacheConfig);
		}
	}
}
