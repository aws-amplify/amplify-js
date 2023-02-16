import sqlite3 from 'sqlite3';
sqlite3.verbose();

import SQLiteAdapter from '../src/SQLiteAdapter/SQLiteAdapter';
import SQLiteDatabase from '../src/SQLiteAdapter/SQLiteDatabase';
import { ParameterizedStatement } from '../src/common/types';
import {
	DataStore as DataStoreType,
	StorageAdapter,
	PersistentModelConstructor,
	initSchema as initSchemaType,
} from '@aws-amplify/datastore';
import { Model, Post, Comment, testSchema } from './helpers';
import { SyncEngine } from '@aws-amplify/datastore/lib-esm/sync';
import Observable from 'zen-observable';
import {
	pause,
	addCommonQueryTests,
} from '../../datastore/__tests__/commonAdapterTests';

jest.mock('@aws-amplify/datastore/src/sync/datastoreConnectivity', () => {
	return {
		status: () => Observable.of(false) as any,
		unsubscribe: () => {},
		socketDisconnected: () => {},
	};
});

// TODO: move into generalized test suite helper?
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

let initSchema: typeof initSchemaType;
let DataStore: typeof DataStoreType;
let sqlog: any[];

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

describe('SQLiteAdapter', () => {
	let Comment: PersistentModelConstructor<Comment>;
	let Model: PersistentModelConstructor<Model>;
	let Post: PersistentModelConstructor<Post>;
	let syncEngine: SyncEngine;
	sqlog = [];

	/**
	 * Gets all mutations currently in the outbox. This should include ALL
	 * mutations created/merged, because this test group starts the sync engine,
	 * but prevents it from syncing/clearing the outbox.
	 */
	async function getMutations() {
		await pause(250);
		const adapter = (DataStore as any).storageAdapter;
		const db = (adapter as any).db;
		return await db.getAll('select * from MutationEvent', []);
	}

	async function clearOutbox() {
		await pause(250);
		const adapter = (DataStore as any).storageAdapter;
		const db = (adapter as any).db;
		return await db.executeStatements(['delete from MutationEvent']);
	}

	({ initSchema, DataStore } = require('@aws-amplify/datastore'));
	addCommonQueryTests({
		initSchema,
		DataStore: DataStore as any,
		storageAdapter: SQLiteAdapter,
		getMutations,
		clearOutbox,
	});

	describe('something', () => {
		let adapter: StorageAdapter;
		let db: SQLiteDatabase;

		beforeEach(async () => {
			DataStore.configure({
				storageAdapter: SQLiteAdapter,
			});
			(DataStore as any).amplifyConfig.aws_appsync_graphqlEndpoint =
				'https://0.0.0.0/does/not/exist/graphql';
			const classes = initSchema(testSchema());
			({ Comment, Model, Post } = classes as {
				Comment: PersistentModelConstructor<Comment>;
				Model: PersistentModelConstructor<Model>;
				Post: PersistentModelConstructor<Post>;
			});
			await DataStore.clear();

			// start() ensures storageAdapter is set
			await DataStore.start();

			adapter = (DataStore as any).storageAdapter;
			db = (adapter as any).db;
			syncEngine = (DataStore as any).sync;

			// my jest spy-fu wasn't up to snuff here. but, this succesfully
			// prevents the mutation process from clearing the mutation queue, which
			// allows us to observe the state of mutations.
			(syncEngine as any).mutationsProcessor.isReady = () => false;

			sqlog = [];
		});

		describe('sanity checks', () => {
			it('is set as the adapter SQLite tests', async () => {
				expect(adapter.constructor.name).toEqual('CommonSQLiteAdapter');
			});

			it('is logging SQL statements during normal operation', async () => {
				await DataStore.query(Post);
				expect(sqlog.length).toBeGreaterThan(0);
			});

			it('can batchSave', async () => {
				const saves = new Set<ParameterizedStatement>();
				saves.add([
					`insert into "Model" (
						"field1",
						"dateCreated",
						"emails",
						"id",
						"_version",
						"_lastChangedAt",
						"_deleted"
					) VALUES (?, ?, ?, ?, ?, ?, ?)`,
					[
						'field1 value 0',
						'2022-04-18T19:29:46.316Z',
						[],
						'a1d63606-bd3b-4641-870a-ac97694577a8',
						null,
						null,
						null,
					],
				]);
				await db.batchSave(saves);
				const result = await db.get('select * from "Model" limit 1', []);
				expect(result.id).toEqual('a1d63606-bd3b-4641-870a-ac97694577a8');
			});

			it('can batchQuery', async () => {
				await db.save(
					`insert into "Model" (
					"field1",
					"dateCreated",
					"emails",
					"id",
					"_version",
					"_lastChangedAt",
					"_deleted"
				) VALUES (?, ?, ?, ?, ?, ?, ?)`,
					[
						'field1 value 0',
						'2022-04-18T19:29:46.316Z',
						'abcd@abcd.com',
						'a1d63606-bd3b-4641-870a-ac97694577a8',
						null!,
						null!,
						null!,
					]
				);

				const queries = new Set<ParameterizedStatement>();
				queries.add([
					'select * from "Model" where id = ? limit 1',
					['a1d63606-bd3b-4641-870a-ac97694577a8'],
				]);
				const result = await db.batchQuery(queries);

				expect(result.length).toBe(1);
			});
		});
	});
});
