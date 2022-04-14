import sqlite3 from 'sqlite3';
sqlite3.verbose();

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
		params = [],
		callback = undefined,
		logger = undefined
	) {
		sqlog.push(`${statement}; ${JSON.stringify(params)}`);
		if (statement.trim().toLowerCase().startsWith('select')) {
			return new Promise(resolve => {
				const rows = [];

				this.innerDB.each(
					statement,
					params,
					async (err, row) => {
						rows.push(row);
						if (callback) await callback(this, row);
					},
					() => {
						const resultSet = {
							rows: {
								length: rows.length,
								raw: () => rows,
							},
						};
						resolve([resultSet]);
					}
				);
			});
		} else {
			return await this.innerDB.run(statement, params, callback);
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

import { SQLiteAdapter } from '../src';
import SQLiteDatabase from '../src/SQLiteAdapter/SQLiteDatabase';
import {
	DataStore as DataStoreType,
	StorageAdapter,
	InternalSchema,
	PersistentModelConstructor,
	QueryOne,
	SchemaModel,
	initSchema as initSchemaType,
} from '@aws-amplify/datastore';
import {
	Model,
	Post,
	Comment,
	testSchema,
	internalTestSchema,
} from './helpers';
import { SyncEngine } from '@aws-amplify/datastore/lib/sync';
import Observable from 'zen-observable';
// import DataStoreConnectivity from '@aws-amplify/datastore/src/sync/datastoreConnectivity';

jest.mock('@aws-amplify/datastore/src/sync/datastoreConnectivity', () => {
	return {
		status: () => Observable.of(false) as any,
		unsubscribe: () => {},
		socketDisconnected: () => {},
	};
});

let initSchema: typeof initSchemaType;
let DataStore: typeof DataStoreType;
let sqlog: any[];

/**
 * Convenience function to wait for a number of ms.
 *
 * Intended as a cheap way to wait for async operations to settle.
 *
 * @param ms number of ms to pause for
 */
async function pause(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

describe('SQLiteAdapter', () => {
	let Comment: PersistentModelConstructor<Comment>;
	let Model: PersistentModelConstructor<Model>;
	let Post: PersistentModelConstructor<Post>;
	let adapter: StorageAdapter;
	let db: SQLiteDatabase;
	let syncEngine: SyncEngine;
	sqlog = [];

	/**
	 * Creates the given number of models, with `field1` populated to
	 * `field1 value ${i}`.
	 *
	 * @param qty number of models to create. (default 3)
	 */
	async function addModels(qty = 3) {
		for (let i = 0; i < qty; i++) {
			await DataStore.save(
				new Model({
					field1: `field1 value ${i}`,
					dateCreated: new Date().toISOString(),
					emails: [],
				})
			);
		}
	}

	/**
	 * Gets all mutations currently in the outbox. This should include ALL
	 * mutations created/merged, because this test group starts the sync engine,
	 * but prevents it from syncing/clearing the outbox.
	 */
	async function getMutations() {
		await pause(250);
		return await db.getAll('select * from MutationEvent', []);
	}

	beforeEach(async () => {
		({ initSchema, DataStore } = require('@aws-amplify/datastore'));
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
			expect(adapter.constructor.name).toEqual('SQLiteAdapter');
		});

		it('is logging SQL statements during normal operation', async () => {
			// `start()`, which is called during `beforeEach`, should perform
			// a number of queries to create tables. the test adapter should
			// log these all to `sqlog`.
			expect(sqlog.length).toBeGreaterThan(0);
		});
	});

	describe('at a high level', () => {
		it('can manage a basic model', async () => {
			const saved = await DataStore.save(
				new Model({
					field1: 'some value',
					dateCreated: new Date().toISOString(),

					// why is storage adapter seeing this as a required field?
					emails: [],
				})
			);
			const retrieved = await DataStore.query(Model, saved.id);

			expect(saved.id).toBeTruthy();
			expect(retrieved).toEqual(saved);
		});

		it('can manage related models, where parent is saved first', async () => {
			const post = await DataStore.save(
				new Post({
					title: 'some post',
				})
			);

			const comment = await DataStore.save(
				new Comment({
					content: 'some comment',
					post,
				})
			);

			await DataStore.save(
				Comment.copyOf(comment, draft => {
					draft.content = 'updated content';
				})
			);

			const mutations = await getMutations();
			expect(mutations.length).toEqual(2);
		});

		it('should produce a mutation for a nested BELONGS_TO insert', async () => {
			await DataStore.save(
				new Comment({
					content: 'newly created comment',
					post: new Post({
						title: 'newly created post',
					}),
				})
			);

			const mutations = await getMutations();
			expect(mutations.length).toEqual(2);
		});
	});

	describe('query', () => {
		it('should match fields of any non-empty value for `("ne", undefined)`', async () => {
			const qty = 3;
			await addModels(qty);

			const results = await DataStore.query(Model, m =>
				m.field1('ne', undefined)
			);

			expect(results.length).toEqual(qty);
		});

		it('should match fields of any non-empty value for `("ne", null)`', async () => {
			const qty = 3;
			await addModels(qty);

			const results = await DataStore.query(Model, m => m.field1('ne', null));

			expect(results.length).toEqual(qty);
		});

		it('should NOT match fields of any non-empty value for `("eq", undefined)`', async () => {
			const qty = 3;
			await addModels(qty);

			const results = await DataStore.query(Model, m =>
				m.field1('eq', undefined)
			);

			expect(results.length).toEqual(0);
		});

		it('should NOT match fields of any non-empty value for `("eq", null)`', async () => {
			const qty = 3;
			await addModels(qty);

			const results = await DataStore.query(Model, m => m.field1('eq', null));

			expect(results.length).toEqual(0);
		});

		it('should NOT match fields of any non-empty value for `("gt", null)`', async () => {
			const qty = 3;
			await addModels(qty);
			const results = await DataStore.query(Model, m => m.field1('gt', null));
			expect(results.length).toEqual(0);
		});

		it('should NOT match fields of any non-empty value for `("ge", null)`', async () => {
			const qty = 3;
			await addModels(qty);
			const results = await DataStore.query(Model, m => m.field1('ge', null));
			expect(results.length).toEqual(0);
		});

		it('should NOT match fields of any non-empty value for `("lt", null)`', async () => {
			const qty = 3;
			await addModels(qty);
			const results = await DataStore.query(Model, m => m.field1('lt', null));
			expect(results.length).toEqual(0);
		});

		it('should NOT match fields of any non-empty value for `("le", null)`', async () => {
			const qty = 3;
			await addModels(qty);
			const results = await DataStore.query(Model, m => m.field1('le', null));
			expect(results.length).toEqual(0);
		});

		it('should NOT match fields of any non-empty value for `("gt", undefined)`', async () => {
			const qty = 3;
			await addModels(qty);
			const results = await DataStore.query(Model, m =>
				m.field1('gt', undefined)
			);
			expect(results.length).toEqual(0);
		});

		it('should NOT match fields of any non-empty value for `("ge", undefined)`', async () => {
			const qty = 3;
			await addModels(qty);
			const results = await DataStore.query(Model, m =>
				m.field1('ge', undefined)
			);
			expect(results.length).toEqual(0);
		});

		it('should NOT match fields of any non-empty value for `("lt", undefined)`', async () => {
			const qty = 3;
			await addModels(qty);
			const results = await DataStore.query(Model, m =>
				m.field1('lt', undefined)
			);
			expect(results.length).toEqual(0);
		});

		it('should NOT match fields of any non-empty value for `("le", undefined)`', async () => {
			const qty = 3;
			await addModels(qty);
			const results = await DataStore.query(Model, m =>
				m.field1('le', undefined)
			);
			expect(results.length).toEqual(0);
		});

		it('should match gt', async () => {
			await addModels(3);
			const results = await DataStore.query(Model, m =>
				m.field1('gt', 'field1 value 0')
			);
			expect(results.length).toEqual(2);
		});

		it('should match ge', async () => {
			await addModels(3);
			const results = await DataStore.query(Model, m =>
				m.field1('ge', 'field1 value 1')
			);
			expect(results.length).toEqual(2);
		});

		it('should match lt', async () => {
			await addModels(3);
			const results = await DataStore.query(Model, m =>
				m.field1('lt', 'field1 value 2')
			);
			expect(results.length).toEqual(2);
		});

		it('should match le', async () => {
			await addModels(3);
			const results = await DataStore.query(Model, m =>
				m.field1('le', 'field1 value 1')
			);
			expect(results.length).toEqual(2);
		});

		it('should match eq', async () => {
			await addModels(3);
			const results = await DataStore.query(Model, m =>
				m.field1('eq', 'field1 value 1')
			);
			expect(results.length).toEqual(1);
		});

		it('should match ne', async () => {
			await addModels(3);
			const results = await DataStore.query(Model, m =>
				m.field1('ne', 'field1 value 1')
			);
			expect(results.length).toEqual(2);
		});
	});
});
