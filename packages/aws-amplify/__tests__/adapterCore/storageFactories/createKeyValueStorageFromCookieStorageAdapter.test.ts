// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createKeyValueStorageFromCookieStorageAdapter } from '../../../src/adapter-core';
import { defaultSetCookieOptions } from '../../../src/adapter-core/storageFactories/createKeyValueStorageFromCookieStorageAdapter';

const mockCookiesStorageAdapter = {
	getAll: jest.fn(),
	get: jest.fn(),
	set: jest.fn(),
	delete: jest.fn(),
};

describe('keyValueStorage', () => {
	describe('createKeyValueStorageFromCookiesStorageAdapter', () => {
		it('should return a key value storage', () => {
			const keyValueStorage = createKeyValueStorageFromCookieStorageAdapter(
				mockCookiesStorageAdapter,
			);

			expect(keyValueStorage).toBeDefined();
		});

		describe('the returned key value storage', () => {
			const keyValueStorage = createKeyValueStorageFromCookieStorageAdapter(
				mockCookiesStorageAdapter,
			);

			it('should set item', async () => {
				const testKey = 'testKey';
				const testValue = 'testValue';
				keyValueStorage.setItem(testKey, testValue);
				expect(mockCookiesStorageAdapter.set).toHaveBeenCalledWith(
					testKey,
					testValue,
					{
						...defaultSetCookieOptions,
						expires: expect.any(Date),
					},
				);
			});

			it('should set item with options', async () => {
				const testKey = 'testKey';
				const testValue = 'testValue';
				keyValueStorage.setItem(testKey, testValue);
				expect(mockCookiesStorageAdapter.set).toHaveBeenCalledWith(
					testKey,
					testValue,
					{
						...defaultSetCookieOptions,
						expires: expect.any(Date),
					},
				);
			});

			it('should get item', async () => {
				const testKey = 'testKey';
				const testValue = 'testValue';
				mockCookiesStorageAdapter.get.mockReturnValueOnce({
					name: testKey,
					value: testValue,
				});
				const value = await keyValueStorage.getItem(testKey);
				expect(value).toBe(testValue);
			});

			it('should get null if item not found', async () => {
				const testKey = 'nonExisting';
				const value = await keyValueStorage.getItem(testKey);
				expect(value).toBeNull();
			});

			it('should remove item', async () => {
				const testKey = 'testKey';
				keyValueStorage.removeItem(testKey);
				expect(mockCookiesStorageAdapter.delete).toHaveBeenCalledWith(testKey);
			});

			it('should clear', async () => {
				// TODO(HuiSF): update the test once the implementation is updated.
				expect(() => {
					keyValueStorage.clear();
				}).toThrow('This method has not implemented.');
			});
		});

		describe('in conjunction with token validator', () => {
			const testKey = 'testKey';
			const testValue = 'testValue';

			beforeEach(() => {
				mockCookiesStorageAdapter.get.mockReturnValueOnce({
					name: testKey,
					value: testValue,
				});
			});
			afterEach(() => {
				jest.clearAllMocks();
			});

			it('should return item successfully if validation passes when getting item', async () => {
				const getItemValidator = jest.fn().mockImplementation(() => true);
				const keyValueStorage = createKeyValueStorageFromCookieStorageAdapter(
					mockCookiesStorageAdapter,
					{ getItem: getItemValidator },
				);

				const value = await keyValueStorage.getItem(testKey);
				expect(value).toBe(testValue);
				expect(getItemValidator).toHaveBeenCalledTimes(1);
			});

			it('should return null if validation fails when getting item', async () => {
				const getItemValidator = jest.fn().mockImplementation(() => false);
				const keyValueStorage = createKeyValueStorageFromCookieStorageAdapter(
					mockCookiesStorageAdapter,
					{ getItem: getItemValidator },
				);

				const value = await keyValueStorage.getItem(testKey);
				expect(value).toBe(null);
				expect(getItemValidator).toHaveBeenCalledTimes(1);
			});
		});
	});
});
