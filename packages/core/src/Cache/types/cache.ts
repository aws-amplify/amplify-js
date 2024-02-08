// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CacheConfig } from '../../singleton/Cache/types';

export { CacheConfig };

/**
 * Cache Interface
 */
export interface Cache {
	/** Put item into cache */
	setItem(key: string, value: any, options?: CacheItemOptions): Promise<void>;

	/** Get item from cache */
	getItem(key: string, options?: CacheItemOptions): Promise<CacheItem['data']>;

	/** Remove item from cache */
	removeItem(key: string): Promise<void>;

	/** Remove all items from cache */
	clear(): Promise<void>;

	/** Get all keys form cache */
	getAllKeys(): Promise<string[]>;

	/** Get current size of the cache */
	getCurrentCacheSize(): Promise<number>;

	/** create a new instance with customized config */
	createInstance(config: CacheConfig): Cache;

	/** change current configuration */
	configure(config: CacheConfig): CacheConfig;
}

export interface CacheItem {
	key: string;
	data: any;
	timestamp: number;
	visitedTime: number;
	priority: number;
	expires: number;
	type: string;
	byteSize: number;
}

export interface CacheItemOptions {
	priority?: number;
	expires?: number;
	callback?(): unknown;
}
