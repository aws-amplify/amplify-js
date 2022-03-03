import { openDatabase, SQLResultSet, WebSQLDatabase } from 'expo-sqlite';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { PersistentModel } from '@aws-amplify/datastore';
import { CommonSQLiteDatabase, ParameterizedStatement } from '../common/types';
import { deleteAsync, documentDirectory } from 'expo-file-system';

const logger = new Logger('ExpoSQLiteDatabase');

const DB_NAME = 'AmplifyDatastore';
const DB_DISPLAYNAME = 'AWS Amplify DataStore SQLite Database';

// TODO: make these configurable
const DB_SIZE = 200000;
const DB_VERSION = '1.0';

/*

Note: 
I purposely used arrow functions () => {} in this class as expo-sqlite library is not promisified.
ExpoSQLite transaction error callbacks require returning a boolean value to indicate whether the 
error was handled or not. Returning a true value indicates the error was handled and does not 
rollback the whole transaction.

*/

class ExpoSQLiteDatabase implements CommonSQLiteDatabase {
	private db: WebSQLDatabase;

	public async init(): Promise<void> {
		// only open database once.

		if (!this.db) {
			this.db = openDatabase(DB_NAME, DB_VERSION, DB_DISPLAYNAME, DB_SIZE);
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
			await deleteAsync(documentDirectory + 'SQLite/' + DB_NAME);
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
			this.db.readTransaction(tx => {
				tx.executeSql(
					statement,
					params,
					(_, res) => {
						resolve(res?.rows?._array || []);
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
			this.db.transaction(tx => {
				tx.executeSql(
					statement,
					params,
					() => resolve(null),
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
		queryStatements: Set<ParameterizedStatement>
	): Promise<T[]> {
		return new Promise((resolveTx, rejectTx) => {
			this.db.transaction(async tx => {
				try {
					const results: any[] = await Promise.all(
						[...queryStatements].map(
							([statement, params]) =>
								new Promise((resolve, reject) => {
									tx.executeSql(
										statement,
										params,
										(_, res) => {
											resolve(res.rows._array[0]);
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
					resolveTx(results);
				} catch (error) {
					rejectTx(error);
				}
			});
		});
	}

	public async batchSave(
		saveStatements: Set<ParameterizedStatement>,
		deleteStatements?: Set<ParameterizedStatement>
	): Promise<void> {
		return new Promise((resolveTx, rejectTx) => {
			try {
				this.db.transaction(async tx => {
					// await for all sql statments promises to resolve
					await Promise.all(
						[...(saveStatements ?? [])].map(
							([statement, params]) =>
								new Promise((resolve, reject) =>
									tx.executeSql(
										statement,
										params,
										(_, result) => {
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
				this.db.transaction(async tx => {
					await Promise.all(
						[...(deleteStatements ?? [])].map(
							([statement, params]) =>
								new Promise((resolve, reject) =>
									tx.executeSql(
										statement,
										params,
										(_, result) => {
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
				resolveTx(null);
			} catch (error) {
				rejectTx(error);
			}
		});
	}

	public async selectAndDelete<T = any>(
		queryParameterizedStatement: ParameterizedStatement,
		deleteParameterizedStatement: ParameterizedStatement
	): Promise<T[]> {
		const [queryStatement, queryParams] = queryParameterizedStatement;
		const [deleteStatement, deleteParams] = deleteParameterizedStatement;

		return new Promise((resolveTx, rejectTx) => {
			this.db.transaction(async tx => {
				try {
					const result: T[] = await new Promise((resolve, reject) => {
						tx.executeSql(
							queryStatement,
							queryParams,
							(_, res) => {
								resolve(res?.rows?._array || []);
							},
							(_, error) => {
								reject(error);
								logger.warn(error);
								return true;
							}
						);
					});
					await new Promise((resolve, reject) => {
						tx.executeSql(
							deleteStatement,
							deleteParams,
							(_, result) => {
								resolve(null);
							},
							(_, error) => {
								reject(error);
								logger.warn(error);
								return true;
							}
						);
					});
					resolveTx(result);
				} catch (error) {
					rejectTx(error);
				}
			});
		});
	}

	private async executeStatements(statements: string[]): Promise<void> {
		return new Promise((resolveTx, rejectTx) => {
			this.db.transaction(async tx => {
				try {
					await Promise.all(
						statements.map(
							statement =>
								new Promise((resolve, reject) => {
									tx.executeSql(
										statement,
										[],
										(_, result) => {
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
					resolveTx(null);
				} catch (error) {
					rejectTx(error);
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
