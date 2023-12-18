import { from } from 'rxjs';

import { Predicates } from '../../src/predicates';
import {
	DataStore as DataStoreType,
	initSchema as initSchemaType,
} from '../../src/datastore/datastore';
import { PersistentModel, PersistentModelConstructor } from '../../src/types';
import { Model, testSchema, getDataStore } from '../helpers';

let initSchema: typeof initSchemaType;

let { DataStore } = getDataStore() as {
	DataStore: typeof DataStoreType;
};

/**
 * Does nothing intentionally, we care only about type checking
 */
const expectType: <T>(param: T) => void = () => {};

describe('Type definitions', () => {
	let Model: PersistentModelConstructor<Model>;

	beforeEach(() => {
		let model: Model;

		jest.resetModules();
		jest.doMock('../../src/storage/storage', () => {
			const mock = jest.fn().mockImplementation(() => ({
				init: jest.fn(),
				runExclusive: jest.fn(() => [model]),
				query: jest.fn(() => [model]),
				observe: jest.fn(() => from([])),
				clear: jest.fn(),
			}));

			(<any>mock).getNamespace = () => ({ models: {} });

			return { ExclusiveStorage: mock };
		});
		({ initSchema, DataStore } = require('../../src/datastore/datastore'));

		const classes = initSchema(testSchema());

		({ Model } = classes as { Model: PersistentModelConstructor<Model> });

		model = new Model({
			field1: 'Some value',
			dateCreated: new Date().toISOString(),
		});
	});

	describe('Query', () => {
		test('all', async () => {
			const allModels = await DataStore.query(Model);
			expectType<Model[]>(allModels);
			const [one] = allModels;
			expect(one.field1).toBeDefined();
			expect(one).toBeInstanceOf(Model);
		});
		test('one by id', async () => {
			const oneModelById = await DataStore.query(Model, 'someid');
			expectType<Model | undefined>(oneModelById);
			expect(oneModelById?.field1).toBeDefined();
			expect(oneModelById).toBeInstanceOf(Model);
		});
		test('with criteria', async () => {
			const multiModelWithCriteria = await DataStore.query(Model, c =>
				c.field1.contains('something')
			);
			expectType<Model[]>(multiModelWithCriteria);
			const [one] = multiModelWithCriteria;
			expect(one.field1).toBeDefined();
			expect(one).toBeInstanceOf(Model);
		});
		test('with identity function criteria', async () => {
			const multiModelWithCriteria = await DataStore.query(Model, c => c);
			expectType<Model[]>(multiModelWithCriteria);
			const [one] = multiModelWithCriteria;
			expect(one.field1).toBeDefined();
			expect(one).toBeInstanceOf(Model);
		});
		test('with pagination', async () => {
			const allModelsPaginated = await DataStore.query(Model, Predicates.ALL, {
				page: 0,
				limit: 20,
			});
			expectType<Model[]>(allModelsPaginated);
			const [one] = allModelsPaginated;
			expect(one.field1).toBeDefined();
			expect(one).toBeInstanceOf(Model);
		});
	});

	describe('Query with generic type', () => {
		test('all', async () => {
			const allModels = await DataStore.query<Model>(Model);
			expectType<Model[]>(allModels);
			const [one] = allModels;
			expect(one.field1).toBeDefined();
			expect(one).toBeInstanceOf(Model);
		});
		test('one by id', async () => {
			const oneModelById = await DataStore.query<Model>(Model, 'someid');
			expectType<Model | undefined>(oneModelById);
			expect(oneModelById?.field1).toBeDefined();
			expect(oneModelById).toBeInstanceOf(Model);
		});
		test('with criteria', async () => {
			const multiModelWithCriteria = await DataStore.query<Model>(Model, c =>
				c.field1.contains('something')
			);
			expectType<Model[]>(multiModelWithCriteria);
			const [one] = multiModelWithCriteria;
			expect(one.field1).toBeDefined();
			expect(one).toBeInstanceOf(Model);
		});
		test('with pagination', async () => {
			const allModelsPaginated = await DataStore.query<Model>(
				Model,
				Predicates.ALL,
				{ page: 0, limit: 20 }
			);
			expectType<Model[]>(allModelsPaginated);
			const [one] = allModelsPaginated;
			expect(one.field1).toBeDefined();
			expect(one).toBeInstanceOf(Model);
		});
	});

	describe('Observe', () => {
		test('subscribe to all models', async () => {
			DataStore.observe().subscribe(({ element, model }) => {
				expectType<PersistentModelConstructor<PersistentModel>>(model);
				expectType<PersistentModel>(element);
			});
		});
		test('subscribe to model instance', async () => {
			const model = new Model({
				field1: 'somevalue',
				dateCreated: new Date().toISOString(),
			});

			DataStore.observe(model).subscribe(({ element, model }) => {
				expectType<PersistentModelConstructor<Model>>(model);
				expectType<Model>(element);
			});
		});
		test('subscribe to model', async () => {
			DataStore.observe(Model).subscribe(({ element, model }) => {
				expectType<PersistentModelConstructor<Model>>(model);
				expectType<Model>(element);
			});
		});
		test('subscribe to model instance by id', async () => {
			DataStore.observe(Model, 'some id').subscribe(({ element, model }) => {
				expectType<PersistentModelConstructor<Model>>(model);
				expectType<Model>(element);
			});
		});
		test('subscribe to model with criteria', async () => {
			DataStore.observe(Model, c => c.field1.ne('somevalue')).subscribe(
				({ element, model }) => {
					expectType<PersistentModelConstructor<Model>>(model);
					expectType<Model>(element);
				}
			);
		});
	});

	describe('Observe with generic type', () => {
		test('subscribe to model instance', async () => {
			const model = new Model({
				field1: 'somevalue',
				dateCreated: new Date().toISOString(),
			});

			DataStore.observe<Model>(model).subscribe(({ element, model }) => {
				expectType<PersistentModelConstructor<Model>>(model);
				expectType<Model>(element);
			});
		});
		test('subscribe to model', async () => {
			DataStore.observe<Model>(Model).subscribe(({ element, model }) => {
				expectType<PersistentModelConstructor<Model>>(model);
				expectType<Model>(element);
			});
		});
		test('subscribe to model instance by id', async () => {
			DataStore.observe<Model>(Model, 'some id').subscribe(
				({ element, model }) => {
					expectType<PersistentModelConstructor<Model>>(model);
					expectType<Model>(element);
				}
			);
		});
		test('subscribe to model with criteria', async () => {
			DataStore.observe<Model>(Model, c => c.field1.ne('somevalue')).subscribe(
				({ element, model }) => {
					expectType<PersistentModelConstructor<Model>>(model);
					expectType<Model>(element);
				}
			);
		});
	});
});
