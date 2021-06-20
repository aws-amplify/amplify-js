import SQLite from 'react-native-sqlite-storage';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import {
	ModelInstanceMetadata,
	OpType,
	PaginationInput,
	PersistentModel,
	QueryOne,
} from '../../types';

const logger = new Logger('SQLiteDatabase');

SQLite.enablePromise(false);
SQLite.DEBUG(true);

const DB_NAME = 'AmplifyDatastore';
const DB_DISPLAYNAME = 'AWS Amplify DataStore SQLite Database';

// TODO: make these configurable
const DB_SIZE = 200000;
const DB_VERSION = '1.0';

class SQLiteDatabase {
	private db: SQLite.SQLiteDatabase;

	public async init(): Promise<void> {
		// try {
		// 	await SQLite.echoTest();
		// } catch (error) {
		// 	logger.error('SQLite echoTest failed - plugin not functional');
		// 	throw error;
		// }

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
		console.log('Deleting database');
		await SQLite.deleteDatabase(DB_NAME);
		logger.debug('Database DELETED');
	}

	public async get(statement: string): Promise<PersistentModel> {
		const [resultSet] = await this.db.executeSql(statement);
		return resultSet.rows.raw()[0];
	}

	public async getAll(statement: string): Promise<PersistentModel[]> {
		const [resultSet] = await this.db.executeSql(statement);
		return resultSet.rows.raw();
	}

	public async save(statement: string): Promise<void> {
		await this.db.executeSql(statement);
	}

	public async batchSave() {}

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
