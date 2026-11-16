describe('package root', () => {
	beforeEach(() => {
		jest.resetModules();
		jest.doMock('react-native-sqlite-storage', () => {
			throw new Error('react-native-sqlite-storage is not installed');
		});
	});

	afterEach(() => {
		jest.dontMock('react-native-sqlite-storage');
	});

	it('loads without react-native-sqlite-storage', () => {
		const root = require('../src');
		expect(root.ExpoSQLiteAdapter).toBeDefined();
		expect(root.SQLiteAdapter).toBeDefined();
	});

	it('reports a missing react-native-sqlite-storage when SQLiteAdapter is used', async () => {
		const SQLiteDatabase = require('../src/SQLiteAdapter/SQLiteDatabase').default;
		await expect(new SQLiteDatabase().init()).rejects.toThrow(
			'SQLiteAdapter requires react-native-sqlite-storage',
		);
	});
});
