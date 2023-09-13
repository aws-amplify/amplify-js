import { InMemoryStorage } from '../../src/storage/InMemoryStorage';

const key = 'k';
const value = 'value';

describe('InMemoryStorage', () => {
	let inMemoryStorage: InMemoryStorage;

	beforeEach(() => {
		inMemoryStorage = new InMemoryStorage();
	});

	it('should set a value and retrieve it with the same key', () => {
		inMemoryStorage.setItem(key, value);
		expect(inMemoryStorage.getItem(key)).toEqual(value);

		inMemoryStorage.removeItem(key);
		expect(inMemoryStorage.getItem(key)).toBeNull();
	});

	it('should overwrite current value stored under the same key', () => {
		const secondValue = 'secondValue';
		inMemoryStorage.setItem(key, value);
		inMemoryStorage.setItem(key, secondValue);
		expect(inMemoryStorage.getItem(key)).toEqual(secondValue);
	});

	it('should return the current storage length', () => {
		inMemoryStorage.setItem('1', value);
		inMemoryStorage.setItem('2', value);
		expect(inMemoryStorage.length).toEqual(2);
	});

	it('should return the key at the specified index', () => {
		inMemoryStorage.setItem('1', value);
		inMemoryStorage.setItem('2', value);
		expect(inMemoryStorage.key(1)).toEqual('2');
	});

	it('should not throw if trying to delete a non existing key', () => {
		const badKey = 'nonExistingKey';
		expect(() => {
			inMemoryStorage.removeItem(badKey);
		}).not.toThrow();
	});

	it('should clear out storage', () => {
		inMemoryStorage.setItem(key, value);
		expect(inMemoryStorage.getItem(key)).toEqual(value);

		inMemoryStorage.clear();
		expect(inMemoryStorage.getItem(key)).toBeNull();
	});
});
