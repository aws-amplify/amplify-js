import AsyncStorageDatabase from '../src/storage/adapter/AsyncStorageDatabase';
import AsyncStorageAdapter from '../src/storage/adapter/AsyncStorageAdapter';
import {
	DataStore as DataStoreType,
	initSchema as initSchemaType,
} from '../src/datastore/datastore';
import { testSchema } from './helpers';

let initSchema: typeof initSchemaType;
let DataStore: typeof DataStoreType;
// using any to get access to private methods
let asyncStorageAdapter = <any>AsyncStorageAdapter;
const storeName = 'Model';

describe('AsyncStorageDatabase tests', () => {
	describe('batchSave', () => {
		let db: AsyncStorageDatabase;

		beforeAll(async () => {
			({ initSchema, DataStore } = require('../src/datastore/datastore'));
			initSchema(testSchema());

			await DataStore.start();

			asyncStorageAdapter = (DataStore as any).storage.storage.adapter;
			({ db } = asyncStorageAdapter);
		});

		afterAll(async () => {
			await db.clear();
		});
		test('delete after create should result in delete', async () => {
			const modelId = 'ce408429-d667-4606-bb4f-3d7e0a8e5938';

			const items = [
				{
					id: modelId,
					field1: 'Create',
					optionalField1: null,
					_version: 1,
					_lastChangedAt: 1619627611860,
					_deleted: null,
				},
				{
					id: modelId,
					field1: 'Create',
					optionalField1: null,
					_version: 2,
					_lastChangedAt: 1619627619017,
					_deleted: true,
				},
			];

			await db.batchSave(storeName, items);

			const record = await db.get(modelId, storeName);

			expect(record).toBeUndefined();
		});

		test('update after create should persist data from update', async () => {
			const modelId = '15739024-910d-4c1e-b401-65f5f7838f42';

			const items = [
				{
					id: modelId,
					field1: 'Create',
					optionalField1: null,
					_version: 1,
					_lastChangedAt: 1619627611860,
					_deleted: null,
				},
				{
					id: modelId,
					field1: 'Update',
					optionalField1: null,
					_version: 2,
					_lastChangedAt: 1619627619017,
					_deleted: null,
				},
				{
					id: modelId,
					field1: 'Another Update',
					optionalField1: 'Optional',
					_version: 2,
					_lastChangedAt: 1619627621329,
					_deleted: null,
				},
			];

			await db.batchSave(storeName, items);

			const record = await db.get(modelId, storeName);

			expect(record.field1).toEqual('Another Update');
			expect(record.optionalField1).toEqual('Optional');
		});

		test('create > delete > create => create', async () => {
			const modelId = '3d2d9d63-a561-4a29-af29-fd4ef465a5ee';

			const items = [
				{
					id: modelId,
					field1: 'Create',
					optionalField1: null,
					_version: 1,
					_lastChangedAt: 1619627611860,
					_deleted: null,
				},
				{
					id: modelId,
					field1: 'Create',
					optionalField1: null,
					_version: 2,
					_lastChangedAt: 1619627619017,
					_deleted: true,
				},
				{
					id: modelId,
					field1: 'Create',
					optionalField1: null,
					_version: 1,
					_lastChangedAt: 1619627621329,
					_deleted: null,
				},
			];

			await db.batchSave(storeName, items);

			const record = await db.get(modelId, storeName);

			expect(record.field1).toEqual('Create');
		});
	});
});
