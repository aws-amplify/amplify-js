import { LocalStorage } from "../../src/StorageHelper";

const key = 'k'
const value = 'value'

describe('LocalStorage', () => {
	test('test read/write operations', async () => {
		await LocalStorage.setItem(key, value);
		expect(await LocalStorage.getItem(key)).toEqual(value);
		await LocalStorage.removeItem(key);
		expect(await LocalStorage.getItem(key)).toBeFalsy();
		await LocalStorage.setItem(key, value);
		await LocalStorage.clear();
		expect(await LocalStorage.getItem(key)).toBeFalsy();
	});
});
