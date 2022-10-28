// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
	defaultPriority?: number;

	storage?: Storage;

	Cache?: Cache;
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
	callback?: Function;
}
