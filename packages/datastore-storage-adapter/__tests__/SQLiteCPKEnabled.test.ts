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

describe('SQLite SPK Enabled', () => {
	test('logs error when schema is generated with targetNames (cpk enabled)', async () => {
		console.error = jest.fn();
		const { initSchema, DataStore } = require('@aws-amplify/datastore');
		DataStore.configure({
			storageAdapter: SQLiteAdapter,
		});
		console.log(JSON.stringify(testSchema(), null, 2));
		initSchema({
			...testSchema(),
			models: {
				Post: {
					name: 'Post',
					fields: {
						id: {
							name: 'id',
							isArray: false,
							type: 'ID',
							isRequired: true,
							attributes: [],
						},
						title: {
							name: 'title',
							isArray: false,
							type: 'String',
							isRequired: true,
							attributes: [],
						},
						comments: {
							name: 'comments',
							isArray: true,
							type: {
								model: 'Comment',
							},
							isRequired: true,
							attributes: [],
							isArrayNullable: true,
							association: {
								connectionType: 'HAS_MANY',
								associatedWith: 'postId',
							},
						},
					},
					syncable: true,
					pluralName: 'Posts',
					attributes: [
						{
							type: 'model',
							properties: {},
						},
					],
				},
				Comment: {
					name: 'Comment',
					fields: {
						id: {
							name: 'id',
							isArray: false,
							type: 'ID',
							isRequired: true,
							attributes: [],
						},
						content: {
							name: 'content',
							isArray: false,
							type: 'String',
							isRequired: true,
							attributes: [],
						},
						post: {
							name: 'post',
							isArray: false,
							type: {
								model: 'Post',
							},
							isRequired: false,
							attributes: [],
							association: {
								connectionType: 'BELONGS_TO',
								targetNames: ['postId'],
							},
						},
					},
					syncable: true,
					pluralName: 'Comments',
					attributes: [
						{
							type: 'model',
							properties: {},
						},
						{
							type: 'key',
							properties: {
								name: 'byPost',
								fields: ['postId'],
							},
						},
					],
				},
			},
		});
		await DataStore.start();
		expect((console.error as any).mock.calls[0][0]).toMatch(
			'The SQLite adapter does not support schemas using custom primary key. Set `graphQLTransformer.respectPrimaryKeyAttributesOnConnectionField in `amplify/cli.json` to false to disable custom primary key. Then, to properly regenerate your API, add an empty newline to your GraphQL schema and run `amplify push`.'
		);
	});
});
