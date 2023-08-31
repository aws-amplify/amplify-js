import { MemoryKeyValueStorage } from "../../src/StorageHelper";

const key = 'k'
const value = 'value'

describe('MemoryKeyValueStorage', () => {
	test('mechanism should set a value and retrieve it with the same key.', async () => {
		await MemoryKeyValueStorage.setItem(key, value);
		expect(await MemoryKeyValueStorage.getItem(key)).toEqual(value);
		await MemoryKeyValueStorage.removeItem(key);
		expect(await MemoryKeyValueStorage.getItem(key)).toBeFalsy();
		await MemoryKeyValueStorage.setItem(key, value);
	});

	test('clear operation should not return any values.', async () => {
		await MemoryKeyValueStorage.clear();
		expect(await MemoryKeyValueStorage.getItem(key)).toBeUndefined();
	});

	test('mechanism should override current value stored under the same key.', async () => {
		const secondValue = 'secondValue';
		await MemoryKeyValueStorage.setItem(key, value);
		await MemoryKeyValueStorage.setItem(key, secondValue);
		expect(await MemoryKeyValueStorage.getItem(key)).toEqual(secondValue);
	});

	test('mechanism should not throw if trying to delete a non existing key', async () => {
		const key = 'nonExistingKey';

		await MemoryKeyValueStorage.removeItem(key);
	});
});
