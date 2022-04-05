import sqlite3 from 'sqlite3';
sqlite3.verbose();

// TODO: move into generalized test suite helper?
jest.mock('react-native-sqlite-storage', () => {
	class SQLiteDatabase {
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
			console.log('executeSql', statement, params, callback);
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
							console.log('rows', rows);
							resolve([resultSet]);
						}
					);
				});
			} else {
				return await this.innerDB.run(statement, params, callback);
			}
		}

		async transaction(fn) {
			console.log('transaction', fn);
			return this.innerDB.serialize(await fn(this));
		}

		async readTransaction(fn) {
			console.log('readTransaction', fn);
			return this.innerDB.serialize(await fn(this));
		}

		async close() {}
	}

	return {
		async openDatabase(name, version, displayname, size) {
			return new SQLiteDatabase();
		},
		async deleteDatabase(name) {},
		enablePromise(enabled) {},
		DEBUG(debug) {},
	};
});

import { SQLiteAdapter } from '../src';
import {
	DataStore as DataStoreType,
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
import SQLiteDatabase from '../src/SQLiteAdapter/SQLiteDatabase';

let initSchema: typeof initSchemaType;
let DataStore: typeof DataStoreType;

describe('SQLiteAdapter', () => {
	let Comment: PersistentModelConstructor<Comment>;
	let Model: PersistentModelConstructor<Model>;
	let Post: PersistentModelConstructor<Post>;

	beforeEach(async () => {
		({ initSchema, DataStore } = require('@aws-amplify/datastore'));
		DataStore.configure({
			storageAdapter: SQLiteAdapter,
		});
		const classes = initSchema(testSchema());
		({ Comment, Model, Post } = classes as {
			Comment: PersistentModelConstructor<Comment>;
			Model: PersistentModelConstructor<Model>;
			Post: PersistentModelConstructor<Post>;
		});
		await DataStore.clear();
	});

	test('is being used in SQLite test suite (sanity check)', async () => {
		const adapter = (DataStore as any).storageAdapter as any;
		expect(adapter.constructor.name).toEqual('SQLiteAdapter');

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

	// describe('save', () => {
	// 	test('can save a basic model', async () => {
	// 		await DataStore.save()
	// 	});
	// });
});
