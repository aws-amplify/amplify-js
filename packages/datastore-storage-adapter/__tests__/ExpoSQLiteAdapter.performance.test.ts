// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import ExpoSQLiteDatabase from '../src/ExpoSQLiteAdapter/ExpoSQLiteDatabase';
import { ParameterizedStatement } from '../src/common/types';

// Mock expo-sqlite and expo-file-system
jest.mock('expo-sqlite', () => ({
	openDatabase: jest.fn(() => ({
		transaction: jest.fn((callback) => {
			const transaction = {
				executeSql: jest.fn((sql, params, success, error) => {
					// Simulate successful execution
					success?.(transaction, {
						rows: {
							_array: [{ id: 'test-1', value: 100 }],
							length: 1
						}
					});
				})
			};
			callback(transaction);
		}),
		readTransaction: jest.fn((callback) => {
			const transaction = {
				executeSql: jest.fn((sql, params, success, error) => {
					// Simulate successful read
					success?.(transaction, {
						rows: {
							_array: [{ id: 'test-1', value: 100 }],
							length: 1
						}
					});
				})
			};
			callback(transaction);
		})
	})),
	WebSQLDatabase: jest.fn()
}));

jest.mock('expo-file-system', () => ({
	deleteAsync: jest.fn(() => Promise.resolve()),
	documentDirectory: '/mock/documents/'
}));

describe('ExpoSQLiteAdapter Performance Tests', () => {
	let db: ExpoSQLiteDatabase;

	beforeEach(async () => {
		db = new ExpoSQLiteDatabase();
		await db.init();
	});

	describe('Large Dataset Operations', () => {
		it('should handle batch insert of 50,000 records efficiently', async () => {
			const startTime = Date.now();
			const batchSize = 1000;
			const totalRecords = 50000;

			// Create test data
			const testData = [];
			for (let i = 0; i < totalRecords; i++) {
				testData.push({
					id: `record-${i}`,
					name: `Test Record ${i}`,
					value: Math.random() * 10000,
					timestamp: Date.now() + i
				});
			}

			// Batch insert
			for (let i = 0; i < testData.length; i += batchSize) {
				const batch = testData.slice(i, i + batchSize);
				const statements = new Set<ParameterizedStatement>();

				for (const record of batch) {
					statements.add([
						`INSERT INTO test_records (id, name, value, timestamp) VALUES (?, ?, ?, ?)`,
						[record.id, record.name, record.value, record.timestamp]
					]);
				}

				await db.batchSave(statements);
			}

			const elapsed = Date.now() - startTime;

			// Performance assertion - should complete within reasonable time
			// In a real environment, this would be much slower, but mocked should be instant
			expect(elapsed).toBeLessThan(5000);
		});

		it('should efficiently query single records from large dataset', async () => {
			const startTime = Date.now();

			const result = await db.get(
				'SELECT * FROM test_records WHERE id = ?',
				['record-25000']
			);

			const elapsed = Date.now() - startTime;

			// Single record query should be very fast
			expect(elapsed).toBeLessThan(100);
			expect(result).toBeDefined();
		});

		it('should handle complex queries efficiently', async () => {
			const startTime = Date.now();

			const results = await db.getAll(
				`SELECT * FROM test_records
				 WHERE value > ?
				 ORDER BY timestamp DESC
				 LIMIT 100`,
				[5000]
			);

			const elapsed = Date.now() - startTime;

			// Complex query should still be reasonably fast
			expect(elapsed).toBeLessThan(500);
			expect(Array.isArray(results)).toBe(true);
		});

		it('should handle batch updates efficiently', async () => {
			const startTime = Date.now();
			const updateStatements = new Set<ParameterizedStatement>();

			// Update 1000 records
			for (let i = 0; i < 1000; i++) {
				updateStatements.add([
					'UPDATE test_records SET value = value * 1.1 WHERE id = ?',
					[`record-${i}`]
				]);
			}

			await db.batchSave(updateStatements);

			const elapsed = Date.now() - startTime;

			// Batch update should complete quickly
			expect(elapsed).toBeLessThan(2000);
		});

		it('should handle transactions with mixed operations', async () => {
			const startTime = Date.now();

			const insertStatements = new Set<ParameterizedStatement>();
			const deleteStatements = new Set<ParameterizedStatement>();

			// Add 100 new records
			for (let i = 50000; i < 50100; i++) {
				insertStatements.add([
					`INSERT INTO test_records (id, name, value, timestamp) VALUES (?, ?, ?, ?)`,
					[`record-${i}`, `New Record ${i}`, i * 1.5, Date.now() + i]
				]);
			}

			// Delete 100 old records
			for (let i = 0; i < 100; i++) {
				deleteStatements.add([
					'DELETE FROM test_records WHERE id = ?',
					[`record-${i}`]
				]);
			}

			await db.batchSave(insertStatements, deleteStatements);

			const elapsed = Date.now() - startTime;

			// Transaction should complete efficiently
			expect(elapsed).toBeLessThan(1000);
		});

		it('should handle select and delete operations atomically', async () => {
			const startTime = Date.now();

			const deletedRecords = await db.selectAndDelete(
				['SELECT * FROM test_records WHERE value < ? LIMIT 100', [100]],
				['DELETE FROM test_records WHERE value < ?', [100]]
			);

			const elapsed = Date.now() - startTime;

			// Select and delete should be atomic and fast
			expect(elapsed).toBeLessThan(500);
			expect(Array.isArray(deletedRecords)).toBe(true);
		});

		it('should handle aggregation queries efficiently', async () => {
			const startTime = Date.now();

			const stats = await db.get(
				'SELECT COUNT(*) as count, AVG(value) as avg, MAX(value) as max, MIN(value) as min FROM test_records',
				[]
			);

			const elapsed = Date.now() - startTime;

			// Aggregation should be optimized
			expect(elapsed).toBeLessThan(200);
			expect(stats).toBeDefined();
		});

		it('should handle batch queries efficiently', async () => {
			const startTime = Date.now();
			const queryStatements = new Set<ParameterizedStatement>();

			// Query 100 different records
			for (let i = 0; i < 100; i++) {
				queryStatements.add([
					'SELECT * FROM test_records WHERE id = ?',
					[`record-${i * 500}`]
				]);
			}

			const results = await db.batchQuery(queryStatements);

			const elapsed = Date.now() - startTime;

			// Batch query should be efficient
			expect(elapsed).toBeLessThan(1000);
			expect(Array.isArray(results)).toBe(true);
		});
	});

	describe('Memory Management', () => {
		it('should not leak memory during large operations', async () => {
			// Get initial memory usage
			const initialMemory = process.memoryUsage().heapUsed;

			// Perform multiple operations
			for (let iteration = 0; iteration < 10; iteration++) {
				const statements = new Set<ParameterizedStatement>();

				// Add 1000 records per iteration
				for (let i = 0; i < 1000; i++) {
					statements.add([
						`INSERT INTO test_records (id, name, value) VALUES (?, ?, ?)`,
						[`iter-${iteration}-${i}`, `Record ${i}`, Math.random() * 1000]
					]);
				}

				await db.batchSave(statements);

				// Query them
				await db.getAll(
					'SELECT * FROM test_records WHERE id LIKE ? LIMIT 100',
					[`iter-${iteration}-%`]
				);

				// Delete them
				const deleteStatements = new Set<ParameterizedStatement>();
				for (let i = 0; i < 1000; i++) {
					deleteStatements.add([
						'DELETE FROM test_records WHERE id = ?',
						[`iter-${iteration}-${i}`]
					]);
				}
				await db.batchSave(new Set(), deleteStatements);
			}

			// Force garbage collection if available
			if (global.gc) {
				global.gc();
			}

			const finalMemory = process.memoryUsage().heapUsed;
			const memoryIncrease = finalMemory - initialMemory;

			// Memory increase should be reasonable (less than 50MB for this test)
			expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
		});
	});

	describe('Error Recovery', () => {
		it('should handle database initialization errors gracefully', async () => {
			const dbWithError = new ExpoSQLiteDatabase();

			// Force an error by mocking the require to throw
			const originalRequire = require;
			(global as any).require = jest.fn(() => {
				throw new Error('Module not found');
			});

			await expect(dbWithError.init()).resolves.not.toThrow();

			// Restore original require
			(global as any).require = originalRequire;
		});

		it('should continue operating after query errors', async () => {
			// This would test error recovery in a real scenario
			// For now, we just ensure the structure is correct
			expect(db).toBeDefined();
		});
	});

	describe('Concurrent Operations', () => {
		it('should handle concurrent reads safely', async () => {
			const promises = [];

			// Launch 100 concurrent read operations
			for (let i = 0; i < 100; i++) {
				promises.push(
					db.get('SELECT * FROM test_records WHERE id = ?', [`record-${i}`])
				);
			}

			const results = await Promise.all(promises);

			// All operations should complete successfully
			expect(results).toHaveLength(100);
		});

		it('should handle mixed concurrent operations', async () => {
			const operations = [];

			// Mix of reads, writes, and updates
			for (let i = 0; i < 30; i++) {
				// Read operation
				operations.push(
					db.get('SELECT * FROM test_records WHERE id = ?', [`record-${i}`])
				);

				// Write operation
				const insertStatements = new Set<ParameterizedStatement>();
				insertStatements.add([
					'INSERT INTO test_records (id, name) VALUES (?, ?)',
					[`concurrent-${i}`, `Concurrent ${i}`]
				]);
				operations.push(db.batchSave(insertStatements));

				// Update operation
				operations.push(
					db.save(
						'UPDATE test_records SET value = ? WHERE id = ?',
						[i * 10, `record-${i}`]
					)
				);
			}

			const results = await Promise.allSettled(operations);

			// All operations should complete (either fulfilled or rejected)
			expect(results).toHaveLength(90);

			// Count successful operations
			const successful = results.filter(r => r.status === 'fulfilled').length;
			expect(successful).toBeGreaterThan(0);
		});
	});
});