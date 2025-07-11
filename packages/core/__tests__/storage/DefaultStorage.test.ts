import { DefaultStorage } from '../../src/storage/DefaultStorage';
import { InMemoryStorage } from '../../src/storage/InMemoryStorage';
import * as utils from '../../src/utils';

const key = 'k';
const value = 'value';

describe('DefaultStorage', () => {
	let defaultStorage: DefaultStorage;

	beforeEach(() => {
		defaultStorage = new DefaultStorage();
	});

	it('should set a value and retrieve it with the same key', async () => {
		await defaultStorage.setItem(key, value);
		expect(await defaultStorage.getItem(key)).toEqual(value);
		await defaultStorage.removeItem(key);
		expect(await defaultStorage.getItem(key)).toBeNull();
		await defaultStorage.setItem(key, value);
	});

	it('should overwrite current value stored under the same key', async () => {
		const secondValue = 'secondValue';
		await defaultStorage.setItem(key, value);
		await defaultStorage.setItem(key, secondValue);
		expect(await defaultStorage.getItem(key)).toEqual(secondValue);
	});

	it('should not throw if trying to delete a non existing key', () => {
		const badKey = 'nonExistingKey';

		expect(defaultStorage.removeItem(badKey)).resolves.toBeUndefined();
	});

	it('should clear out storage', async () => {
		await defaultStorage.clear();
		expect(defaultStorage.getItem(key)).resolves.toBeNull();
	});

	it('should fall back to alternative storage when localStorage is not accessible', async () => {
		// Mock window.localStorage to throw an error
		const originalLocalStorage = window.localStorage;

		Object.defineProperty(window, 'localStorage', {
			value: undefined,
			writable: true,
		});

		// Create a new DefaultStorage instance to trigger the fallback
		const fallbackStorage = new DefaultStorage();

		// Verify that the storage still works as expected
		expect(fallbackStorage.storage instanceof InMemoryStorage).toEqual(true);

		// Restore the original localStorage
		Object.defineProperty(window, 'localStorage', {
			value: originalLocalStorage,
		});
	});

	it('should setup listeners, when in browser', () => {
		jest.spyOn(utils, 'isBrowser').mockImplementation(() => true);
		const windowSpy = jest.spyOn(window, 'addEventListener');

		defaultStorage = new DefaultStorage();
		expect(windowSpy).toHaveBeenCalledWith(
			'storage',
			expect.any(Function),
			false,
		);
	});
});
