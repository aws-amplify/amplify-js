import AsyncStorageAdapter from '../src/storage/adapter/AsyncStorageAdapter';
import {
	DataStore as DataStoreType,
	initSchema as initSchemaType,
} from '../src/datastore/datastore';
import { PersistentModelConstructor, SortDirection } from '../src/types';
import { Model, testSchema } from './helpers';
import { Predicates } from '../src/predicates';

let initSchema: typeof initSchemaType;
let DataStore: typeof DataStoreType;
// using any to get access to private methods
const ASAdapter = <any>AsyncStorageAdapter;

describe('AsyncStorageAdapter tests', () => {
	describe('Query', () => {
		let Model: PersistentModelConstructor<Model>;
		let model1Id: string;
		const spyOnGetOne = jest.spyOn(ASAdapter, 'getById');
		const spyOnGetAll = jest.spyOn(ASAdapter, 'getAll');
		const spyOnMemory = jest.spyOn(ASAdapter, 'inMemoryPagination');

		beforeAll(async () => {
			jest.doMock('../src/storage/adapter/getDefaultAdapter', () => {
				return () =>
					// we're returning a new instance of AsyncStorageAdapter in getDefaultAdapter/index.ts:13
					// adding a mock to return default instead, so that we can spy on its methods
					require('../src/storage/adapter/AsyncStorageAdapter').default;
			});

			({ initSchema, DataStore } = require('../src/datastore/datastore'));

			const classes = initSchema(testSchema());

			({ Model } = classes as {
				Model: PersistentModelConstructor<Model>;
			});

			({ id: model1Id } = await DataStore.save(
				new Model({
					field1: 'Some value',
					dateCreated: new Date().toISOString(),
				})
			));
			await DataStore.save(
				new Model({
					field1: 'another value',
					dateCreated: new Date().toISOString(),
				})
			);
			await DataStore.save(
				new Model({
					field1: 'a third value',
					dateCreated: new Date().toISOString(),
				})
			);
		});

		beforeEach(() => {
			jest.clearAllMocks();
		});

		it('Should call getById for query by id', async () => {
			const result = await DataStore.query(Model, model1Id);

			expect(result.field1).toEqual('Some value');
			expect(spyOnGetOne).toHaveBeenCalled();
			expect(spyOnGetAll).not.toHaveBeenCalled();
			expect(spyOnMemory).not.toHaveBeenCalled();
		});

		it('Should call getAll for query with a predicate', async () => {
			const results = await DataStore.query(Model, c =>
				c.field1('contains', 'value')
			);

			expect(results.length).toEqual(3);
			expect(spyOnGetAll).toHaveBeenCalled();
			expect(spyOnMemory).toHaveBeenCalled();
		});

		it('Should call getAll & inMemoryPagination for query with a predicate and sort', async () => {
			const results = await DataStore.query(
				Model,
				c => c.field1('contains', 'value'),
				{
					sort: s => s.dateCreated(SortDirection.DESCENDING),
				}
			);

			expect(results.length).toEqual(3);
			expect(results[0].field1).toEqual('a third value');
			expect(spyOnGetAll).toHaveBeenCalled();
			expect(spyOnMemory).toHaveBeenCalled();
		});

		it('Should call getAll & inMemoryPagination for query with sort', async () => {
			const results = await DataStore.query(Model, Predicates.ALL, {
				sort: s => s.dateCreated(SortDirection.DESCENDING),
			});

			expect(results.length).toEqual(3);
			expect(results[0].field1).toEqual('a third value');
			expect(spyOnGetAll).toHaveBeenCalled();
			expect(spyOnMemory).toHaveBeenCalled();
		});

		it('Should call getAll & inMemoryPagination for query with pagination but no sort or predicate', async () => {
			const results = await DataStore.query(Model, Predicates.ALL, {
				limit: 1,
			});

			expect(results.length).toEqual(1);
			expect(spyOnGetAll).toHaveBeenCalled();
			expect(spyOnMemory).toHaveBeenCalled();
		});

		it('Should call getAll for query without predicate and pagination', async () => {
			const results = await DataStore.query(Model);

			expect(results.length).toEqual(3);
			expect(spyOnGetAll).toHaveBeenCalled();
			expect(spyOnMemory).not.toHaveBeenCalled();
		});
	});
});
