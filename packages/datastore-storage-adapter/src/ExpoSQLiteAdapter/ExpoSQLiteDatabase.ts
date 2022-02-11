import * as SQLite from 'expo-sqlite';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { PersistentModel } from '@aws-amplify/datastore';
import { ParameterizedStatement } from '../commons/SQLiteUtils';
import { Database } from '../commons/Database';

const logger = new Logger('ExpoSQLiteDatabase');

//SQLite.enablePromise(true);

/* if (Logger.LOG_LEVEL === 'DEBUG') {
	SQLite.DEBUG(true);
}
 */
const DB_NAME = 'AmplifyDatastore';
const DB_DISPLAYNAME = 'AWS Amplify DataStore SQLite Database';

// TODO: make these configurable
const DB_SIZE = 200000;
const DB_VERSION = '1.0';

/*

Note: 
I purposely avoided using arrow functions () => {} in this class,
Because I ran into issues with them in some of the SQLite method callbacks

Also, even though the SQLite library is promisified, certain operations
only work correctly with callbacks. Specifically, any time you need to
get the result of an `executeSql` command inside of a transaction
(see the batchQuery method below)

*/

class ExpoSQLiteDatabase implements Database {
	private db: SQLite.WebSQLDatabase;

	public async init(): Promise<void> {
		//only openDatabase once.
		if (!this.db) {
			this.db = SQLite.openDatabase(
				DB_NAME,
				DB_VERSION,
				DB_DISPLAYNAME,
				DB_SIZE
			);
		}
	}

	public async createSchema(statements: string[]): Promise<void> {
		return await this.executeStatements(statements);
	}

	public async clear(): Promise<void> {
		logger.debug('Deleting database');
		//delete database is not supported by expo-sqlite. alternative way is to get all table names and drop them.
		//await SQLite.deleteDatabase(DB_NAME);
		this.dropAllTables();
		logger.debug('Database deleted');
		//await this.closeDB();
	}

	public async get<T extends PersistentModel>(
		statement: string,
		params: any[]
	): Promise<T> {
		const resultSet: SQLite.SQLResultSet = await new Promise(
			(resolve, reject) => {
				this.db.readTransaction(tx => {
					tx.executeSql(
						statement,
						params,
						(_, result) => resolve(result),
						(_, err) => {
							reject(err);
							return true;
						}
					);
				});
			}
		);
		const result =
			resultSet &&
			resultSet.rows &&
			resultSet.rows.length &&
			resultSet.rows._array;

		return result[0] || undefined;
	}

	public async getAll<T extends PersistentModel>(
		statement: string,
		params: any[]
	): Promise<T[]> {
		const resultSet: SQLite.SQLResultSet = await new Promise(
			(resolve, reject) => {
				this.db.readTransaction(tx => {
					tx.executeSql(
						statement,
						params,
						(_, result) => {
							resolve(result);
						},
						(_, err) => {
							reject(err);
							return true;
						}
					);
				});
			}
		);
		const result =
			resultSet &&
			resultSet.rows &&
			resultSet.rows.length &&
			resultSet.rows._array;
		return result || [];
	}

	public async save(statement: string, params: any[]): Promise<void> {
		await new Promise((resolve, reject) => {
			this.db.transaction(tx => {
				tx.executeSql(
					statement,
					params,
					() => resolve(),
					(_, error) => {
						reject(error);
						return true;
					}
				);
			});
		});
	}

	public async batchQuery(
		queryStatements: Set<ParameterizedStatement>
	): Promise<any[]> {
		const results = [];
		await new Promise((resolve, reject) => {
			this.db.readTransaction(function (tx) {
				for (const [statement, params] of queryStatements) {
					tx.executeSql(
						statement,
						params,
						function (_tx, res) {
							results.push(res.rows._array[0]);
						},
						(_, error) => {
							reject(error);
							return true;
						}
					);
				}
				resolve();
			});
		});
		return results;
	}

	public async batchSave(
		saveStatements: Set<ParameterizedStatement>,
		deleteStatements?: Set<ParameterizedStatement>
	): Promise<void> {
		await new Promise((resolve, reject) => {
			this.db.transaction(function (tx) {
				for (const [statement, params] of saveStatements) {
					tx.executeSql(
						statement,
						params,
						() => {},
						(_, error) => {
							reject(error);
							return true;
						}
					);
				}

				if (deleteStatements) {
					for (const [statement, params] of deleteStatements) {
						tx.executeSql(
							statement,
							params,
							() => {},
							(_, error) => {
								reject(error);
								return true;
							}
						);
					}
				}
				resolve();
			});
		});
	}

	public async selectAndDelete(
		query: ParameterizedStatement,
		_delete: ParameterizedStatement
	): Promise<any[]> {
		let results = [];

		const [queryStatement, queryParams] = query;
		const [deleteStatement, deleteParams] = _delete;

		results = await new Promise((resolve, reject) => {
			this.db.transaction(function (tx) {
				var tempresults;
				tx.executeSql(
					queryStatement,
					queryParams,
					(_tx, res) => {
						tempresults = res.rows._array;
					},
					(_, error) => {
						reject(error);
						return true;
					}
				);
				tx.executeSql(
					deleteStatement,
					deleteParams,
					() => {},
					(_, error) => {
						reject(error);
						return true;
					}
				);
				resolve(tempresults);
			});
		});
		return results || [];
	}

	private async executeStatements(statements: string[]): Promise<void> {
		await new Promise((resolve, reject) => {
			this.db.transaction(function (tx) {
				for (const statement of statements) {
					tx.executeSql(
						statement,
						[],
						() => {},
						(_, error) => {
							reject(error);
							return true;
						}
					);
				}
				resolve();
			});
		});
	}

	private async closeDB() {
		if (this.db) {
			logger.debug('Closing Database');
			//closing database is not supported by expo-sqlite. Workaround is to access the private db variable and call the close() method.
			var tempdb: any = this.db;
			await tempdb._db.close();
			logger.debug('Database closed');
		}
	}

	private async getAllTableNames(): Promise<string[]> {
		const resultSet: any[] = await new Promise((resolve, reject) => {
			this.db.transaction(tx => {
				tx.executeSql(
					`SELECT name FROM sqlite_master where type='table'`,
					[],
					(tx, results) => {
						resolve(results.rows._array);
					},
					(_, error) => {
						reject(error);
						return true;
					}
				);
			});
		});

		const tableNames = resultSet.map(e => e.name);
		return tableNames;
	}

	private async dropAllTables() {
		const tableNames = await this.getAllTableNames();

		for (const tableName of tableNames) {
			const statement = `DROP TABLE IF EXISTS ${tableName}`;
			await this.executeStatements([statement]);
		}
	}
}

export default ExpoSQLiteDatabase;
