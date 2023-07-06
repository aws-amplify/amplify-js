import { SessionStorage } from '../../src/StorageHelper';

const key = 'k';
const value = 'value';

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
