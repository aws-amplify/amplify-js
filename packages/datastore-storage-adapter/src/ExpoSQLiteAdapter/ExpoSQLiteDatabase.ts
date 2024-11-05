// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { ConsoleLogger } from '@aws-amplify/core';
import { PersistentModel } from '@aws-amplify/datastore';
import { deleteAsync, documentDirectory } from 'expo-file-system';
import { WebSQLDatabase, openDatabase } from 'expo-sqlite';

import { DB_NAME } from '../common/constants';
import { CommonSQLiteDatabase, ParameterizedStatement } from '../common/types';

const logger = new ConsoleLogger('ExpoSQLiteDatabase');

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
			// As per expo docs version, description and size arguments are ignored,
			// but are accepted by the function for compatibility with the WebSQL specification.
			// Hence, we do not need those arguments.
			this.db = openDatabase(DB_NAME);
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
			this.init();
		}
	}

	public async get<T extends PersistentModel>(
		statement: string,
		params: (string | number)[],
	): Promise<T> {
		const results: T[] = await this.getAll(statement, params);

		return results[0];
	}

	public getAll<T extends PersistentModel>(
		statement: string,
		params: (string | number)[],
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
					},
				);
			});
		});
	}

	public save(statement: string, params: (string | number)[]): Promise<void> {
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
					},
				);
			});
		});
	}

	public batchQuery<T = any>(
		queryParameterizedStatements = new Set<ParameterizedStatement>(),
	): Promise<T[]> {
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

	public batchSave(
		saveParameterizedStatements = new Set<ParameterizedStatement>(),
		deleteParameterizedStatements?: Set<ParameterizedStatement>,
	): Promise<void> {
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
					resolveTransaction(null);
				} catch (error) {
					rejectTransaction(error);
					logger.warn(error);
				}
			});
		});
	}

	public selectAndDelete<T = any>(
		queryParameterizedStatement: ParameterizedStatement,
		deleteParameterizedStatement: ParameterizedStatement,
	): Promise<T[]> {
		const [queryStatement, queryParams] = queryParameterizedStatement;
		const [deleteStatement, deleteParams] = deleteParameterizedStatement;

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

	private executeStatements(statements: string[]): Promise<void> {
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
					resolveTransaction(null);
				} catch (error) {
					rejectTransaction(error);
					logger.warn(error);
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
