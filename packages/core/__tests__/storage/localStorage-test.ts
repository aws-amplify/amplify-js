import { LocalStorage } from '../../src/StorageHelper';

const key = 'k';
const value = 'value';

describe('LocalStorage', () => {
	test('mechanism should set a value and retrieve it with the same key.', async () => {
		await LocalStorage.setItem(key, value);
		expect(await LocalStorage.getItem(key)).toEqual(value);
		await LocalStorage.removeItem(key);
		expect(await LocalStorage.getItem(key)).toBeFalsy();
		await LocalStorage.setItem(key, value);
	});

	test('clear operation should not return any values.', async () => {
		await LocalStorage.clear();
		expect(await LocalStorage.getItem(key)).toBeNull();
	});

	test('mechanism should override current value stored under the same key.', async () => {
		const secondValue = 'secondValue';
		await LocalStorage.setItem(key, value);
		await LocalStorage.setItem(key, secondValue);
		expect(await LocalStorage.getItem(key)).toEqual(secondValue);
	});

	test('mechanism should not throw if trying to delete a non existing key', async () => {
		const key = 'nonExistingKey';

		await LocalStorage.removeItem(key);
	});
});
