// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AWSCredentials } from '@aws-amplify/core/internals/utils';

import {
	StorageValidationErrorCode,
	validationErrorMap,
} from '../../../src/errors/types/validation';
import {
	StoreValue,
	createCacheKey,
	fetchNewValue,
	getCacheValue,
	initStore,
} from '../../../src/storage-browser/locationCredentialsStore/store';

describe('initStore', () => {
	it('should create a store with given capacity, refresh Handler and values', () => {
		const refreshHandler = jest.fn();
		const store = initStore(refreshHandler, 20);
		expect(store).toEqual({
			capacity: 20,
			refreshHandler,
			values: expect.any(Map),
		});
	});
	it('should create a store with default capacity if not provided', () => {
		const store = initStore(jest.fn());
		expect(store).toMatchObject({
			capacity: 10,
		});
	});
	it('should throw if capacity is not > 0', () => {
		expect(() => initStore(jest.fn(), 0)).toThrow(
			validationErrorMap[
				StorageValidationErrorCode.InvalidLocationCredentialsCacheSize
			].message,
		);
	});
});

describe('createCacheKey', () => {
	it('should return a cache key for given location and permission', () => {
		expect(createCacheKey({ scope: 'abc', permission: 'READ' })).toEqual({
			scope: 'abc',
			permission: 'READ',
			hash: 'abc_READ',
		});
	});
});

describe('getCacheValue', () => {
	it('should return a cache value for given location and permission', () => {
		const cachedValue: StoreValue = {
			credentials: 'MOCK_CREDS' as any as AWSCredentials,
			scope: 'abc',
			permission: 'READ',
		};
		const store = initStore(jest.fn());
		store.values.set('abc_READ', cachedValue);
		expect(
			getCacheValue(
				store,
				createCacheKey({
					scope: 'abc',
					permission: 'READ',
				}),
			),
		).toEqual(cachedValue.credentials);
	});

	it('should return null if cache value is not found', () => {
		expect(
			getCacheValue(
				initStore(jest.fn()),
				createCacheKey({
					scope: 'abc',
					permission: 'READ',
				}),
			),
		).toBeNull();
	});

	it('should return null if cache value is expired', () => {
		const expiredValue: StoreValue = {
			credentials: {
				expiration: new Date(),
			} as any as AWSCredentials,
			scope: 'abc',
			permission: 'READ',
		};
		const store = initStore(jest.fn());
		store.values.set('abc_READ', expiredValue);
		expect(
			getCacheValue(
				store,
				createCacheKey({
					scope: 'abc',
					permission: 'READ',
				}),
			),
		).toBeNull();
		expect(store.values.size).toBe(0);
	});

	it('should return null if cache value is expiring soon', () => {
		const expiringValue: StoreValue = {
			credentials: {
				expiration: new Date(Date.now() + 1000 * 20), // 20 seconds
			} as any as AWSCredentials,
			scope: 'abc',
			permission: 'READ',
		};
		const store = initStore(jest.fn());
		store.values.set('abc_READ', expiringValue);
		expect(
			getCacheValue(
				store,
				createCacheKey({
					scope: 'abc',
					permission: 'READ',
				}),
			),
		).toBeNull();
		expect(store.values.size).toBe(0);
	});
});

describe('fetchNewValue', () => {
	it('should fetch new value from remote source', async () => {
		expect.assertions(2);
		const mockCredentials = 'MOCK_CREDS';
		const refreshHandler = jest.fn().mockResolvedValue({
			credentials: mockCredentials,
		});
		const store = initStore(refreshHandler);
		const cacheKey = createCacheKey({ scope: 'abc', permission: 'READ' });
		const newCredentials = await fetchNewValue(store, cacheKey);
		expect(refreshHandler).toHaveBeenCalledWith({
			scope: 'abc',
			permission: 'READ',
		});
		expect(newCredentials).toEqual({
			credentials: mockCredentials,
		});
	});

	it('should throw errors when fetching new value', async () => {
		expect.assertions(2);
		const refreshHandler = jest
			.fn()
			.mockRejectedValue(new Error('Network error'));
		const store = initStore(refreshHandler);
		const cacheKey = createCacheKey({ scope: 'abc', permission: 'READ' });
		await expect(fetchNewValue(store, cacheKey)).rejects.toThrow(
			'Network error',
		);
		expect(store.values.size).toBe(0);
	});

	it('should update cache with new value', async () => {
		expect.assertions(1);
		const mockCredentials = 'MOCK_CREDS';
		const refreshHandler = jest.fn().mockResolvedValue({
			credentials: mockCredentials,
		});
		const store = initStore(refreshHandler);
		const cacheKey = createCacheKey({ scope: 'abc', permission: 'READ' });
		await fetchNewValue(store, cacheKey);
		expect(store.values.get(cacheKey.hash)).toEqual({
			credentials: mockCredentials,
			inflightCredentials: undefined,
			scope: 'abc',
			permission: 'READ',
		});
	});

	it('should invoke refresh handler only once if multiple fetches for same location is called', async () => {
		expect.assertions(1);
		const mockCredentials = 'MOCK_CREDS';
		const refreshHandler = jest.fn().mockResolvedValue({
			credentials: mockCredentials,
		});
		const store = initStore(refreshHandler);
		const cacheKey = createCacheKey({ scope: 'abc', permission: 'READ' });
		await Promise.all([
			fetchNewValue(store, cacheKey),
			fetchNewValue(store, cacheKey),
			fetchNewValue(store, cacheKey),
		]);
		expect(refreshHandler).toHaveBeenCalledTimes(1);
	});

	it('should invoke the refresh handler if the refresh handler previously fails', async () => {
		expect.assertions(4);
		const mockCredentials = 'MOCK_CREDS';
		const refreshHandler = jest
			.fn()
			.mockRejectedValueOnce(new Error('Network error'))
			.mockResolvedValueOnce({
				credentials: mockCredentials,
			});
		const store = initStore(refreshHandler);
		const cacheKey = createCacheKey({ scope: 'abc', permission: 'READ' });
		try {
			await fetchNewValue(store, cacheKey);
		} catch (e) {
			expect(e).toEqual(new Error('Network error'));
			expect(store.values.size).toBe(0);
		}
		const { credentials } = await fetchNewValue(store, cacheKey);
		expect(credentials).toEqual(mockCredentials);
		expect(store.values.size).toBe(1);
	});

	it('should call refresh handler for new cache entry if the cache is full', async () => {
		expect.assertions(4);
		const mockCredentials = 'MOCK_CREDS';
		const refreshHandler = jest.fn().mockResolvedValue({
			credentials: mockCredentials,
		});
		const store = initStore(refreshHandler, 1);
		const cacheKey1 = createCacheKey({
			scope: 'abc',
			permission: 'READ',
		});
		const cacheKey2 = createCacheKey({
			scope: 'def',
			permission: 'READ',
		});
		await fetchNewValue(store, cacheKey1);
		await fetchNewValue(store, cacheKey2);
		expect(refreshHandler).toHaveBeenCalledTimes(2);
		expect(store.values.size).toBe(1);
		expect(store.values.get(cacheKey2.hash)).toBeDefined();
		expect(store.values.get(cacheKey1.hash)).toBeUndefined();
	});
});
