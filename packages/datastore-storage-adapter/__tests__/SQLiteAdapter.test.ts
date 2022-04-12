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

	async function getMutations() {
		await pause(250);
		return await db.getAll('select * from MutationEvent', []);
	}

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

	test.only('can manage related models, where parent is saved first', async () => {
		sqlog.push('\n\nCREATING POST\n\n');

		const post = await DataStore.save(
			new Post({
				title: 'some post',
			})
		);

		sqlog.push('\n\nADDING COMMENT\n\n');
		const comment = await DataStore.save(
			new Comment({
				content: 'some comment',
				post,
			})
		);

		sqlog.push('\n\nUPDATING COMMENT\n\n');
		console.log('UPDATE CONTENT');
		const updatedComment = await DataStore.save(
			Comment.copyOf(comment, draft => {
				draft.content = 'updated content';
			})
		);

		sqlog.push('\n\nDONE\n\n');

		// console.log('mutations', mutations);
		// console.log('sqlog', sqlog.join('\n'));
		const mutations = await getMutations();
		console.log('mutations 1', mutations);
		expect(mutations.length).toBe(3);
	});

	it.only('should produce a mutation for a nested BELONGS_TO insert', async () => {
		const comment = await DataStore.save(
			new Comment({
				content: 'newly created comment',
				post: new Post({
					title: 'newly created post',
				}),
			})
		);

		const mutations = await getMutations();
		console.log('mutations 2', mutations);
		expect(mutations.length).toBe(2);
	});
});
