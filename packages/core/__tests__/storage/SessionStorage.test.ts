import { SessionStorage } from '../../src/storage/SessionStorage';

const key = 'k';
const value = 'value';

describe('sessionStorage', () => {
	let sessionStorage: SessionStorage;

	beforeEach(() => {
		sessionStorage = new SessionStorage();
	});

	it('should set a value and retrieve it with the same key', async () => {
		await sessionStorage.setItem(key, value);
		expect(await sessionStorage.getItem(key)).toEqual(value);
		await sessionStorage.removeItem(key);
		expect(await sessionStorage.getItem(key)).toBeNull();
		await sessionStorage.setItem(key, value);
	});

	it('should overwrite current value stored under the same key', async () => {
		const secondValue = 'secondValue';
		await sessionStorage.setItem(key, value);
		await sessionStorage.setItem(key, secondValue);
		expect(await sessionStorage.getItem(key)).toEqual(secondValue);
	});

	it('should not throw if trying to delete a non existing key', async () => {
		const badKey = 'nonExistingKey';
		await expect(() => {
			sessionStorage.removeItem(badKey);
		}).not.toThrow();
	});

	it('should clear out storage', async () => {
		await sessionStorage.clear();
		expect(await sessionStorage.getItem(key)).toBeNull();
	});
});
