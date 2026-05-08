// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { SyncKeyValueStorage } from '../../src/storage/SyncKeyValueStorage';

describe('SyncKeyValueStorage', () => {
	it('throws when accessing storage without initialization', () => {
		const storage = new SyncKeyValueStorage();
		expect(() => {
			storage.setItem('key', 'value');
		}).toThrow();
	});

	it('works with provided storage', () => {
		const mockStorage = {
			setItem: jest.fn(),
			getItem: jest.fn(() => 'value'),
			removeItem: jest.fn(),
			clear: jest.fn(),
		} as any;

		const storage = new SyncKeyValueStorage(mockStorage);
		storage.setItem('key', 'value');
		expect(mockStorage.setItem).toHaveBeenCalledWith('key', 'value');

		const value = storage.getItem('key');
		expect(value).toBe('value');

		storage.removeItem('key');
		expect(mockStorage.removeItem).toHaveBeenCalledWith('key');

		storage.clear();
		expect(mockStorage.clear).toHaveBeenCalled();
	});
});
