// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AWSCredentials } from '@aws-amplify/core/internals/utils';

import {
	StorageValidationErrorCode,
	validationErrorMap,
} from '../../../src/errors/types/validation';
import {
	createStore,
	getValue,
	removeStore,
} from '../../../src/storageBrowser/locationCredentialsStore/registry';
import {
	LruLocationCredentialsStore,
	fetchNewValue,
	getCacheValue,
	initStore,
} from '../../../src/storageBrowser/locationCredentialsStore/store';

jest.mock('../../../src/storageBrowser/locationCredentialsStore/store');

const mockedStore = 'MOCKED_STORE' as any as LruLocationCredentialsStore;

afterEach(() => {
	jest.clearAllMocks();
});

beforeEach(() => {
	jest.mocked(initStore).mockReturnValue(mockedStore);
});

describe('createStore', () => {
	it('should create a store with given capacity, refresh Handler', () => {
		const refreshHandler = jest.fn();
		createStore(refreshHandler, 20);
		expect(initStore).toHaveBeenCalledWith(refreshHandler, 20);
	});

	it('should return a symbol to refer the store instance', () => {
		const storeReference = createStore(jest.fn(), 20);
		expect(Object.prototype.toString.call(storeReference)).toBe(
			'[object Symbol]',
		);
	});
});

describe('getValue', () => {
	const mockCachedValue = 'CACHED_VALUE' as any as AWSCredentials;
	let storeReference: symbol;
	beforeEach(() => {
		storeReference = createStore(jest.fn(), 20);
	});
	afterEach(() => {
		removeStore(storeReference);
		jest.clearAllMocks();
	});

	it('should throw if a store instance cannot be found from registry', async () => {
		expect.assertions(1);
		await expect(
			getValue({
				storeSymbol: Symbol('invalid'),
				location: { scope: 'abc', permission: 'READ' },
				forceRefresh: false,
			}),
		).rejects.toThrow(
			validationErrorMap[
				StorageValidationErrorCode.LocationCredentialsStoreDestroyed
			].message,
		);
	});

	it('should look up a cache value for given location and permission', async () => {
		expect.assertions(2);
		jest.mocked(getCacheValue).mockReturnValueOnce(mockCachedValue);
		expect(
			await getValue({
				storeSymbol: storeReference,
				location: { scope: 'abc', permission: 'READ' },
				forceRefresh: false,
			}),
		).toEqual({ credentials: mockCachedValue });
		expect(getCacheValue).toHaveBeenCalledWith(mockedStore, {
			scope: 'abc',
			permission: 'READ',
		});
	});

	it('should look up a cache value for given location and READWRITE permission', async () => {
		expect.assertions(4);

		jest.mocked(getCacheValue).mockReturnValueOnce(null);
		jest.mocked(getCacheValue).mockReturnValueOnce(mockCachedValue);
		expect(
			await getValue({
				storeSymbol: storeReference,
				location: { scope: 'abc', permission: 'READ' },
				forceRefresh: false,
			}),
		).toEqual({ credentials: mockCachedValue });
		expect(getCacheValue).toHaveBeenCalledTimes(2);
		expect(getCacheValue).toHaveBeenNthCalledWith(1, mockedStore, {
			scope: 'abc',
			permission: 'READ',
		});
		expect(getCacheValue).toHaveBeenNthCalledWith(2, mockedStore, {
			scope: 'abc',
			permission: 'READWRITE',
		});
	});

	it('should invoke the refresh handler if look up returns null', async () => {
		expect.assertions(3);
		jest.mocked(getCacheValue).mockReturnValue(null);
		jest.mocked(fetchNewValue).mockResolvedValue('NEW_VALUE' as any);
		expect(
			await getValue({
				storeSymbol: storeReference,
				location: { scope: 'abc', permission: 'READ' },
				forceRefresh: false,
			}),
		).toEqual('NEW_VALUE');
		expect(fetchNewValue).toHaveBeenCalledTimes(1);
		expect(fetchNewValue).toHaveBeenCalledWith(mockedStore, {
			scope: 'abc',
			permission: 'READ',
		});
	});

	it('should invoke the refresh handler regardless of cache if forceRefresh is true', async () => {
		expect.assertions(3);
		jest.mocked(getCacheValue).mockReturnValue(mockCachedValue);
		jest.mocked(fetchNewValue).mockResolvedValue('NEW_VALUE' as any);
		expect(
			await getValue({
				storeSymbol: storeReference,
				location: { scope: 'abc', permission: 'READ' },
				forceRefresh: true,
			}),
		).toEqual('NEW_VALUE');
		expect(fetchNewValue).toHaveBeenCalledTimes(1);
		expect(fetchNewValue).toHaveBeenCalledWith(mockedStore, {
			scope: 'abc',
			permission: 'READ',
		});
	});

	it('should throw if refresh handler throws', async () => {
		expect.assertions(1);
		jest
			.mocked(fetchNewValue)
			.mockRejectedValueOnce(new Error('Network error'));
		await expect(
			getValue({
				storeSymbol: storeReference,
				location: { scope: 'abc', permission: 'READ' },
				forceRefresh: true,
			}),
		).rejects.toThrow('Network error');
	});
});

describe('removeStore', () => {
	it('should remove the store with given symbol', async () => {
		expect.assertions(1);
		const storeReference = createStore(jest.fn(), 20);
		removeStore(storeReference);
		await expect(
			getValue({
				storeSymbol: storeReference,
				location: { scope: 'abc', permission: 'READ' },
				forceRefresh: false,
			}),
		).rejects.toThrow(
			validationErrorMap[
				StorageValidationErrorCode.LocationCredentialsStoreDestroyed
			].message,
		);
	});

	it('should not throw if store with given symbol does not exist', () => {
		expect(() => {
			removeStore(Symbol('invalid'));
		}).not.toThrow();
	});
});
