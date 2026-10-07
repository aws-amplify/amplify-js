// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { loadAsyncStorage } from '@aws-amplify/react-native';

import { LazyAsyncStorage } from '../../src/storage/LazyAsyncStorage';

jest.mock('@aws-amplify/react-native', () => ({
	loadAsyncStorage: jest.fn(),
}));

const mockLoadAsyncStorage = loadAsyncStorage as jest.Mock;
const mockAsyncStorage = {
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn(),
	getAllKeys: jest.fn(),
	multiRemove: jest.fn(),
};
const notLinkedError = new Error(
	'Ensure `@react-native-async-storage/async-storage` is installed and linked.',
);

describe('LazyAsyncStorage', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockLoadAsyncStorage.mockReturnValue(mockAsyncStorage);
	});

	it('does not load AsyncStorage on construction', () => {
		expect(() => new LazyAsyncStorage()).not.toThrow();
		expect(mockLoadAsyncStorage).not.toHaveBeenCalled();
	});

	it('loads AsyncStorage once on first use and delegates', async () => {
		const storage = new LazyAsyncStorage();
		mockAsyncStorage.getItem.mockResolvedValue('value');
		mockAsyncStorage.getAllKeys.mockResolvedValue(['key']);

		expect(await storage.getItem('key')).toBe('value');
		await storage.setItem('key', 'value');
		await storage.removeItem('key');
		await storage.clear();
		expect(await storage.getAllKeys()).toEqual(['key']);
		await storage.multiRemove(['key']);

		expect(mockLoadAsyncStorage).toHaveBeenCalledTimes(1);
		expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('key', 'value');
		expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('key');
		expect(mockAsyncStorage.clear).toHaveBeenCalled();
		expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith(['key']);
	});

	it('rejects instead of throwing when AsyncStorage is not linked, and retries on the next call', async () => {
		const storage = new LazyAsyncStorage();
		mockLoadAsyncStorage.mockImplementation(() => {
			throw notLinkedError;
		});

		const result = storage.getItem('key');

		await expect(result).rejects.toBe(notLinkedError);
		await expect(storage.getAllKeys()).rejects.toBe(notLinkedError);
		expect(mockLoadAsyncStorage).toHaveBeenCalledTimes(2);
	});

	it('lets the default storage and Cache be imported without AsyncStorage linked', () => {
		mockLoadAsyncStorage.mockImplementation(() => {
			throw notLinkedError;
		});

		jest.isolateModules(() => {
			const {
				DefaultStorage,
			} = require('../../src/storage/DefaultStorage.native');
			const { StorageCache } = require('../../src/Cache/StorageCache.native');

			expect(() => new DefaultStorage()).not.toThrow();
			expect(() => new StorageCache()).not.toThrow();
		});

		expect(mockLoadAsyncStorage).not.toHaveBeenCalled();
	});
});
