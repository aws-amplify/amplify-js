import { DefaultStorage } from '../../src/storage/DefaultStorage';

const key = 'k';
const value = 'value';

describe('DefaultStorage', () => {
	let defaultStorage: DefaultStorage;

	beforeEach(() => {
		defaultStorage = new DefaultStorage();
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
});
