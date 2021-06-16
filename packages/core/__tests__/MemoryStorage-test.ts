import StorageHelperDefault, {
	MemoryStorage,
	StorageHelper,
} from '../src/StorageHelper';

describe('StorageHelper', () => {
	test('MemoryStorage', () => {
		MemoryStorage.setItem('k', 'v');
		expect(MemoryStorage.getItem('k')).toEqual('v');
		MemoryStorage.removeItem('k');
		expect(MemoryStorage.getItem('k')).toBeFalsy();
		MemoryStorage.setItem('k', 'v');
		MemoryStorage.clear();
		expect(MemoryStorage.getItem('k')).toBeFalsy();
	});

	test('StorageHelper', () => {
		const helperA = new StorageHelperDefault().getStorage();
		expect(helperA instanceof Storage).toBeTruthy();
		const helperB = new StorageHelper().getStorage();
		expect(helperB instanceof Storage).toBeTruthy();
	});
});
