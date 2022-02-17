import { openDatabase, SQLResultSet, WebSQLDatabase } from 'expo-sqlite';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { PersistentModel } from '@aws-amplify/datastore';
import { CommonSQLiteDatabase, ParameterizedStatement } from '../common/types';

const logger = new Logger('ExpoSQLiteDatabase');

const DB_NAME = 'AmplifyDatastore';
const DB_DISPLAYNAME = 'AWS Amplify DataStore SQLite Database';

// TODO: make these configurable
const DB_SIZE = 200000;
const DB_VERSION = '1.0';

/*

Note: 
I purposely used arrow functions () => {} in this class as expo-sqlite library is not promisified

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
		logger.debug('Clearing database');
		// delete database is not supported by expo-sqlite. alternative way is to get all table names and drop them.
		await this.dropAllTables();
		logger.debug('Database cleared');
		// closing db is not required as we are not deleting the db.
	}

	public async get<T extends PersistentModel>(
		statement: string,
		params: (string | number)[]
	): Promise<T> {
		const results: any[] = await this.getAll(statement, params);
		return results.length > 0 ? results[0] : undefined;
	}

	public async getAll<T extends PersistentModel>(
		statement: string,
		params: (string | number)[]
	): Promise<T[]> {
		const resultSet: SQLResultSet = await new Promise((resolve, reject) => {
			this.db.readTransaction(tx => {
				tx.executeSql(
					statement,
					params,
					(_, res) => {
						resolve(res);
					},
					(_, error) => {
						reject(error);
						logger.warn(error);
						return true;
					}
				);
			});
		});
		return resultSet?.rows?._array || [];
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
		const resultSet: T[] = await new Promise((resolve, reject) => {
			this.db.readTransaction(tx => {
				const results = [];
				for (const [statement, params] of queryStatements) {
					tx.executeSql(
						statement,
						params,
						(_, res) => {
							const item = res.rows.item[0];
							item && results.push(item);
						},
						(_, error) => {
							reject(error);
							logger.warn(error);
							return true;
						}
					);
				}
				resolve(results);
			});
		});
		return resultSet;
	}

	public async batchSave(
		saveStatements: Set<ParameterizedStatement>,
		deleteStatements?: Set<ParameterizedStatement>
	): Promise<void> {
		await new Promise((resolve, reject) => {
			this.db.transaction(tx => {
				for (const [statement, params] of saveStatements) {
					tx.executeSql(statement, params, null, (_, error) => {
						reject(error);
						logger.warn(error);
						return true;
					});
				}

				if (deleteStatements) {
					for (const [statement, params] of deleteStatements) {
						tx.executeSql(statement, params, null, (_, error) => {
							reject(error);
							logger.warn(error);
							return true;
						});
					}
				}
				resolve(null);
			});
		});
	}

	public async selectAndDelete<T = any>(
		queryParameterizedStatement: ParameterizedStatement,
		deleteParameterizedStatement: ParameterizedStatement
	): Promise<T[]> {
		const [queryStatement, queryParams] = queryParameterizedStatement;
		const [deleteStatement, deleteParams] = deleteParameterizedStatement;

		const results: T[] = await new Promise((resolve, reject) => {
			this.db.transaction(tx => {
				let tempResults;
				tx.executeSql(
					queryStatement,
					queryParams,
					(_tx, res) => {
						tempResults = res?.rows?._array || [];
					},
					(_, error) => {
						reject(error);
						logger.warn(error);
						return true;
					}
				);
				tx.executeSql(deleteStatement, deleteParams, null, (_, error) => {
					reject(error);
					logger.warn(error);
					return true;
				});
				resolve(tempResults);
			});
		});
		return results || [];
	}

	private async executeStatements(statements: string[]): Promise<void> {
		await new Promise((resolve, reject) => {
			this.db.transaction(tx => {
				for (const statement of statements) {
					tx.executeSql(statement, [], null, (_, error) => {
						reject(error);
						logger.warn(error);
						return true;
					});
				}
				resolve(null);
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
		}
	}

	private async getAllTableNames(): Promise<string[]> {
		const getTablesCommand =
			"SELECT name FROM sqlite_master where type='table'";
		const resultSet: any[] = await new Promise((resolve, reject) => {
			this.db.transaction(tx => {
				tx.executeSql(
					getTablesCommand,
					[],
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

		return resultSet.map(e => e.name);
	}

	private async dropAllTables() {
		const tableNames = await this.getAllTableNames();
		await this.executeStatements(
			tableNames.map(tableName => {
				return `DROP TABLE IF EXISTS ${tableName}`;
			})
		);
	}
}

export default ExpoSQLiteDatabase;
