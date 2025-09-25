// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { ConsoleLogger } from '@aws-amplify/core';
import { PersistentModel } from '@aws-amplify/datastore';

import { DB_NAME } from '../common/constants';
import { CommonSQLiteDatabase, ParameterizedStatement } from '../common/types';

const logger = new ConsoleLogger('ExpoSQLiteDatabase');

/*

Note:
This adapter requires expo-sqlite 13.0+ with the modern async API.
The legacy WebSQL-style API is not supported to ensure performance
and future compatibility as WebSQL has been deprecated.

We use require() for optional dependencies to avoid TypeScript
compilation issues when the package is not installed.

*/

interface SQLiteDatabase {
	execAsync(statement: string): Promise<void>;
	getFirstAsync(statement: string, params: (string | number)[]): Promise<any>;
	getAllAsync(statement: string, params: (string | number)[]): Promise<any[]>;
	runAsync(statement: string, params: (string | number)[]): Promise<void>;
	withTransactionAsync<T>(callback: () => Promise<T>): Promise<T>;
	closeAsync(): Promise<void>;
}

class ExpoSQLiteDatabase implements CommonSQLiteDatabase {
	private db: SQLiteDatabase | undefined;

	public async init(): Promise<void> {
		if (!this.db) {
			try {
				const SQLite = require('expo-sqlite');

				if (!SQLite.openDatabaseAsync) {
					throw new Error(
						'ExpoSQLiteAdapter requires expo-sqlite 13.0+ with async API. ' +
							'Please upgrade expo-sqlite or use the regular SQLiteAdapter instead.',
					);
				}

				logger.debug('Initializing expo-sqlite with async API');
				this.db = (await SQLite.openDatabaseAsync(DB_NAME)) as SQLiteDatabase;

				// Apply SQLite performance optimizations
				// These settings improve write performance and reduce database locking:
				// - WAL mode: allows concurrent reads during writes
				// - NORMAL synchronous: good balance of safety vs performance
				// - 64MB cache: reasonable cache size for mobile devices
				// - Memory temp storage: faster temporary operations
				// - 256MB mmap: memory-mapped I/O for better performance
				try {
					await this.db.execAsync(`
						PRAGMA journal_mode = WAL;
						PRAGMA synchronous = NORMAL;
						PRAGMA cache_size = -64000;
						PRAGMA temp_store = MEMORY;
						PRAGMA mmap_size = 268435456;
					`);
				} catch (pragmaError) {
					// Performance optimizations are not critical for functionality
					logger.debug(
						'Failed to apply performance optimizations',
						pragmaError,
					);
				}
			} catch (error) {
				logger.error('Failed to initialize ExpoSQLiteDatabase', error);
				throw error;
			}
		}
	}

	public createSchema(statements: string[]): Promise<void> {
		return this.executeStatements(statements);
	}

	public async clear(): Promise<void> {
		try {
			logger.debug('Clearing database');
			await this.closeDB();

			// Delete database file using expo-file-system
			// expo-sqlite doesn't provide a deleteDatabase method like react-native-sqlite-storage
			const FileSystem = require('expo-file-system');
			let deleteAsync;

			// Try to use the modern deleteAsync from expo-file-system/legacy first
			// Fall back to main FileSystem.deleteAsync for older versions
			try {
				({ deleteAsync } = require('expo-file-system/legacy'));
			} catch {
				({ deleteAsync } = FileSystem);
			}

			await deleteAsync(`${FileSystem.documentDirectory}SQLite/${DB_NAME}`);
			logger.debug('Database cleared');
		} catch (error) {
			logger.warn('Error clearing the database.', error);

			if (!this.db) {
				await this.init();
			}

			throw error;
		}
	}

	public async get<T extends PersistentModel>(
		statement: string,
		params: (string | number)[],
	): Promise<T | undefined> {
		if (!this.db) {
			throw new Error('Database not initialized');
		}

		const result = await this.db.getFirstAsync(statement, params);

		return result as T | undefined;
	}

	public async getAll<T extends PersistentModel>(
		statement: string,
		params: (string | number)[],
	): Promise<T[]> {
		if (!this.db) {
			throw new Error('Database not initialized');
		}

		return this.db.getAllAsync(statement, params);
	}

	public async save(
		statement: string,
		params: (string | number)[],
	): Promise<void> {
		if (!this.db) {
			throw new Error('Database not initialized');
		}

		await this.db.runAsync(statement, params);
	}

	public async batchQuery<T = any>(
		queryParameterizedStatements = new Set<ParameterizedStatement>(),
	): Promise<T[]> {
		if (!this.db) {
			throw new Error('Database not initialized');
		}

		const results: T[] = [];
		await this.db.withTransactionAsync(async () => {
			for (const [statement, params] of queryParameterizedStatements) {
				const result = await this.db!.getAllAsync(statement, params);
				if (result && result.length > 0) {
					results.push(result[0]);
				}
			}
		});

		return results;
	}

	public async batchSave(
		saveParameterizedStatements = new Set<ParameterizedStatement>(),
		deleteParameterizedStatements?: Set<ParameterizedStatement>,
	): Promise<void> {
		if (!this.db) {
			throw new Error('Database not initialized');
		}

		await this.db.withTransactionAsync(async () => {
			for (const [statement, params] of saveParameterizedStatements) {
				await this.db!.runAsync(statement, params);
			}
			if (deleteParameterizedStatements) {
				for (const [statement, params] of deleteParameterizedStatements) {
					await this.db!.runAsync(statement, params);
				}
			}
		});
	}

	public async selectAndDelete<T = any>(
		queryParameterizedStatement: ParameterizedStatement,
		deleteParameterizedStatement: ParameterizedStatement,
	): Promise<T[]> {
		if (!this.db) {
			throw new Error('Database not initialized');
		}

		const [queryStatement, queryParams] = queryParameterizedStatement;
		const [deleteStatement, deleteParams] = deleteParameterizedStatement;

		let results: T[] = [];
		await this.db.withTransactionAsync(async () => {
			results = await this.db!.getAllAsync(queryStatement, queryParams);
			await this.db!.runAsync(deleteStatement, deleteParams);
		});

		return results;
	}

	private async executeStatements(statements: string[]): Promise<void> {
		if (!this.db) {
			throw new Error('Database not initialized');
		}

		await this.db.withTransactionAsync(async () => {
			for (const statement of statements) {
				await this.db!.execAsync(statement);
			}
		});
	}

	private async closeDB(): Promise<void> {
		if (this.db) {
			logger.debug('Closing Database');
			await this.db.closeAsync();
			logger.debug('Database closed');
			this.db = undefined;
		}
	}
}

export default ExpoSQLiteDatabase;
