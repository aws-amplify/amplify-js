// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
	public createInstance(config: CacheConfig): ICache {
		return new InMemoryCacheClass(config);
	}
}

export const InMemoryCache: ICache = new InMemoryCacheClass();
