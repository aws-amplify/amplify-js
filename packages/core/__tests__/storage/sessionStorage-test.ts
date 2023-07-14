import { SessionStorage } from '../../src/StorageHelper';

const key = 'k';
const value = 'value';

describe('SessionStorage', () => {
	test('mechanism should set a value and retrieve it with the same key.', async () => {
		await SessionStorage.setItem(key, value);
		expect(await SessionStorage.getItem(key)).toEqual(value);
		await SessionStorage.removeItem(key);
		expect(await SessionStorage.getItem(key)).toBeFalsy();
		await SessionStorage.setItem(key, value);
	});

	test('clear operation should not return any values.', async () => {
		await SessionStorage.clear();
		expect(await SessionStorage.getItem(key)).toBeNull();
	});

	test('mechanism should override current value stored under the same key.', async () => {
		const secondValue = 'secondValue';
		await SessionStorage.setItem(key, value);
		await SessionStorage.setItem(key, secondValue);
		expect(await SessionStorage.getItem(key)).toEqual(secondValue);
	});

	test('mechanism should not throw if trying to delete a non existing key', async () => {
		const key = 'nonExistingKey';

		await SessionStorage.removeItem(key);
	});
});
