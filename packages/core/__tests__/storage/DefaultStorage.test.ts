import { DefaultStorage } from '../../src/storage/DefaultStorage';

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
			get: () => {
				throw new Error('localStorage is not accessible');
			},
		});

		console.error = jest.fn(); // Mock console.error

		// Create a new DefaultStorage instance to trigger the fallback
		const fallbackStorage = new DefaultStorage();

		// Verify that the storage still works as expected
		await fallbackStorage.setItem(key, value);
		expect(await fallbackStorage.getItem(key)).toEqual(value);

		// Verify that the error was logged
		expect(console.error).toHaveBeenCalledWith(
			'LocalStorage access failed:',
			expect.any(Error),
		);

		// Restore the original localStorage
		Object.defineProperty(window, 'localStorage', {
			value: originalLocalStorage,
		});
	});
});
