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

	afterEach(() => {
		// Restore window/isBrowser spies so listener attach/detach assertions
		// are not polluted by calls from earlier tests in this file.
		jest.restoreAllMocks();
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

	it('should not attach a window listener in the constructor', () => {
		jest.spyOn(utils, 'isBrowser').mockImplementation(() => true);
		const windowSpy = jest.spyOn(window, 'addEventListener');

		defaultStorage = new DefaultStorage();
		expect(windowSpy).not.toHaveBeenCalledWith(
			'storage',
			expect.any(Function),
			false,
		);
	});

	it('should lazily attach the window listener on first addListener, when in browser', () => {
		jest.spyOn(utils, 'isBrowser').mockImplementation(() => true);
		const addSpy = jest.spyOn(window, 'addEventListener');

		defaultStorage = new DefaultStorage();
		const listener = jest.fn();
		defaultStorage.addListener(listener);

		expect(addSpy).toHaveBeenCalledWith('storage', expect.any(Function), false);
	});

	it('should attach the window listener only once across multiple listeners', () => {
		jest.spyOn(utils, 'isBrowser').mockImplementation(() => true);
		const addSpy = jest.spyOn(window, 'addEventListener');

		defaultStorage = new DefaultStorage();
		defaultStorage.addListener(jest.fn());
		defaultStorage.addListener(jest.fn());

		const storageAttachCalls = addSpy.mock.calls.filter(
			([eventName]) => eventName === 'storage',
		);
		expect(storageAttachCalls).toHaveLength(1);
	});

	it('should detach the window listener when the last listener unsubscribes', () => {
		jest.spyOn(utils, 'isBrowser').mockImplementation(() => true);
		const removeSpy = jest.spyOn(window, 'removeEventListener');

		defaultStorage = new DefaultStorage();
		const unsubscribeA = defaultStorage.addListener(jest.fn());
		const unsubscribeB = defaultStorage.addListener(jest.fn());

		unsubscribeA();
		expect(removeSpy).not.toHaveBeenCalledWith(
			'storage',
			expect.any(Function),
			false,
		);

		unsubscribeB();
		expect(removeSpy).toHaveBeenCalledWith(
			'storage',
			expect.any(Function),
			false,
		);
	});

	it('should invoke registered listeners on window storage events and stop after unsubscribe', () => {
		jest.spyOn(utils, 'isBrowser').mockImplementation(() => true);

		defaultStorage = new DefaultStorage();
		const listener = jest.fn();
		const unsubscribe = defaultStorage.addListener(listener);

		window.dispatchEvent(
			new StorageEvent('storage', {
				key: 'someKey',
				oldValue: 'old',
				newValue: 'new',
				storageArea: defaultStorage.storage,
			}),
		);

		expect(listener).toHaveBeenCalledWith({
			key: 'someKey',
			oldValue: 'old',
			newValue: 'new',
		});

		listener.mockClear();
		unsubscribe();

		window.dispatchEvent(
			new StorageEvent('storage', {
				key: 'someKey',
				oldValue: 'old',
				newValue: 'new',
				storageArea: defaultStorage.storage,
			}),
		);

		expect(listener).not.toHaveBeenCalled();
	});

	it('should ignore window storage events from a different storage area', () => {
		jest.spyOn(utils, 'isBrowser').mockImplementation(() => true);

		defaultStorage = new DefaultStorage();
		const listener = jest.fn();
		defaultStorage.addListener(listener);

		// Event originates from sessionStorage (a different area) — the
		// localStorage-backed instance must not react to it.
		window.dispatchEvent(
			new StorageEvent('storage', {
				key: 'someKey',
				oldValue: 'old',
				newValue: 'new',
				storageArea: window.sessionStorage,
			}),
		);

		expect(listener).not.toHaveBeenCalled();

		// A matching-area event is still delivered.
		window.dispatchEvent(
			new StorageEvent('storage', {
				key: 'someKey',
				oldValue: 'old',
				newValue: 'new',
				storageArea: defaultStorage.storage,
			}),
		);

		expect(listener).toHaveBeenCalledTimes(1);
	});

	it('should isolate a rejecting listener and still invoke the others', async () => {
		jest.spyOn(utils, 'isBrowser').mockImplementation(() => true);
		const unhandledRejection = jest.fn();
		process.on('unhandledRejection', unhandledRejection);

		defaultStorage = new DefaultStorage();
		const rejectingListener = jest
			.fn()
			.mockRejectedValue(new Error('listener boom'));
		const okListener = jest.fn().mockResolvedValue(undefined);
		defaultStorage.addListener(rejectingListener);
		defaultStorage.addListener(okListener);

		window.dispatchEvent(
			new StorageEvent('storage', {
				key: 'someKey',
				oldValue: 'old',
				newValue: 'new',
				storageArea: defaultStorage.storage,
			}),
		);

		// Both listeners were invoked despite the first rejecting.
		expect(rejectingListener).toHaveBeenCalledTimes(1);
		expect(okListener).toHaveBeenCalledTimes(1);

		// Allow the rejection to settle and assert it was swallowed.
		await new Promise(resolve => setTimeout(resolve, 0));
		expect(unhandledRejection).not.toHaveBeenCalled();

		process.removeListener('unhandledRejection', unhandledRejection);
	});

	it('should not attach a window listener when not in browser', () => {
		jest.spyOn(utils, 'isBrowser').mockImplementation(() => false);
		const addSpy = jest.spyOn(window, 'addEventListener');

		defaultStorage = new DefaultStorage();
		const unsubscribe = defaultStorage.addListener(jest.fn());

		expect(addSpy).not.toHaveBeenCalledWith(
			'storage',
			expect.any(Function),
			false,
		);
		// unsubscribe stays a safe no-op off-browser
		expect(() => {
			unsubscribe();
		}).not.toThrow();
	});
});
