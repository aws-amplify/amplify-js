// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	StorageValidationErrorCode,
	validationErrorMap,
} from '../../../src/errors/types/validation';
import {
	fetchNewValue,
	getCacheValue,
	initStore,
} from '../../../src/storageBrowser/locationCredentialsStore/store';
import { CredentialsLocation } from '../../../src/storageBrowser/types';

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

describe('getCacheValue', () => {
	it('should return a cache value for given location and permission', () => {
		const cachedValue = {
			credentials: 'MOCK_CREDS',
			scope: 'abc',
			permission: 'READ',
		} as any;
		const store = initStore(jest.fn());
		store.values.set('abc_READ', cachedValue);
		expect(
			getCacheValue(store, {
				scope: 'abc',
				permission: 'READ',
			}),
		).toEqual(cachedValue.credentials);
	});

	it('should return null if cache value is not found', () => {
		expect(
			getCacheValue(initStore(jest.fn()), {
				scope: 'abc',
				permission: 'READ',
			}),
		).toBeNull();
	});

	it('should return null if cache value is expired', () => {
		const expiredValue = {
			credentials: {
				expiration: new Date(),
			},
			scope: 'abc',
			permission: 'READ',
		} as any;
		const store = initStore(jest.fn());
		store.values.set('abc_READ', expiredValue);
		expect(
			getCacheValue(store, {
				scope: 'abc',
				permission: 'READ',
			}),
		).toBeNull();
		expect(store.values.size).toBe(0);
	});

	it('should return null if cache value is expiring soon', () => {
		const expiringValue = {
			credentials: {
				expiration: new Date(Date.now() + 1000 * 20), // 20 seconds
			},
			scope: 'abc',
			permission: 'READ',
		} as any;
		const store = initStore(jest.fn());
		store.values.set('abc_READ', expiringValue);
		expect(
			getCacheValue(store, {
				scope: 'abc',
				permission: 'READ',
			}),
		).toBeNull();
		expect(store.values.size).toBe(0);
	});
});

describe('fetchNewValue', () => {
	const mockCacheLocation = {
		scope: 'abc',
		permission: 'READ',
	} as CredentialsLocation;
	const createCacheKey = (location: CredentialsLocation) =>
		`${location.scope}_${location.permission}` as const;

	it('should fetch new value from remote source', async () => {
		expect.assertions(2);
		const mockCredentials = 'MOCK_CREDS';
		const refreshHandler = jest.fn().mockResolvedValue({
			credentials: mockCredentials,
		});
		const store = initStore(refreshHandler);
		const newCredentials = await fetchNewValue(store, mockCacheLocation);
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
		await expect(fetchNewValue(store, mockCacheLocation)).rejects.toThrow(
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
		await fetchNewValue(store, mockCacheLocation);
		expect(store.values.get(createCacheKey(mockCacheLocation))).toEqual({
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
		await Promise.all([
			fetchNewValue(store, mockCacheLocation),
			fetchNewValue(store, mockCacheLocation),
			fetchNewValue(store, mockCacheLocation),
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
		try {
			await Promise.all([
				fetchNewValue(store, mockCacheLocation),
				fetchNewValue(store, mockCacheLocation),
				fetchNewValue(store, mockCacheLocation),
			]);
		} catch (e) {
			expect(e).toEqual(new Error('Network error'));
			expect(store.values.size).toBe(0);
		}
		const { credentials } = await fetchNewValue(store, mockCacheLocation);
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
		const cacheLocation1 = {
			scope: 'abc',
			permission: 'READ' as const,
		};
		const cacheLocation2 = {
			scope: 'def',
			permission: 'READ' as const,
		};
		await fetchNewValue(store, cacheLocation1);
		await fetchNewValue(store, cacheLocation2);
		expect(refreshHandler).toHaveBeenCalledTimes(2);
		expect(store.values.size).toBe(1);
		expect(store.values.get(createCacheKey(cacheLocation2))).toBeDefined();
		expect(store.values.get(createCacheKey(cacheLocation1))).toBeUndefined();
	});
});
