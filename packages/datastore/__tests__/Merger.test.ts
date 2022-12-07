import { ModelMerger } from '../src/sync/merger';
import { PersistentModelConstructor } from '../src/';
import {
	DataStore as DataStoreType,
	initSchema as initSchemaType,
} from '../src/datastore/datastore';
import {
	Model as ModelType,
	PostCustomPK as PostCustomPKType,
	testSchema,
} from './helpers';

let initSchema: typeof initSchemaType;
let DataStore: typeof DataStoreType;
let Storage: any;
const ownSymbol = Symbol('sync');

describe('Merger', () => {
	describe('ModelMerger tests with id', () => {
		let modelMerger: ModelMerger;
		let Model: PersistentModelConstructor<InstanceType<typeof ModelType>>;
		const testUserSchema = testSchema();
		const modelDefinition = testUserSchema.models.Model;
		describe('mergePage', () => {
			beforeAll(async () => {
				({ initSchema, DataStore } = require('../src/datastore/datastore'));
				({ Model } = initSchema(testUserSchema) as {
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
						_deleted: null!,
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
					await modelMerger.mergePage(storage, Model, items, modelDefinition);
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
						_deleted: null!,
					},
					{
						id: modelId,
						field1: 'Update',
						optionalField1: null,
						_version: 2,
						_lastChangedAt: 1619627619017,
						_deleted: null!,
					},
					{
						id: modelId,
						field1: 'Another Update',
						optionalField1: 'Optional',
						_version: 2,
						_lastChangedAt: 1619627621329,
						_deleted: null!,
					},
				];

				await Storage.runExclusive(async storage => {
					await modelMerger.mergePage(storage, Model, items, modelDefinition);
				});

				const record = await DataStore.query(Model, modelId);

				expect(record!.field1).toEqual('Another Update');
				expect(record!.optionalField1).toEqual('Optional');
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
						_deleted: null!,
					},
					{
						id: modelId,
						field1: 'Create',
						optionalField1: null,
						_version: 2,
						_lastChangedAt: 1619627619017,
						_deleted: true!,
					},
					{
						id: modelId,
						field1: 'New Create with the same id',
						optionalField1: null,
						_version: 1,
						_lastChangedAt: 1619627621329,
						_deleted: null!,
					},
				];

				await Storage.runExclusive(async storage => {
					await modelMerger.mergePage(storage, Model, items, modelDefinition);
				});

				const record = await DataStore.query(Model, modelId);

				expect(record).not.toBeUndefined();
				expect(record!.field1).toEqual('New Create with the same id');
			});
		});
	});

	describe('ModelMerger tests with Custom PK', () => {
		let modelMerger: ModelMerger;
		let PostCustomPK;
		const testUserSchema = testSchema();
		const modelDefinition = testUserSchema.models.PostCustomPK;
		describe('mergePage', () => {
			beforeAll(async () => {
				({ initSchema, DataStore } = require('../src/datastore/datastore'));
				({ PostCustomPK } = initSchema(testUserSchema) as {
					PostCustomPK: PersistentModelConstructor<PostCustomPKType>;
				});

				await DataStore.start();

				// mergePage doesn't rely on the outbox, so it doesn't need to be mocked
				const outbox = (() => {}) as any;

				Storage = (DataStore as any).storage;
				modelMerger = new ModelMerger(outbox, ownSymbol);
			});

			test('delete after create should result in delete', async () => {
				const customPk = 'ce408429-d667-4606-bb4f-3d7e0a8e5939';

				const items = [
					{
						postId: customPk,
						title: 'Create1',
						description: null,
						_version: 1,
						_lastChangedAt: 1619627611860,
						_deleted: null!,
					},
					{
						postId: customPk,
						title: 'Create1',
						description: null,
						_version: 2,
						_lastChangedAt: 1619627619017,
						_deleted: true,
					},
				];

				await Storage.runExclusive(async storage => {
					await modelMerger.mergePage(
						storage,
						PostCustomPK,
						items,
						modelDefinition
					);
				});

				const record = await DataStore.query(PostCustomPK, customPk);

				expect(record).toBeUndefined();
			});

			test('update after create should persist data from update', async () => {
				const customPk = '15739024-910d-4c1e-b401-65f5f7838f43';

				const items = [
					{
						postId: customPk,
						title: 'Create1',
						description: null,
						_version: 1,
						_lastChangedAt: 1619627611860,
						_deleted: null!,
					},
					{
						postId: customPk,
						title: 'Update1',
						description: null,
						_version: 2,
						_lastChangedAt: 1619627619017,
						_deleted: null!,
					},
					{
						postId: customPk,
						title: 'Another Update1',
						description: 'Optional1',
						_version: 2,
						_lastChangedAt: 1619627621329,
						_deleted: null!,
					},
				];

				await Storage.runExclusive(async storage => {
					await modelMerger.mergePage(
						storage,
						PostCustomPK,
						items,
						modelDefinition
					);
				});

				const record = await DataStore.query(PostCustomPK, customPk);

				expect(record!.title).toEqual('Another Update1');
				expect(record!.description).toEqual('Optional1');
			});

			test('create > delete > create => create', async () => {
				const customPk = '3d2d9d63-a561-4a29-af29-fd4ef465a5eg';

				const items = [
					{
						postId: customPk,
						title: 'Create1',
						description: null,
						_version: 1,
						_lastChangedAt: 1619627611860,
						_deleted: null!,
					},
					{
						postId: customPk,
						title: 'Create1',
						description: null,
						_version: 2,
						_lastChangedAt: 1619627619017,
						_deleted: true,
					},
					{
						postId: customPk,
						title: 'New Create with the same custom pk',
						description: null,
						_version: 1,
						_lastChangedAt: 1619627621329,
						_deleted: null!,
					},
				];

				await Storage.runExclusive(async storage => {
					await modelMerger.mergePage(
						storage,
						PostCustomPK,
						items,
						modelDefinition
					);
				});

				const record = await DataStore.query(PostCustomPK, customPk);

				expect(record).not.toBeUndefined();
				expect(record!.title).toEqual('New Create with the same custom pk');
			});
		});
	});
});
