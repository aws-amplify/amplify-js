import { ModelMerger } from '../src/sync/merger';
import { PersistentModelConstructor } from '../src/';
import {
	DataStore as DataStoreType,
	initSchema as initSchemaType,
} from '../src/datastore/datastore';
import { Model as ModelType, testSchema } from './__utils__/helpers';

let initSchema: typeof initSchemaType;
let DataStore: typeof DataStoreType;
let Storage: any;
const ownSymbol = Symbol('sync');

describe('ModelMerger tests', () => {
	let modelMerger: ModelMerger;
	let Model: PersistentModelConstructor<InstanceType<typeof ModelType>>;

	describe('mergePage', () => {
		beforeAll(async () => {
			({ initSchema, DataStore } = require('../src/datastore/datastore'));
			({ Model } = initSchema(testSchema()) as {
				Model: PersistentModelConstructor<ModelType>;
			});

			await DataStore.start();

			// mergePage doesn't rely on the outbox, so it doesn't need to be mocked
			const outbox = (() => {}) as any;

			Storage = (DataStore as any).storage;
			modelMerger = new ModelMerger(outbox, ownSymbol);
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

			await Storage.runExclusive(async storage => {
				await modelMerger.mergePage(storage, Model, items);
			});

			const record = await DataStore.query(Model, modelId);

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

			await Storage.runExclusive(async storage => {
				await modelMerger.mergePage(storage, Model, items);
			});

			const record = await DataStore.query(Model, modelId);

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
					field1: 'New Create with the same id',
					optionalField1: null,
					_version: 1,
					_lastChangedAt: 1619627621329,
					_deleted: null,
				},
			];

			await Storage.runExclusive(async storage => {
				await modelMerger.mergePage(storage, Model, items);
			});

			const record = await DataStore.query(Model, modelId);

			expect(record).not.toBeUndefined();
			expect(record.field1).toEqual('New Create with the same id');
		});
	});
});
