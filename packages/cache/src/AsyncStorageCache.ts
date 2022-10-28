// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
	createInstance(config): ICache {
		if (config.keyPrefix === defaultConfig.keyPrefix) {
			logger.error('invalid keyPrefix, setting keyPrefix with timeStamp');
			config.keyPrefix = getCurrTime.toString();
		}
		return new AsyncStorageCache(config);
	}
}

const instance: ICache = new AsyncStorageCache();
export { AsyncStorage, instance as Cache };
export default instance;
