import Dexie from 'dexie';
import 'dexie-export-import';
import 'fake-indexeddb/auto';
import * as idb from 'idb';
import {
	initSchema,
	ModelInit,
	MutableModel,
	PersistentModelConstructor,
	DataStore,
} from '../src/index';
import { Schema } from '../src/types';

const DB_VERSION = 3;

let db: idb.IDBPDatabase;
const indexedDB = require('fake-indexeddb');
const IDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');
Dexie.dependencies.indexedDB = indexedDB;
Dexie.dependencies.IDBKeyRange = IDBKeyRange;

/* 
	This schema has only one of the models that exists in the v1 schema we're upgrading from
	below './v1schema.data.json'

	Previously, this would cause an error in the IDB upgrade process
	This test validates that the db upgrade works as expected
*/
const schema: Schema = {
	models: {
		Blog: {
			syncable: true,
			name: 'Blog',
			pluralName: 'Blogs',
			fields: {
				id: {
					name: 'id',
					isArray: false,
					type: 'ID',
					isRequired: true,
					attributes: [],
				},
			},
			attributes: [
				{
					type: 'model',
					properties: {},
				},
			],
		},
	},
	enums: {},
	nonModels: {},
	version: 'a66372d29356c40e7cd29e41527cead7',
	codegenVersion: '3.2.0',
};

declare class BlogModel {
	readonly id: string;
	readonly name: string;
	constructor(init: ModelInit<BlogModel>);
	static copyOf(
		source: BlogModel,
		mutator: (draft: MutableModel<BlogModel>) => MutableModel<BlogModel> | void
	): BlogModel;
}

initSchema(schema) as {
	Blog: PersistentModelConstructor<BlogModel>;
};

describe('DB versions migration with destructive schema change', () => {
	beforeEach(async () => {
		await DataStore.clear();
	});

	test(`Migration from v1 to v${DB_VERSION}`, async () => {
		const v1Data = require('./v1schema.data.json');

		const blob = new Blob([JSON.stringify(v1Data)], {
			type: 'application/json',
		});

		// Import V1
		(await Dexie.import(blob)).close();

		// Migrate to latest
		await DataStore.start();

		// Open latest
		db = await idb.openDB('amplify-datastore', DB_VERSION);

		expect(db.objectStoreNames.length).toBeGreaterThan(0);

		for (const storeName of db.objectStoreNames) {
			expect(db.transaction(storeName).store.indexNames).toContain('byPk');
		}

		const dexie = await new Dexie('amplify-datastore').open();
		const exportedBlob = await dexie.export();

		function readBlob(blob: Blob): Promise<string> {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onabort = ev => reject(new Error('file read aborted'));
				reader.onerror = ev => reject((ev.target as any).error);
				reader.onload = ev => resolve((ev.target as any).result);
				reader.readAsText(blob);
			});
		}

		const exportedJSON = await readBlob(exportedBlob);
		const exported = JSON.parse(exportedJSON);

		for (const { schema } of exported.data.tables) {
			expect(schema.split(',')).toContain('&[id]');
		}

		expect(exported).toMatchSnapshot(`v${DB_VERSION}-destructive-schema`);
	});
});
