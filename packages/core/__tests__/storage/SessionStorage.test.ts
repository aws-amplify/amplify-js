import { InMemoryStorage } from '../../src/storage/InMemoryStorage';
import { SessionStorage } from '../../src/storage/SessionStorage';
import * as utils from '../../src/utils';

const key = 'k';
const value = 'value';

describe('SessionStorage', () => {
	let sessionStorage: SessionStorage;

	beforeEach(() => {
		sessionStorage = new SessionStorage();
	});

	afterEach(() => {
		// Restore window/isBrowser spies so listener attach/detach assertions
		// are not polluted by calls from earlier tests in this file.
		jest.restoreAllMocks();
	});

	it('should set a value and retrieve it with the same key', async () => {
		await sessionStorage.setItem(key, value);
		expect(await sessionStorage.getItem(key)).toEqual(value);
		await sessionStorage.removeItem(key);
		expect(await sessionStorage.getItem(key)).toBeNull();
		await sessionStorage.setItem(key, value);
	});

	it('should overwrite current value stored under the same key', async () => {
		const secondValue = 'secondValue';
		await sessionStorage.setItem(key, value);
		await sessionStorage.setItem(key, secondValue);
		expect(await sessionStorage.getItem(key)).toEqual(secondValue);
	});

	it('should not throw if trying to delete a non existing key', async () => {
		const badKey = 'nonExistingKey';
		// eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
		await expect(() => {
			sessionStorage.removeItem(badKey);
		}).not.toThrow();
	});

	it('should clear out storage', async () => {
		await sessionStorage.clear();
		expect(await sessionStorage.getItem(key)).toBeNull();
	});

	it('should fall back to alternative storage when sessionStorage is not accessible', async () => {
		// Mock window.sessionStorage to throw an error
		const originalSessionStorage = window.sessionStorage;

		Object.defineProperty(window, 'sessionStorage', {
			value: undefined,
			writable: true,
		});

		// Create a new SessionStorage instance to trigger the fallback
		const fallbackStorage = new SessionStorage();

		// Verify that the storage still works as expected
		expect(fallbackStorage.storage instanceof InMemoryStorage).toEqual(true);

		// Restore the original sessionStorage
		Object.defineProperty(window, 'sessionStorage', {
			value: originalSessionStorage,
		});
	});

	it('should not attach a window listener in the constructor', () => {
		jest.spyOn(utils, 'isBrowser').mockImplementation(() => true);
		const windowSpy = jest.spyOn(window, 'addEventListener');

		sessionStorage = new SessionStorage();
		expect(windowSpy).not.toHaveBeenCalledWith(
			'storage',
			expect.any(Function),
			false,
		);
	});

	it('should lazily attach the window listener on first addListener, when in browser', () => {
		jest.spyOn(utils, 'isBrowser').mockImplementation(() => true);
		const addSpy = jest.spyOn(window, 'addEventListener');

		sessionStorage = new SessionStorage();
		sessionStorage.addListener(jest.fn());

		expect(addSpy).toHaveBeenCalledWith('storage', expect.any(Function), false);
	});

	it('should attach the window listener only once across multiple listeners', () => {
		jest.spyOn(utils, 'isBrowser').mockImplementation(() => true);
		const addSpy = jest.spyOn(window, 'addEventListener');

		sessionStorage = new SessionStorage();
		sessionStorage.addListener(jest.fn());
		sessionStorage.addListener(jest.fn());

		const storageAttachCalls = addSpy.mock.calls.filter(
			([eventName]) => eventName === 'storage',
		);
		expect(storageAttachCalls).toHaveLength(1);
	});

	it('should detach the window listener when the last listener unsubscribes', () => {
		jest.spyOn(utils, 'isBrowser').mockImplementation(() => true);
		const removeSpy = jest.spyOn(window, 'removeEventListener');

		sessionStorage = new SessionStorage();
		const unsubscribeA = sessionStorage.addListener(jest.fn());
		const unsubscribeB = sessionStorage.addListener(jest.fn());

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

	it('should not attach a window listener when not in browser', () => {
		jest.spyOn(utils, 'isBrowser').mockImplementation(() => false);
		const addSpy = jest.spyOn(window, 'addEventListener');

		sessionStorage = new SessionStorage();
		const unsubscribe = sessionStorage.addListener(jest.fn());

		expect(addSpy).not.toHaveBeenCalledWith(
			'storage',
			expect.any(Function),
			false,
		);
		expect(() => {
			unsubscribe();
		}).not.toThrow();
	});
});
