import { InMemoryStorage } from "../../src/StorageHelper";

const key = 'k'
const value = 'value'

describe('InMemoryStorage', () => {
	test('mechanism should set a value and retrieve it with the same key.', async () => {
		await InMemoryStorage.setItem(key, value);
		expect(await InMemoryStorage.getItem(key)).toEqual(value);
		await InMemoryStorage.removeItem(key);
		expect(await InMemoryStorage.getItem(key)).toBeFalsy();
		await InMemoryStorage.setItem(key, value);
	});

	test('clear operation should not return any values.', async () => {
		await InMemoryStorage.clear();
		expect(await InMemoryStorage.getItem(key)).toBeUndefined();
	});

	test('mechanism should override current value stored under the same key.', async () => {
		const secondValue = 'secondValue';
		await InMemoryStorage.setItem(key, value);
		await InMemoryStorage.setItem(key, secondValue);
		expect(await InMemoryStorage.getItem(key)).toEqual(secondValue);
	});

	test('mechanism should not throw if trying to delete a non existing key', async () => {
		const key = 'nonExistingKey';

		await InMemoryStorage.removeItem(key);
	});
});
