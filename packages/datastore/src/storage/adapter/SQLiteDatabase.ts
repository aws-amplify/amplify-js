import SQLite from 'react-native-sqlite-storage';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import {
	ModelInstanceMetadata,
	OpType,
	PaginationInput,
	PersistentModel,
	QueryOne,
} from '../../types';
import { SQLStatement } from './SQLiteUtils';

const logger = new Logger('SQLiteDatabase');

SQLite.enablePromise(true);
SQLite.DEBUG(true);

const DB_NAME = 'AmplifyDatastore';
const DB_DISPLAYNAME = 'AWS Amplify DataStore SQLite Database';

// TODO: make these configurable
const DB_SIZE = 200000;
const DB_VERSION = '1.0';

class SQLiteDatabase {
	private db: SQLite.SQLiteDatabase;

	public async init(): Promise<void> {
		this.db = await SQLite.openDatabase(
			DB_NAME,
			DB_VERSION,
			DB_DISPLAYNAME,
			DB_SIZE
		);
	}

	public async createSchema(statements: string[]) {
		return await this.executeStatements(statements);
	}

	public async clear() {
		await this.closeDB();
		logger.debug('Deleting database');
		await SQLite.deleteDatabase(DB_NAME);
		logger.debug('Database deleted');
	}

	public async get(statement: string, params: any[]): Promise<PersistentModel> {
		const [resultSet] = await this.db.executeSql(statement, params);
		const result =
			resultSet.rows &&
			resultSet.rows.length &&
			resultSet.rows.raw &&
			resultSet.rows.raw();

		console.log('get', statement, params, result);
		return result || undefined;
	}

	public async getAll(
		statement: string,
		params: any[]
	): Promise<PersistentModel[]> {
		const [resultSet] = await this.db.executeSql(statement, params);
		const result =
			resultSet.rows &&
			resultSet.rows.length &&
			resultSet.rows.raw &&
			resultSet.rows.raw();

		console.log('getAll', statement, params, result);
		return result || [];
	}

	public async save(statement: string, params: any[]): Promise<void> {
		await this.db.executeSql(statement, params);
	}

	public async batchQuery(queryStatements: Set<SQLStatement>) {
		const results = [];

		await this.db.readTransaction(function(tx) {
			for (const [statement, params] of queryStatements) {
				tx.executeSql(statement, params, console.error, function(_tx, res) {
					results.push(res.rows.raw()[0]);
				});
			}
		});

		return results;
	}
	public async batchSave(
		saveStatements: Set<SQLStatement>,
		deleteStatements: Set<SQLStatement>
	) {
		await this.db.transaction(function(tx) {
			for (const [statement, params] of saveStatements) {
				tx.executeSql(statement, params);
			}
			for (const [statement, params] of deleteStatements) {
				tx.executeSql(statement, params);
			}
		});
	}

	private async executeStatements(statements: string[]): Promise<void> {
		return await this.db.transaction(function(tx) {
			for (const statement of statements) {
				tx.executeSql(statement);
			}
		});
	}

	private async executeStatementsAndReturn(
		statements: string[]
	): Promise<{ insertId?: string; rows: { item; raw } }> {
		return new Promise(async (resolve, reject) => {
			this.db
				.transaction(function(tx) {
					// we need to resolve the last transaction
					// if we want to retrieve data from it
					const lastStatement = statements.pop();

					for (const statement of statements) {
						tx.executeSql(statement);
					}

					tx.executeSql(lastStatement).then(([, result]) => resolve(result));
				})
				.catch(reject);
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

// public async upsert(
// 	statements: string[]
// ): Promise<[boolean, PersistentModel]> {
// 	const { insertId, rows } = await this.executeStatementsAndReturn(
// 		statements
// 	);

// 	return [Boolean(insertId), rows.raw()];
// }

export default SQLiteDatabase;
