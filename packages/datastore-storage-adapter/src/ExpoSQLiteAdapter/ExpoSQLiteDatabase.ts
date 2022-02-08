import * as SQLite from 'expo-sqlite';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { PersistentModel } from '@aws-amplify/datastore';
import { ParameterizedStatement } from '../commons/SQLiteUtils';

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

class ExpoSQLiteDatabase {
	private db: SQLite.WebSQLDatabase;

	public async init(): Promise<void> {
		this.db = SQLite.openDatabase(DB_NAME, DB_VERSION, DB_DISPLAYNAME, DB_SIZE);
	}

	public async createSchema(statements: string[]) {
		return await this.executeStatements(statements);
	}

	public async clear() {
		await this.closeDB();
		logger.debug('Deleting database');
		//await SQLite.deleteDatabase(DB_NAME);
		logger.debug('Database deleted');
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
					() => resolve(true),
					(_, error) => {
						reject(error);

						return true;
					}
				);
			});
		});
	}

	public async batchQuery(queryStatements: Set<ParameterizedStatement>) {
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
					resolve(true);
				}
			});
		});

		return results;
	}

	public async batchSave(
		saveStatements: Set<ParameterizedStatement>,
		deleteStatements?: Set<ParameterizedStatement>
	) {
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
				resolve(true);
			});
		});
	}

	public async selectAndDelete(
		query: ParameterizedStatement,
		_delete: ParameterizedStatement
	) {
		let results = [];

		const [queryStatement, queryParams] = query;
		const [deleteStatement, deleteParams] = _delete;

		results = await new Promise((resolve, reject) => {
			this.db.transaction(function (tx) {
				tx.executeSql(
					queryStatement,
					queryParams,
					(_tx, res) => {
						resolve(res.rows._array);
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
			});
		});

		return results;
	}

	private async executeStatements(statements: string[]): Promise<void> {
		return await new Promise((resolve, reject) => {
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
			//await this.db.close();
			logger.debug('Database closed');
		}
	}

	private async getTableNames() {
		//to be implemented. Returns array of table names.
	}
}

export default ExpoSQLiteDatabase;
