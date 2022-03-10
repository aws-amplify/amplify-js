import { openDatabase, WebSQLDatabase } from 'expo-sqlite';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { PersistentModel } from '@aws-amplify/datastore';
import { CommonSQLiteDatabase, ParameterizedStatement } from '../common/types';
import { deleteAsync, documentDirectory } from 'expo-file-system';

const logger = new Logger('ExpoSQLiteDatabase');

const DB_NAME = 'AmplifyDatastore';
const DB_DISPLAY_NAME = 'AWS Amplify DataStore SQLite Database';

// TODO: make these configurable
const DB_SIZE = 200000;
const DB_VERSION = '1.0';

/*

Note: 
ExpoSQLite transaction error callbacks require returning a boolean value to indicate whether the 
error was handled or not. Returning a true value indicates the error was handled and does not 
rollback the whole transaction.

*/

class ExpoSQLiteDatabase implements CommonSQLiteDatabase {
	private db: WebSQLDatabase;

	public async init(): Promise<void> {
		// only open database once.

		if (!this.db) {
			this.db = openDatabase(DB_NAME, DB_VERSION, DB_DISPLAY_NAME, DB_SIZE);
		}
	}

	public async createSchema(statements: string[]): Promise<void> {
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
			this.init();
		}
	}

	public async get<T extends PersistentModel>(
		statement: string,
		params: (string | number)[]
	): Promise<T> {
		const results: T[] = await this.getAll(statement, params);
		return results[0];
	}

	public async getAll<T extends PersistentModel>(
		statement: string,
		params: (string | number)[]
	): Promise<T[]> {
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
					}
				);
			});
		});
	}

	public async save(
		statement: string,
		params: (string | number)[]
	): Promise<void> {
		return new Promise((resolve, reject) => {
			this.db.transaction(transaction => {
				transaction.executeSql(
					statement,
					params,
					() => {
						resolve(null);
					},
					(_, error) => {
						reject(error);
						logger.warn(error);
						return true;
					}
				);
			});
		});
	}

	public async batchQuery<T = any>(
		queryParameterizedStatements: Set<ParameterizedStatement> = new Set()
	): Promise<T[]> {
		return new Promise((resolveTransaction, rejectTransaction) => {
			this.db.transaction(async transaction => {
				try {
					const results: any[] = await Promise.all(
						[...queryParameterizedStatements].map(
							([statement, params]) =>
								new Promise((resolve, reject) => {
									transaction.executeSql(
										statement,
										params,
										(_, result) => {
											resolve(result.rows._array[0]);
										},
										(_, error) => {
											reject(error);
											logger.warn(error);
											return true;
										}
									);
								})
						)
					);
					resolveTransaction(results);
				} catch (error) {
					rejectTransaction(error);
				}
			});
		});
	}

	public async batchSave(
		saveParameterizedStatements: Set<ParameterizedStatement> = new Set(),
		deleteParameterizedStatements?: Set<ParameterizedStatement>
	): Promise<void> {
		return new Promise((resolveTransaction, rejectTransaction) => {
			try {
				this.db.transaction(async transaction => {
					// await for all sql statments promises to resolve
					await Promise.all(
						[...saveParameterizedStatements].map(
							([statement, params]) =>
								new Promise((resolve, reject) =>
									transaction.executeSql(
										statement,
										params,
										() => {
											resolve(null);
										},
										(_, error) => {
											reject(error);
											logger.warn(error);
											return true;
										}
									)
								)
						)
					);
				});
				if (deleteParameterizedStatements) {
					this.db.transaction(async transaction => {
						await Promise.all(
							[...deleteParameterizedStatements].map(
								([statement, params]) =>
									new Promise((resolve, reject) =>
										transaction.executeSql(
											statement,
											params,
											() => {
												resolve(null);
											},
											(_, error) => {
												reject(error);
												logger.warn(error);
												return true;
											}
										)
									)
							)
						);
					});
				}
				resolveTransaction(null);
			} catch (error) {
				rejectTransaction(error);
			}
		});
	}

	public async selectAndDelete<T = any>(
		queryParameterizedStatement: ParameterizedStatement,
		deleteParameterizedStatement: ParameterizedStatement
	): Promise<T[]> {
		const [queryStatement, queryParams] = queryParameterizedStatement;
		const [deleteStatement, deleteParams] = deleteParameterizedStatement;

		return new Promise((resolveTransaction, rejectTransaction) => {
			this.db.transaction(async transaction => {
				try {
					const result: T[] = await new Promise((resolve, reject) => {
						transaction.executeSql(
							queryStatement,
							queryParams,
							(_, result) => {
								resolve(result.rows._array || []);
							},
							(_, error) => {
								reject(error);
								logger.warn(error);
								return true;
							}
						);
					});
					await new Promise((resolve, reject) => {
						transaction.executeSql(
							deleteStatement,
							deleteParams,
							() => {
								resolve(null);
							},
							(_, error) => {
								reject(error);
								logger.warn(error);
								return true;
							}
						);
					});
					resolveTransaction(result);
				} catch (error) {
					rejectTransaction(error);
				}
			});
		});
	}

	private async executeStatements(statements: string[]): Promise<void> {
		return new Promise((resolveTransaction, rejectTransaction) => {
			this.db.transaction(async transaction => {
				try {
					await Promise.all(
						statements.map(
							statement =>
								new Promise((resolve, reject) => {
									transaction.executeSql(
										statement,
										[],
										() => {
											resolve(null);
										},
										(_, error) => {
											reject(error);
											return true;
										}
									);
								})
						)
					);
					resolveTransaction(null);
				} catch (error) {
					rejectTransaction(error);
				}
			});
		});
	}

	private async closeDB() {
		if (this.db) {
			logger.debug('Closing Database');
			// closing database is not supported by expo-sqlite.
			// Workaround is to access the private db variable and call the close() method.
			await (this.db as any)._db.close();
			logger.debug('Database closed');
			this.db = undefined;
		}
	}
}

export default ExpoSQLiteDatabase;
