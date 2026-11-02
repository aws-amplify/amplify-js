// Mock expo-sqlite before importing the module under test
const mockDb = {
	execAsync: jest.fn().mockResolvedValue(undefined),
	getFirstAsync: jest.fn().mockResolvedValue(undefined),
	getAllAsync: jest.fn().mockResolvedValue([]),
	runAsync: jest.fn().mockResolvedValue(undefined),
	withTransactionAsync: jest.fn(async (cb: () => Promise<void>) => cb()),
	closeAsync: jest.fn().mockResolvedValue(undefined),
};

const mockOpenDatabaseAsync = jest.fn().mockResolvedValue(mockDb);
const mockDeleteDatabaseAsync = jest.fn().mockResolvedValue(undefined);

jest.mock('expo-sqlite', () => ({
	openDatabaseAsync: mockOpenDatabaseAsync,
	deleteDatabaseAsync: mockDeleteDatabaseAsync,
}));

import ExpoSQLiteDatabase from '../src/ExpoSQLiteAdapter/ExpoSQLiteDatabase';

describe('ExpoSQLiteDatabase', () => {
	let db: ExpoSQLiteDatabase;

	beforeEach(() => {
		jest.clearAllMocks();
		// Restore the default mock (in case a test overrode it)
		mockOpenDatabaseAsync.mockResolvedValue(mockDb);
		db = new ExpoSQLiteDatabase();
	});

	describe('init', () => {
		it('opens database via openDatabaseAsync', async () => {
			await db.init();
			expect(mockOpenDatabaseAsync).toHaveBeenCalledWith('AmplifyDatastore');
		});

		it('applies WAL pragma after opening', async () => {
			await db.init();
			expect(mockDb.execAsync).toHaveBeenCalledWith(
				'PRAGMA journal_mode = WAL;',
			);
		});

		it('still opens when the WAL pragma fails', async () => {
			mockDb.execAsync.mockRejectedValueOnce(new Error('pragma failed'));
			await expect(db.init()).resolves.toBeUndefined();
			await expect(db.get('SELECT 1', [])).resolves.toBeUndefined();
		});

		it('rethrows when openDatabaseAsync fails', async () => {
			mockOpenDatabaseAsync.mockRejectedValueOnce(new Error('open failed'));
			await expect(db.init()).rejects.toThrow('open failed');
		});

		it('only opens once on repeated init calls', async () => {
			await db.init();
			await db.init();
			expect(mockOpenDatabaseAsync).toHaveBeenCalledTimes(1);
		});

		it('throws when expo-sqlite lacks async API', async () => {
			// Temporarily remove openDatabaseAsync to simulate old expo-sqlite
			const original = mockOpenDatabaseAsync;
			const SQLite = require('expo-sqlite');
			delete SQLite.openDatabaseAsync;

			const freshDb = new ExpoSQLiteDatabase();
			await expect(freshDb.init()).rejects.toThrow('expo-sqlite 14.0+');

			// Restore for other tests
			SQLite.openDatabaseAsync = original;
		});
	});

	describe('operations before init', () => {
		it('get throws if not initialized', async () => {
			await expect(db.get('SELECT 1', [])).rejects.toThrow(
				'Database not initialized',
			);
		});

		it('getAll throws if not initialized', async () => {
			await expect(db.getAll('SELECT 1', [])).rejects.toThrow(
				'Database not initialized',
			);
		});

		it('save throws if not initialized', async () => {
			await expect(db.save('INSERT', [])).rejects.toThrow(
				'Database not initialized',
			);
		});

		it('batchQuery throws if not initialized', async () => {
			await expect(db.batchQuery()).rejects.toThrow('Database not initialized');
		});

		it('batchSave throws if not initialized', async () => {
			await expect(db.batchSave()).rejects.toThrow('Database not initialized');
		});

		it('selectAndDelete throws if not initialized', async () => {
			await expect(
				db.selectAndDelete(['SELECT 1', []], ['DELETE', []]),
			).rejects.toThrow('Database not initialized');
		});

		it('createSchema throws if not initialized', async () => {
			await expect(
				db.createSchema(['CREATE TABLE t (id TEXT)']),
			).rejects.toThrow('Database not initialized');
		});
	});

	describe('get', () => {
		beforeEach(async () => db.init());

		it('delegates to getFirstAsync', async () => {
			const row = { id: '1', field1: 'value' };
			mockDb.getFirstAsync.mockResolvedValueOnce(row);
			const result = await db.get('SELECT * FROM Model WHERE id = ?', ['1']);
			expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
				'SELECT * FROM Model WHERE id = ?',
				['1'],
			);
			expect(result).toEqual(row);
		});

		it('returns undefined when no row found', async () => {
			mockDb.getFirstAsync.mockResolvedValueOnce(undefined);
			const result = await db.get('SELECT * FROM Model WHERE id = ?', [
				'missing',
			]);
			expect(result).toBeUndefined();
		});
	});

	describe('getAll', () => {
		beforeEach(async () => db.init());

		it('delegates to getAllAsync', async () => {
			const rows = [
				{ id: '1', field1: 'a' },
				{ id: '2', field1: 'b' },
			];
			mockDb.getAllAsync.mockResolvedValueOnce(rows);
			const result = await db.getAll('SELECT * FROM Model', []);
			expect(result).toEqual(rows);
		});
	});

	describe('save', () => {
		beforeEach(async () => db.init());

		it('delegates to runAsync', async () => {
			await db.save('INSERT INTO Model (id) VALUES (?)', ['1']);
			expect(mockDb.runAsync).toHaveBeenCalledWith(
				'INSERT INTO Model (id) VALUES (?)',
				['1'],
			);
		});
	});

	describe('batchSave', () => {
		beforeEach(async () => db.init());

		it('executes all statements in a transaction', async () => {
			const saves = new Set<[string, (string | number)[]]>([
				['INSERT INTO Model (id) VALUES (?)', ['1']],
				['INSERT INTO Model (id) VALUES (?)', ['2']],
			]);
			await db.batchSave(saves);
			expect(mockDb.withTransactionAsync).toHaveBeenCalledTimes(1);
			expect(mockDb.runAsync).toHaveBeenCalledTimes(2);
		});

		it('executes deletes after saves', async () => {
			const saves = new Set<[string, (string | number)[]]>([
				['INSERT INTO Model (id) VALUES (?)', ['1']],
			]);
			const deletes = new Set<[string, (string | number)[]]>([
				['DELETE FROM Model WHERE id = ?', ['old']],
			]);
			await db.batchSave(saves, deletes);
			expect(mockDb.runAsync).toHaveBeenCalledTimes(2);
		});
	});

	describe('batchQuery', () => {
		beforeEach(async () => db.init());

		it('returns first row from each query', async () => {
			mockDb.getAllAsync
				.mockResolvedValueOnce([{ id: '1', field1: 'a' }])
				.mockResolvedValueOnce([{ id: '2', field1: 'b' }]);
			const queries = new Set<[string, (string | number)[]]>([
				['SELECT * FROM Model WHERE id = ?', ['1']],
				['SELECT * FROM Model WHERE id = ?', ['2']],
			]);
			const results = await db.batchQuery(queries);
			expect(results).toEqual([
				{ id: '1', field1: 'a' },
				{ id: '2', field1: 'b' },
			]);
		});

		it('skips empty results', async () => {
			mockDb.getAllAsync
				.mockResolvedValueOnce([])
				.mockResolvedValueOnce([{ id: '2' }]);
			const queries = new Set<[string, (string | number)[]]>([
				['SELECT * FROM Model WHERE id = ?', ['missing']],
				['SELECT * FROM Model WHERE id = ?', ['2']],
			]);
			const results = await db.batchQuery(queries);
			expect(results).toEqual([{ id: '2' }]);
		});
	});

	describe('selectAndDelete', () => {
		beforeEach(async () => db.init());

		it('queries then deletes in a transaction', async () => {
			const rows = [{ id: '1' }];
			mockDb.getAllAsync.mockResolvedValueOnce(rows);
			const result = await db.selectAndDelete(
				['SELECT * FROM Model WHERE id = ?', ['1']],
				['DELETE FROM Model WHERE id = ?', ['1']],
			);
			expect(result).toEqual(rows);
			expect(mockDb.withTransactionAsync).toHaveBeenCalled();
			expect(mockDb.runAsync).toHaveBeenCalledWith(
				'DELETE FROM Model WHERE id = ?',
				['1'],
			);
		});
	});

	describe('createSchema', () => {
		beforeEach(async () => db.init());

		it('executes all statements in a transaction', async () => {
			await db.createSchema([
				'CREATE TABLE Model (id TEXT PRIMARY KEY)',
				'CREATE TABLE Other (id TEXT PRIMARY KEY)',
			]);
			expect(mockDb.withTransactionAsync).toHaveBeenCalled();
			expect(mockDb.execAsync).toHaveBeenCalledWith(
				'CREATE TABLE Model (id TEXT PRIMARY KEY)',
			);
			expect(mockDb.execAsync).toHaveBeenCalledWith(
				'CREATE TABLE Other (id TEXT PRIMARY KEY)',
			);
		});
	});

	describe('clear', () => {
		beforeEach(async () => db.init());

		it('closes the database, then deletes it with deleteDatabaseAsync', async () => {
			await db.clear();
			expect(mockDb.closeAsync).toHaveBeenCalledTimes(1);
			expect(mockDeleteDatabaseAsync).toHaveBeenCalledWith('AmplifyDatastore');
			expect(mockDb.closeAsync.mock.invocationCallOrder[0]).toBeLessThan(
				mockDeleteDatabaseAsync.mock.invocationCallOrder[0],
			);
			await expect(db.get('SELECT 1', [])).rejects.toThrow(
				'Database not initialized',
			);
		});

		it('reopens the database and rethrows when the delete fails', async () => {
			mockDeleteDatabaseAsync.mockRejectedValueOnce(new Error('delete failed'));
			await expect(db.clear()).rejects.toThrow('delete failed');
			expect(mockOpenDatabaseAsync).toHaveBeenCalledTimes(2);
			await expect(db.get('SELECT 1', [])).resolves.toBeUndefined();
		});
	});
});
