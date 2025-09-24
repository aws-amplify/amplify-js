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
 * Expo SQLite Database implementation
 *
 * This implementation attempts to use the modern async API if available (expo-sqlite 13.0+),
 * falling back to the WebSQL API for older versions.
 *
 * The modern API provides:
 * - Better performance (non-blocking operations)
 * - Cleaner async/await syntax
 * - Future compatibility
 */
class ExpoSQLiteDatabase implements CommonSQLiteDatabase {
	private db: WebSQLDatabase | any; // WebSQLDatabase or modern SQLiteDatabase
	private isModernAPI = false;

	public async init(): Promise<void> {
		if (!this.db) {
			// Try to use modern API if available
			try {
				// Check if modern API is available
				const SQLite = require('expo-sqlite');
				if (SQLite.openDatabaseAsync) {
					logger.debug('Using modern expo-sqlite async API');
					this.db = await SQLite.openDatabaseAsync(DB_NAME);
					this.isModernAPI = true;

					// Apply performance optimizations for modern API
					await this.db.execAsync(`
						PRAGMA journal_mode = WAL;
						PRAGMA synchronous = NORMAL;
						PRAGMA cache_size = -64000;
						PRAGMA temp_store = MEMORY;
						PRAGMA mmap_size = 268435456;
					`);
				} else {
					// Fall back to WebSQL API
					logger.debug(
						'Using legacy WebSQL API - consider upgrading expo-sqlite',
					);
					this.db = openDatabase(DB_NAME);
					this.isModernAPI = false;
				}
			} catch (error) {
				// Fall back to WebSQL API if modern API fails
				logger.debug('Falling back to WebSQL API');
				this.db = openDatabase(DB_NAME);
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
			// delete database is not supported by expo-sqlite.
			// Database file needs to be deleted using deleteAsync from expo-file-system
			await deleteAsync(`${documentDirectory}SQLite/${DB_NAME}`);
			logger.debug('Database cleared');
		} catch (error) {
			logger.warn('Error clearing the database.', error);
			// open database if it was closed earlier and this.db was set to undefined.
			if (!this.db) {
				await this.init();
			}
			throw error;
		}
	}

	public async get<T extends PersistentModel>(
		statement: string,
		params: (string | number)[],
	): Promise<T> {
		if (this.isModernAPI) {
			const result = await this.db.getFirstAsync(statement, params);

			return result as T;
		} else {
			const results: T[] = await this.getAll(statement, params);

			return results[0];
		}
	}

	public getAll<T extends PersistentModel>(
		statement: string,
		params: (string | number)[],
	): Promise<T[]> {
		if (this.isModernAPI) {
			return this.db.getAllAsync(statement, params);
		} else {
			// WebSQL fallback
			return new Promise((resolve, reject) => {
				this.db.readTransaction(transaction => {
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
		if (this.isModernAPI) {
			return this.db.runAsync(statement, params);
		} else {
			// WebSQL fallback
			return new Promise((resolve, reject) => {
				this.db.transaction(transaction => {
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
		if (this.isModernAPI) {
			const results: T[] = [];
			await this.db.withTransactionAsync(async () => {
				for (const [statement, params] of queryParameterizedStatements) {
					const result = await this.db.getAllAsync(statement, params);
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
				this.db.transaction(async transaction => {
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
		if (this.isModernAPI) {
			await this.db.withTransactionAsync(async () => {
				for (const [statement, params] of saveParameterizedStatements) {
					await this.db.runAsync(statement, params);
				}
				if (deleteParameterizedStatements) {
					for (const [statement, params] of deleteParameterizedStatements) {
						await this.db.runAsync(statement, params);
					}
				}
			});
		} else {
			// WebSQL fallback
			return new Promise((resolve, reject) => {
				const resolveTransaction = resolve;
				const rejectTransaction = reject;
				this.db.transaction(async transaction => {
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
		const [queryStatement, queryParams] = queryParameterizedStatement;
		const [deleteStatement, deleteParams] = deleteParameterizedStatement;

		if (this.isModernAPI) {
			let results: T[] = [];
			await this.db.withTransactionAsync(async () => {
				results = await this.db.getAllAsync(queryStatement, queryParams);
				await this.db.runAsync(deleteStatement, deleteParams);
			});

			return results;
		} else {
			// WebSQL fallback
			return new Promise((resolve, reject) => {
				const resolveTransaction = resolve;
				const rejectTransaction = reject;
				this.db.transaction(async transaction => {
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
		if (this.isModernAPI) {
			await this.db.withTransactionAsync(async () => {
				for (const statement of statements) {
					await this.db.execAsync(statement);
				}
			});
		} else {
			// WebSQL fallback
			return new Promise((resolve, reject) => {
				const resolveTransaction = resolve;
				const rejectTransaction = reject;
				this.db.transaction(async transaction => {
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
				// Modern API has closeAsync method
				await this.db.closeAsync();
			} else {
				// WebSQL doesn't officially support closing, but we can try
				try {
					await (this.db as any)._db.close();
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
