// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { SyncKeyValueStorage } from '../../src/storage/SyncKeyValueStorage';

describe('SyncKeyValueStorage', () => {
	describe('throwing without initialization', () => {
		it('throws when trying to set an item', () => {
			const storage = new SyncKeyValueStorage();
			expect(() => {
				storage.setItem('key', 'value');
			}).toThrow();
		});

		it('throws when trying to get an item', () => {
			const storage = new SyncKeyValueStorage();
			expect(() => {
				storage.getItem('key');
			}).toThrow();
		});

		it('throws when trying to remove an item', () => {
			const storage = new SyncKeyValueStorage();
			expect(() => {
				storage.removeItem('key');
			}).toThrow();
		});

		it('throws when trying to clear', () => {
			const storage = new SyncKeyValueStorage();
			expect(() => {
				storage.clear();
			}).toThrow();
		});
	});

	describe('initialized storage', () => {
		const store: Storage = {
			length: 0,
			key: () => null,
			setItem: (_k: string, _v: string) => undefined,
			getItem: (_k: string) => null,
			removeItem: (_k: string) => undefined,
			clear: () => undefined,
		};

		it('allows setting an item', () => {
			const setItem = jest.fn();
			const storage = new SyncKeyValueStorage({
				...store,
				setItem,
			});
			storage.setItem('key', 'value');
			expect(setItem).toHaveBeenCalledWith('key', 'value');
		});

		it('allows getting an item', () => {
			const getItem = jest.fn();
			const storage = new SyncKeyValueStorage({
				...store,
				getItem,
			});
			storage.getItem('key');
			expect(getItem).toHaveBeenCalledWith('key');
		});

		it('allows removing an item', () => {
			const removeItem = jest.fn();
			const storage = new SyncKeyValueStorage({
				...store,
				removeItem,
			});
			storage.removeItem('key');
			expect(removeItem).toHaveBeenCalledWith('key');
		});
		it('allows clearing the store', () => {
			const clear = jest.fn();
			const storage = new SyncKeyValueStorage({
				...store,
				clear,
			});
			storage.clear();
			expect(clear).toHaveBeenCalled();
		});
	});
});
