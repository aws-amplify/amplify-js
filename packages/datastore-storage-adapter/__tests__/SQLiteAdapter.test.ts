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

let initSchema: typeof initSchemaType;
let DataStore: typeof DataStoreType;

describe('SQLiteAdapter', () => {
	let Comment: PersistentModelConstructor<Comment>;
	let Model: PersistentModelConstructor<Model>;
	let Post: PersistentModelConstructor<Post>;

	beforeEach(async () => {
		({ initSchema, DataStore } = require('../src/datastore/datastore'));
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
		const adapter = (DataStore as any).storageAgapter as any;
		expect(adapter).toBe(SQLiteAdapter);

		const adapterSaveSpy = spyOn(SQLiteAdapter, 'save');
		const adapterQuerySpy = spyOn(SQLiteAdapter, 'query');

		const saved = await DataStore.save(
			new Model({
				field1: 'some value',
				dateCreated: new Date().toISOString(),
			})
		);
		const retrieved = await DataStore.query(Model, saved.id);

		expect(saved.id).toBeTruthy();
		expect(retrieved).toEqual(saved);
		expect(adapterSaveSpy).toBeCalled();
		expect(adapterQuerySpy).toBeCalled();
	});

	// describe('save', () => {
	// 	test('can save a basic model', async () => {
	// 		await DataStore.save()
	// 	});
	// });
});
