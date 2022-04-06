import sqlite3 from 'sqlite3';
sqlite3.verbose();

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
		// console.log('executeSql', statement, params, callback);
		sqlog.push(`${statement} : ${JSON.stringify(params)}`);
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
						// console.log('rows', rows);
						resolve([resultSet]);
					}
				);
			});
		} else {
			return await this.innerDB.run(statement, params, callback);
		}
	}

	async transaction(fn) {
		// console.log('transaction', fn);
		return this.innerDB.serialize(await fn(this));
	}

	async readTransaction(fn) {
		// console.log('readTransaction', fn);
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

let initSchema: typeof initSchemaType;
let DataStore: typeof DataStoreType;
let sqlog: any[];

describe('SQLiteAdapter', () => {
	let Comment: PersistentModelConstructor<Comment>;
	let Model: PersistentModelConstructor<Model>;
	let Post: PersistentModelConstructor<Post>;
	let adapter: StorageAdapter;
	let db: SQLiteDatabase;
	let syncEngine: SyncEngine;
	sqlog = [];

	beforeEach(async () => {
		console.log('BEFORE EACH!');
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
		adapter = (DataStore as any).storageAdapter;
		db = (adapter as any).db;
		syncEngine = (DataStore as any).sync;
		await DataStore.clear();
	});

	test('is being used in SQLite test suite (sanity check)', async () => {
		expect(adapter.constructor.name).toEqual('SQLiteAdapter');
	});

	test('can manage a basic model', async () => {
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

	test.only('can manage related models, where parent is saved first', async done => {
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

		const updatedPost = await DataStore.save(
			Post.copyOf(post, draft => {
				draft.title = 'updated title';
			})
		);

		setTimeout(async () => {
			// const mutations = await db.getAll('select * from MutationEvent', []);
			// console.log('mutations', mutations);
			console.log('sqlog', sqlog.join('\n'));
			// expect(mutations.length).toBe(2);
			done();
		}, 250);
	});
});
