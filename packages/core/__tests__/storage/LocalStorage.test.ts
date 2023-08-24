import { LocalStorage } from '../../src/storage/LocalStorage';

const key = 'k';
const value = 'value';

describe('LocalStorage', () => {
	let localStorage: LocalStorage;

	beforeEach(() => {
		localStorage = new LocalStorage();
	});

	it('should set a value and retrieve it with the same key', async () => {
		await localStorage.setItem(key, value);
		expect(await localStorage.getItem(key)).toEqual(value);
		await localStorage.removeItem(key);
		expect(await localStorage.getItem(key)).toBeNull();
		await localStorage.setItem(key, value);
	});

	it('should overwrite current value stored under the same key', async () => {
		const secondValue = 'secondValue';
		await localStorage.setItem(key, value);
		await localStorage.setItem(key, secondValue);
		expect(await localStorage.getItem(key)).toEqual(secondValue);
	});

	it('should not throw if trying to delete a non existing key', async () => {
		const badKey = 'nonExistingKey';
		await expect(() => {
			localStorage.removeItem(badKey);
		}).not.toThrow();
	});

	it('should clear out storage', async () => {
		await localStorage.clear();
		expect(await localStorage.getItem(key)).toBeNull();
	});
});
