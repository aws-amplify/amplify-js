import { InMemoryStorage } from "../../src/StorageHelper";

const key = 'k'
const value = 'value'

describe('InMemoryStorage', () => {
	test('test read/write operations', async () => {
		await InMemoryStorage.setItem(key, value);
		expect(await InMemoryStorage.getItem(key)).toEqual(value);
		await InMemoryStorage.removeItem(key);
		expect(await InMemoryStorage.getItem(key)).toBeFalsy();
		await InMemoryStorage.setItem(key, value);
		await InMemoryStorage.clear();
		expect(await InMemoryStorage.getItem(key)).toBeFalsy();
	});
});
