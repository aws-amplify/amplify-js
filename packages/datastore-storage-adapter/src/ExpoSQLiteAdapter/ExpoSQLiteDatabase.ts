// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { ConsoleLogger } from '@aws-amplify/core';
import { PersistentModel } from '@aws-amplify/datastore';
import { deleteAsync, documentDirectory } from 'expo-file-system';
import { WebSQLDatabase, openDatabase } from 'expo-sqlite';

import { DB_NAME } from '../common/constants';
import { CommonSQLiteDatabase, ParameterizedStatement } from '../common/types';

const logger = new ConsoleLogger('ExpoSQLiteDatabase');

/**
 * Modern expo-sqlite API interface (expo-sqlite 13.0+)
 *
 * Provides async/await methods that don't block the JS thread,
 * unlike the legacy WebSQL-style API which can cause UI freezes.
 */
interface ModernSQLiteDatabase {
	execAsync(statement: string): Promise<void>;
	getFirstAsync(statement: string, params: (string | number)[]): Promise<any>;
	getAllAsync(statement: string, params: (string | number)[]): Promise<any[]>;
	runAsync(statement: string, params: (string | number)[]): Promise<void>;
	withTransactionAsync<T>(callback: () => Promise<T>): Promise<T>;
	closeAsync(): Promise<void>;
}

class ExpoSQLiteDatabase implements CommonSQLiteDatabase {
	private db: WebSQLDatabase | ModernSQLiteDatabase | undefined;
	private isModernAPI = false;

	public async init(): Promise<void> {
		// only open database once.
		if (!this.db) {
			try {
				// Attempt to use modern async API (expo-sqlite 13.0+)
				const SQLite = require('expo-sqlite');
				if (SQLite.openDatabaseAsync) {
					logger.debug('Using modern expo-sqlite async API');
					this.db = (await SQLite.openDatabaseAsync(
						DB_NAME,
					)) as ModernSQLiteDatabase;
					this.isModernAPI = true;

					// Apply SQLite performance optimizations
					// These settings improve write performance and reduce database locking
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
				} else {
					// Fall back to WebSQL-style API for older expo-sqlite versions
					logger.debug(
						'Using legacy WebSQL API - consider upgrading expo-sqlite to 13.0+',
					);
					this.db = openDatabase(DB_NAME) as WebSQLDatabase;
					this.isModernAPI = false;
				}
			} catch (error) {
				// Fall back to WebSQL API if modern API initialization fails
				logger.debug('Falling back to WebSQL API', error);
				this.db = openDatabase(DB_NAME) as WebSQLDatabase;
				this.isModernAPI = false;
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
			// expo-sqlite doesn't provide a deleteDatabase method
			await deleteAsync(`${documentDirectory}SQLite/${DB_NAME}`);
			logger.debug('Database cleared');
		} catch (error) {
			logger.warn('Error clearing the database.', error);
			// Re-open database if it was closed but deletion failed
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

		if (this.isModernAPI) {
			const result = await (this.db as ModernSQLiteDatabase).getFirstAsync(
				statement,
				params,
			);

			return result as T | undefined;
		} else {
			const results: T[] = await this.getAll(statement, params);

			return results[0];
		}
	}

	public getAll<T extends PersistentModel>(
		statement: string,
		params: (string | number)[],
	): Promise<T[]> {
		if (!this.db) {
			throw new Error('Database not initialized');
		}

		if (this.isModernAPI) {
			return (this.db as ModernSQLiteDatabase).getAllAsync(statement, params);
		} else {
			// WebSQL fallback
			return new Promise((resolve, reject) => {
				(this.db as WebSQLDatabase).readTransaction(transaction => {
					transaction.executeSql(
						statement,
						params,
						(_, result) => {
							resolve(result.rows._array || []);
						},
						(_, error) => {
							reject(error);
							logger.warn(error);

							return true;
						},
					);
				});
			});
		}
	}

	public save(statement: string, params: (string | number)[]): Promise<void> {
		if (!this.db) {
			throw new Error('Database not initialized');
		}

		if (this.isModernAPI) {
			return (this.db as ModernSQLiteDatabase).runAsync(statement, params);
		} else {
			// WebSQL fallback
			return new Promise((resolve, reject) => {
				(this.db as WebSQLDatabase).transaction(transaction => {
					transaction.executeSql(
						statement,
						params,
						() => {
							resolve();
						},
						(_, error) => {
							reject(error);
							logger.warn(error);

							return true;
						},
					);
				});
			});
		}
	}

	public async batchQuery<T = any>(
		queryParameterizedStatements = new Set<ParameterizedStatement>(),
	): Promise<T[]> {
		if (!this.db) {
			throw new Error('Database not initialized');
		}

		if (this.isModernAPI) {
			const results: T[] = [];
			const modernDb = this.db as ModernSQLiteDatabase;
			await modernDb.withTransactionAsync(async () => {
				for (const [statement, params] of queryParameterizedStatements) {
					const result = await modernDb.getAllAsync(statement, params);
					if (result && result.length > 0) {
						results.push(result[0]);
					}
				}
			});

			return results;
		} else {
			// WebSQL fallback
			return new Promise((resolve, reject) => {
				const resolveTransaction = resolve;
				const rejectTransaction = reject;
				(this.db as WebSQLDatabase).transaction(async transaction => {
					try {
						const results: any[] = await Promise.all(
							[...queryParameterizedStatements].map(
								([statement, params]) =>
									new Promise((_resolve, _reject) => {
										transaction.executeSql(
											statement,
											params,
											(_, result) => {
												_resolve(result.rows._array[0]);
											},
											(_, error) => {
												_reject(error);
												logger.warn(error);

												return true;
											},
										);
									}),
							),
						);
						resolveTransaction(results);
					} catch (error) {
						rejectTransaction(error);
						logger.warn(error);
					}
				});
			});
		}
	}

	public async batchSave(
		saveParameterizedStatements = new Set<ParameterizedStatement>(),
		deleteParameterizedStatements?: Set<ParameterizedStatement>,
	): Promise<void> {
		if (!this.db) {
			throw new Error('Database not initialized');
		}

		if (this.isModernAPI) {
			const modernDb = this.db as ModernSQLiteDatabase;
			await modernDb.withTransactionAsync(async () => {
				for (const [statement, params] of saveParameterizedStatements) {
					await modernDb.runAsync(statement, params);
				}
				if (deleteParameterizedStatements) {
					for (const [statement, params] of deleteParameterizedStatements) {
						await modernDb.runAsync(statement, params);
					}
				}
			});
		} else {
			// WebSQL fallback
			return new Promise((resolve, reject) => {
				const resolveTransaction = resolve;
				const rejectTransaction = reject;
				(this.db as WebSQLDatabase).transaction(async transaction => {
					try {
						// await for all sql statements promises to resolve
						await Promise.all(
							[...saveParameterizedStatements].map(
								([statement, params]) =>
									new Promise((_resolve, _reject) => {
										transaction.executeSql(
											statement,
											params,
											() => {
												_resolve(null);
											},
											(_, error) => {
												_reject(error);
												logger.warn(error);

												return true;
											},
										);
									}),
							),
						);
						if (deleteParameterizedStatements) {
							await Promise.all(
								[...deleteParameterizedStatements].map(
									([statement, params]) =>
										new Promise((_resolve, _reject) => {
											transaction.executeSql(
												statement,
												params,
												() => {
													_resolve(null);
												},
												(_, error) => {
													_reject(error);
													logger.warn(error);

													return true;
												},
											);
										}),
								),
							);
						}
						resolveTransaction();
					} catch (error) {
						rejectTransaction(error);
						logger.warn(error);
					}
				});
			});
		}
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

		if (this.isModernAPI) {
			const modernDb = this.db as ModernSQLiteDatabase;
			let results: T[] = [];
			await modernDb.withTransactionAsync(async () => {
				results = await modernDb.getAllAsync(queryStatement, queryParams);
				await modernDb.runAsync(deleteStatement, deleteParams);
			});

			return results;
		} else {
			// WebSQL fallback
			return new Promise((resolve, reject) => {
				const resolveTransaction = resolve;
				const rejectTransaction = reject;
				(this.db as WebSQLDatabase).transaction(async transaction => {
					try {
						const result: T[] = await new Promise((_resolve, _reject) => {
							transaction.executeSql(
								queryStatement,
								queryParams,
								(_, sqlResult) => {
									_resolve(sqlResult.rows._array || []);
								},
								(_, error) => {
									_reject(error);
									logger.warn(error);

									return true;
								},
							);
						});
						await new Promise((_resolve, _reject) => {
							transaction.executeSql(
								deleteStatement,
								deleteParams,
								() => {
									_resolve(null);
								},
								(_, error) => {
									_reject(error);
									logger.warn(error);

									return true;
								},
							);
						});
						resolveTransaction(result);
					} catch (error) {
						rejectTransaction(error);
						logger.warn(error);
					}
				});
			});
		}
	}

	private async executeStatements(statements: string[]): Promise<void> {
		if (!this.db) {
			throw new Error('Database not initialized');
		}

		if (this.isModernAPI) {
			const modernDb = this.db as ModernSQLiteDatabase;
			await modernDb.withTransactionAsync(async () => {
				for (const statement of statements) {
					await modernDb.execAsync(statement);
				}
			});
		} else {
			// WebSQL fallback
			return new Promise((resolve, reject) => {
				const resolveTransaction = resolve;
				const rejectTransaction = reject;
				(this.db as WebSQLDatabase).transaction(async transaction => {
					try {
						await Promise.all(
							statements.map(
								statement =>
									new Promise((_resolve, _reject) => {
										transaction.executeSql(
											statement,
											[],
											() => {
												_resolve(null);
											},
											(_, error) => {
												_reject(error);

												return true;
											},
										);
									}),
							),
						);
						resolveTransaction();
					} catch (error) {
						rejectTransaction(error);
						logger.warn(error);
					}
				});
			});
		}
	}

	private async closeDB(): Promise<void> {
		if (this.db) {
			logger.debug('Closing Database');
			if (this.isModernAPI) {
				await (this.db as ModernSQLiteDatabase).closeAsync();
			} else {
				// WebSQL doesn't officially support closing
				// Attempt to close if the underlying API supports it
				try {
					const webSqlDb = this.db as WebSQLDatabase;
					if (
						'_db' in webSqlDb &&
						typeof (webSqlDb as any)._db?.close === 'function'
					) {
						await (webSqlDb as any)._db.close();
					}
				} catch (error) {
					logger.debug('Could not close WebSQL database', error);
				}
			}
			logger.debug('Database closed');
			this.db = undefined;
		}
	}
}

export default ExpoSQLiteDatabase;
