// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
	public createInstance(config: CacheConfig): ICache {
		if (!config.keyPrefix || config.keyPrefix === defaultConfig.keyPrefix) {
			logger.error('invalid keyPrefix, setting keyPrefix with timeStamp');
			config.keyPrefix = getCurrTime.toString();
		}

		return new BrowserStorageCacheClass(config);
	}
}

export const BrowserStorageCache: ICache = new BrowserStorageCacheClass();
