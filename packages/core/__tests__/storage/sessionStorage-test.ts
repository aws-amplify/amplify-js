import { SessionStorage } from '../../src/StorageHelper';

const key = 'k';
const value = 'value';
const sessionStorageMock = (function () {
	let store = {};

	return {
		getItem(key) {
			return store[key];
		},

		setItem(key, value) {
			store[key] = value;
		},

		clear() {
			store = {};
		},

		removeItem(key) {
			delete store[key];
		},

		getAll() {
			return store;
		},
	};
})();

Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

describe('SessionStorage', () => {
	test('test read/write operations', async () => {
		await SessionStorage.setItem(key, value);
		expect(await SessionStorage.getItem(key)).toEqual(value);
		await SessionStorage.removeItem(key);
		expect(await SessionStorage.getItem(key)).toBeFalsy();
		await SessionStorage.setItem(key, value);
		await SessionStorage.clear();
		expect(await SessionStorage.getItem(key)).toBeFalsy();
	});
});
