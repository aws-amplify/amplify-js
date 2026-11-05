// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import type * as SQLiteModule from 'react-native-sqlite-storage';
import { ConsoleLogger } from '@aws-amplify/core';
import { PersistentModel } from '@aws-amplify/datastore';

import { DB_NAME } from '../common/constants';
import { CommonSQLiteDatabase, ParameterizedStatement } from '../common/types';

const logger = new ConsoleLogger('SQLiteDatabase');

// react-native-sqlite-storage is an optional peer, and the package root also
// exports ExpoSQLiteAdapter. Load it on first use, so an Expo app does not need it.
let SQLite: typeof SQLiteModule | undefined;

function loadSQLite(): typeof SQLiteModule {
	if (!SQLite) {
		let loaded: typeof SQLiteModule;
		try {
			loaded = require('react-native-sqlite-storage');
		} catch (error) {
			logger.error('Failed to load react-native-sqlite-storage', error);
			throw new Error(
				'SQLiteAdapter requires react-native-sqlite-storage. ' +
					'Install it, or use ExpoSQLiteAdapter with expo-sqlite.',
			);
		}

		loaded.enablePromise(true);

		if (ConsoleLogger.LOG_LEVEL === 'DEBUG') {
			loaded.DEBUG(true);
		}

		SQLite = loaded;
	}

	return SQLite;
}

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
	private db: SQLiteModule.SQLiteDatabase;

	public async init(): Promise<void> {
		// only open database once.
		if (!this.db) {
			this.db = await loadSQLite().openDatabase({
				name: DB_NAME,
				location: 'default',
			});
		}
	}

	public async createSchema(statements: string[]): Promise<void> {
		await this.executeStatements(statements);
	}

	public async clear(): Promise<void> {
		await this.closeDB();
		logger.debug('Deleting database');
		await loadSQLite().deleteDatabase({ name: DB_NAME, location: 'default' });
		logger.debug('Database deleted');
	}

	public async get<T extends PersistentModel>(
		statement: string,
		params: (string | number)[],
	): Promise<T> {
		const results: T[] = await this.getAll(statement, params);

		return results[0];
	}

	public async getAll<T extends PersistentModel>(
		statement: string,
		params: (string | number)[],
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
		params: (string | number)[],
	): Promise<void> {
		await this.db.executeSql(statement, params);
	}

	public async batchQuery<T = any>(
		queryParameterizedStatements: Set<ParameterizedStatement>,
	): Promise<T[]> {
		const results = [];

		await this.db.readTransaction(tx => {
			for (const [statement, params] of queryParameterizedStatements) {
				tx.executeSql(
					statement,
					params,
					(_, res) => {
						results.push(res.rows.raw()[0]);
					},
					logger.warn,
				);
			}
		});

		return results;
	}

	public async batchSave(
		saveParameterizedStatements: Set<ParameterizedStatement>,
		deleteParameterizedStatements?: Set<ParameterizedStatement>,
	): Promise<void> {
		await this.db.transaction(tx => {
			for (const [statement, params] of saveParameterizedStatements) {
				tx.executeSql(statement, params);
			}
		});
		if (deleteParameterizedStatements) {
			await this.db.transaction(tx => {
				for (const [statement, params] of deleteParameterizedStatements) {
					tx.executeSql(statement, params);
				}
			});
		}
	}

	public async selectAndDelete<T = any>(
		queryParameterizedStatement: ParameterizedStatement,
		deleteParameterizedStatement: ParameterizedStatement,
	): Promise<T[]> {
		let results: T[] = [];

		const [queryStatement, queryParams] = queryParameterizedStatement;
		const [deleteStatement, deleteParams] = deleteParameterizedStatement;

		await this.db.transaction(tx => {
			tx.executeSql(
				queryStatement,
				queryParams,
				(_, res) => {
					results = res.rows.raw();
				},
				logger.warn,
			);
			tx.executeSql(
				deleteStatement,
				deleteParams,
				() => {
					// no-op
				},
				logger.warn,
			);
		});

		return results;
	}

	private async executeStatements(statements: string[]): Promise<void> {
		await this.db.transaction(tx => {
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
			this.db = undefined;
		}
	}
}

export default SQLiteDatabase;
