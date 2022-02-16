import SQLite from 'react-native-sqlite-storage';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { PersistentModel } from '@aws-amplify/datastore';
import { CommonSQLiteDatabase, ParameterizedStatement } from '../common/types';

const logger = new Logger('SQLiteDatabase');

SQLite.enablePromise(true);

if (Logger.LOG_LEVEL === 'DEBUG') {
	SQLite.DEBUG(true);
}

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

class SQLiteDatabase implements CommonSQLiteDatabase {
	private db: SQLite.SQLiteDatabase;

	public async init(): Promise<void> {
		// only open database once.
		if (!this.db) {
			this.db = await SQLite.openDatabase(
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
		await this.closeDB();
		logger.debug('Deleting database');
		await SQLite.deleteDatabase(DB_NAME);
		logger.debug('Database deleted');
	}

	public async get<T extends PersistentModel>(
		statement: string,
		params: (string | number)[]
	): Promise<T> {
		const [resultSet] = await this.db.executeSql(statement, params);
		const result =
			resultSet &&
			resultSet.rows &&
			resultSet.rows.length &&
			resultSet.rows.raw &&
			resultSet.rows.raw();

		return result[0] || undefined;
	}

	public async getAll<T extends PersistentModel>(
		statement: string,
		params: (string | number)[]
	): Promise<T[]> {
		const [resultSet] = await this.db.executeSql(statement, params);
		const result =
			resultSet &&
			resultSet.rows &&
			resultSet.rows.length &&
			resultSet.rows.raw &&
			resultSet.rows.raw();

		return result || [];
	}

	public async save(
		statement: string,
		params: (string | number)[]
	): Promise<void> {
		await this.db.executeSql(statement, params);
	}

	public async batchQuery<T = any>(
		queryStatements: Set<ParameterizedStatement>
	): Promise<T[]> {
		const results = [];

		await this.db.readTransaction(tx => {
			for (const [statement, params] of queryStatements) {
				tx.executeSql(
					statement,
					params,
					(_tx, res) => {
						results.push(res.rows.raw()[0]);
					},
					logger.warn
				);
			}
		});

		return results;
	}

	public async batchSave(
		saveStatements: Set<ParameterizedStatement>,
		deleteStatements?: Set<ParameterizedStatement>
	): Promise<void> {
		await this.db.transaction(tx => {
			for (const [statement, params] of saveStatements) {
				tx.executeSql(statement, params);
			}
			if (deleteStatements) {
				for (const [statement, params] of deleteStatements) {
					tx.executeSql(statement, params);
				}
			}
		});
	}

	public async selectAndDelete<T = any>(
		queryParameterizedStatement: ParameterizedStatement,
		deleteParameterizedStatement: ParameterizedStatement
	): Promise<T[]> {
		let results: T[] = [];

		const [queryStatement, queryParams] = queryParameterizedStatement;
		const [deleteStatement, deleteParams] = deleteParameterizedStatement;

		await this.db.transaction(tx => {
			tx.executeSql(
				queryStatement,
				queryParams,
				(_tx, res) => {
					results = res.rows.raw();
				},
				logger.warn
			);
			tx.executeSql(deleteStatement, deleteParams, () => {}, logger.warn);
		});

		return results;
	}

	private async executeStatements(statements: string[]): Promise<void> {
		return await this.db.transaction(tx => {
			for (const statement of statements) {
				tx.executeSql(statement);
			}
		});
	}

	private async closeDB() {
		if (this.db) {
			logger.debug('Closing Database');
			await this.db.close();
			logger.debug('Database closed');
		}
	}
}

export default SQLiteDatabase;
