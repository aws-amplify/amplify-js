/*
 * SQLiteCPKDisabled.test.ts and SQLiteCPKEnabled.test.ts exist in two separate
 * files in order to test DataStore with two separate schemas.
 * jest.isolateModules was not correctly isolating the instances of DataStore
 * resulting in the DataStore singleton being shared between the tests.
 * The schema can only be initialized once in DataStore, making it impossible to
 * test the effect of different schemas.
 *
 * Both files should be removed when CPK support is added.
 */
import sqlite3 from 'sqlite3';
sqlite3.verbose();
import Observable from 'zen-observable';
import SQLiteAdapter from '../src/SQLiteAdapter/SQLiteAdapter';
import { testSchema } from './helpers';
import { initSchema, DataStore } from '@aws-amplify/datastore';

jest.mock('@aws-amplify/datastore/src/sync/datastoreConnectivity', () => {
	return {
		status: () => Observable.of(false) as any,
		unsubscribe: () => {},
		socketDisconnected: () => {},
	};
});

jest.mock('react-native-sqlite-storage', () => {
	return {
		async openDatabase(name, version, displayname, size) {
			return new InnerSQLiteDatabase();
		},
		async deleteDatabase(name) {},
		enablePromise(enabled) {},
		DEBUG(debug) {},
	};
});

const sqlog = [];

/**
 * A lower-level SQLite wrapper to test SQLiteAdapter against.
 * It's intended to be fast, using an in-memory database.
 */
class InnerSQLiteDatabase {
	private innerDB;

	constructor() {
		this.innerDB = new sqlite3.Database(':memory:');
	}

	async executeSql(
		statement,
		params: any[] = [],
		callback: ((...args) => Promise<any>) | undefined = undefined,
		logger = undefined
	) {
		sqlog.push(`${statement}; ${JSON.stringify(params)}`);
		if (statement.trim().toLowerCase().startsWith('select')) {
			return new Promise(async resolve => {
				const rows: any[] = [];
				const resultSet = {
					rows: {
						get length() {
							return rows.length;
						},
						raw: () => rows,
					},
				};

				await this.innerDB.each(
					statement,
					params,
					async (err, row) => {
						if (err) {
							console.error('SQLite ERROR', new Error(err));
							console.warn(statement, params);
						}
						rows.push(row);
					},
					() => {
						resolve([resultSet]);
					}
				);

				if (typeof callback === 'function') await callback(this, resultSet);
			});
		} else {
			return await this.innerDB.run(statement, params, err => {
				if (typeof callback === 'function') {
					callback(err);
				} else if (err) {
					console.error('calback', err);
					throw err;
				}
			});
		}
	}

	async transaction(fn) {
		return this.innerDB.serialize(await fn(this));
	}

	async readTransaction(fn) {
		return this.innerDB.serialize(await fn(this));
	}

	async close() {}
}

describe('SQLite CPK Disabled', () => {
	test('does not log error when schema is generated with targetName (cpk disabled)', async () => {
		console.error = jest.fn();
		const { initSchema, DataStore } = require('@aws-amplify/datastore');
		DataStore.configure({
			storageAdapter: SQLiteAdapter,
		});
		initSchema(testSchema());
		await DataStore.start();
		expect(console.error as any).not.toHaveBeenCalled();
	});
});
