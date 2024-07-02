// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

describe('initStore', () => {
	it.todo(
		'should create a store with given capacity, refresh Handler and cache',
	);
	it.todo('should create a store with default capacity if not provided');
	it.todo('should throw if capacity is not > 0');
});

describe('getCacheKey', () => {
	it.todo('should return a cache key for given location and permission');
});

describe('getCacheValue', () => {
	it.todo('should return a cache value for given location and permission');
	it.todo('should return null if cache value is not found');
	it.todo('should return null if cache value is expired');
	it.todo('should return null if cache value is not valid');
});
