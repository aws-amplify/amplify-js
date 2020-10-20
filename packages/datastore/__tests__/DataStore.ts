import 'fake-indexeddb/auto';
import { decodeTime } from 'ulid';
import uuidValidate from 'uuid-validate';
import Observable from 'zen-observable-ts';
import {
	DataStore as DataStoreType,
	initSchema as initSchemaType,
} from '../src/datastore/datastore';
import { Predicates } from '../src/predicates';
import { ExclusiveStorage as StorageType } from '../src/storage/storage';
import {
	ModelInit,
	MutableModel,
	NonModelTypeConstructor,
	PersistentModel,
	PersistentModelConstructor,
	Schema,
} from '../src/types';

let initSchema: typeof initSchemaType;
let DataStore: typeof DataStoreType;

beforeEach(() => {
	jest.resetModules();

	jest.doMock('../src/storage/storage', () => {
		const mock = jest.fn().mockImplementation(() => ({
			init: jest.fn(),
			runExclusive: jest.fn(),
			query: jest.fn(() => []),
			observe: jest.fn(() => Observable.of()),
		}));

		(<any>mock).getNamespace = () => ({ models: {} });

		return { ExclusiveStorage: mock };
	});
	({ initSchema, DataStore } = require('../src/datastore/datastore'));
});

const nameOf = <T>(name: keyof T) => name;

/**
 * Does nothing intentionally, we care only about type checking
 */
const expectType: <T>(param: T) => void = () => {};

describe('DataStore tests', () => {
	describe('initSchema tests', () => {
		test('Model class is created', () => {
			const classes = initSchema(testSchema());

			expect(classes).toHaveProperty('Model');

			const { Model } = classes as { Model: PersistentModelConstructor<Model> };

			expect(Model).toHaveProperty(
				nameOf<PersistentModelConstructor<any>>('copyOf')
			);

			expect(typeof Model.copyOf).toBe('function');
		});

		test('Model class can be instantiated', () => {
			const { Model } = initSchema(testSchema()) as {
				Model: PersistentModelConstructor<Model>;
			};

			const model = new Model({
				field1: 'something',
			});

			expect(model).toBeInstanceOf(Model);

			expect(model.id).toBeDefined();

			// syncable models use uuid v4
			expect(uuidValidate(model.id, 4)).toBe(true);
		});

		test('Non-syncable models get a ulid', () => {
			const { LocalModel } = initSchema(testSchema()) as {
				LocalModel: PersistentModelConstructor<Model>;
			};

			const now = Date.now();
			const model = new LocalModel({
				field1: 'something',
			});

			expect(model).toBeInstanceOf(LocalModel);

			expect(model.id).toBeDefined();

			const decodedTime = decodeTime(model.id);

			const diff = Math.abs(decodedTime - now);

			expect(diff).toBeLessThan(1000);
		});

		test('initSchema is executed only once', () => {
			initSchema(testSchema());

			const spy = jest.spyOn(console, 'warn');

			expect(() => {
				initSchema(testSchema());
			}).not.toThrow();

			expect(spy).toBeCalledWith('The schema has already been initialized');
		});

		test('Non @model class is created', () => {
			const classes = initSchema(testSchema());

			expect(classes).toHaveProperty('Metadata');

			const { Metadata } = classes;

			expect(Metadata).not.toHaveProperty(
				nameOf<PersistentModelConstructor<any>>('copyOf')
			);
		});

		test('Non @model class can be instantiated', () => {
			const { Metadata } = initSchema(testSchema()) as {
				Metadata: NonModelTypeConstructor<Metadata>;
			};

			const metadata = new Metadata({
				author: 'some author',
				tags: [],
				rewards: [],
				nominations: [],
			});

			expect(metadata).toBeInstanceOf(Metadata);

			expect(metadata).not.toHaveProperty('id');
		});
	});

	describe('Immutability', () => {
		test('Field cannot be changed', () => {
			const { Model } = initSchema(testSchema()) as {
				Model: PersistentModelConstructor<Model>;
			};

			const model = new Model({
				field1: 'something',
			});

			expect(() => {
				(<any>model).field1 = 'edit';
			}).toThrowError("Cannot assign to read only property 'field1' of object");
		});

		test('Model can be copied+edited by creating an edited copy', () => {
			const { Model } = initSchema(testSchema()) as {
				Model: PersistentModelConstructor<Model>;
			};

			const model1 = new Model({
				field1: 'something',
			});

			const model2 = Model.copyOf(model1, draft => {
				draft.field1 = 'edited';
			});

			expect(model1).not.toBe(model2);

			// ID should be kept the same
			expect(model1.id).toBe(model2.id);

			expect(model1.field1).toBe('something');
			expect(model2.field1).toBe('edited');
		});

		test('Id cannot be changed inside copyOf', () => {
			const { Model } = initSchema(testSchema()) as {
				Model: PersistentModelConstructor<Model>;
			};

			const model1 = new Model({
				field1: 'something',
			});

			const model2 = Model.copyOf(model1, draft => {
				(<any>draft).id = 'a-new-id';
			});

			// ID should be kept the same
			expect(model1.id).toBe(model2.id);
		});

		test('Non @model - Field cannot be changed', () => {
			const { Metadata } = initSchema(testSchema()) as {
				Metadata: NonModelTypeConstructor<Metadata>;
			};

			const nonModel = new Metadata({
				author: 'something',
				rewards: [],
				nominations: [],
			});

			expect(() => {
				(<any>nonModel).author = 'edit';
			}).toThrowError("Cannot assign to read only property 'author' of object");
		});
	});

	describe('Initialization', () => {
		test('start is called only once', async () => {
			const storage: StorageType = require('../src/storage/storage')
				.ExclusiveStorage;

			const classes = initSchema(testSchema());

			const { Model } = classes as { Model: PersistentModelConstructor<Model> };

			const promises = [
				DataStore.query(Model),
				DataStore.query(Model),
				DataStore.query(Model),
				DataStore.query(Model),
			];

			await Promise.all(promises);

			expect(storage).toHaveBeenCalledTimes(1);
		});

		test('It is initialized when observing (no query)', async () => {
			const storage: StorageType = require('../src/storage/storage')
				.ExclusiveStorage;

			const classes = initSchema(testSchema());

			const { Model } = classes as { Model: PersistentModelConstructor<Model> };

			DataStore.observe(Model).subscribe(jest.fn());

			expect(storage).toHaveBeenCalledTimes(1);
		});
	});

	describe('Basic operations', () => {
		let Model: PersistentModelConstructor<Model>;
		let Metadata: NonModelTypeConstructor<Metadata>;

		beforeEach(() => {
			jest.resetModules();
			jest.doMock('../src/storage/storage', () => {
				const mock = jest.fn().mockImplementation(() => ({
					init: jest.fn(),
					runExclusive: jest.fn(() => []),
					query: jest.fn(() => []),
					observe: jest.fn(() => Observable.from([])),
				}));

				(<any>mock).getNamespace = () => ({ models: {} });

				return { ExclusiveStorage: mock };
			});
			({ initSchema, DataStore } = require('../src/datastore/datastore'));

			const classes = initSchema(testSchema());

			({ Model, Metadata } = classes as {
				Model: PersistentModelConstructor<Model>;
				Metadata: NonModelTypeConstructor<Metadata>;
			});
		});

		test('Save returns the saved model', async () => {
			let model: Model;

			jest.resetModules();
			jest.doMock('../src/storage/storage', () => {
				const mock = jest.fn().mockImplementation(() => ({
					init: jest.fn(),
					runExclusive: jest.fn(() => [model]),
				}));

				(<any>mock).getNamespace = () => ({ models: {} });

				return { ExclusiveStorage: mock };
			});
			({ initSchema, DataStore } = require('../src/datastore/datastore'));

			const classes = initSchema(testSchema());

			const { Model } = classes as { Model: PersistentModelConstructor<Model> };

			model = new Model({
				field1: 'Some value',
			});

			const result = await DataStore.save(model);

			expect(result).toMatchObject(model);
		});

		test('Instantiation validations', async () => {
			expect(() => {
				new Model({ field1: undefined });
			}).toThrowError('Field field1 is required');

			expect(() => {
				new Model({ field1: null });
			}).toThrowError('Field field1 is required');

			expect(() => {
				new Model({ field1: <any>1234 });
			}).toThrowError(
				'Field field1 should be of type string, number received. 1234'
			);

			expect(
				new Model({
					field1: 'someField',
					metadata: new Metadata({
						author: 'Some author',
						tags: undefined,
						rewards: [],
						nominations: [],
					}),
				}).metadata.tags
			).toBeUndefined();

			expect(() => {
				new Model({
					field1: 'someField',
					metadata: new Metadata({
						author: 'Some author',
						tags: undefined,
						rewards: [null],
						nominations: [],
					}),
				});
			}).toThrowError(
				'All elements in the rewards array should be of type string, [object] received. '
			);

			expect(() => {
				new Model({
					field1: 'someField',
					metadata: new Metadata({
						author: 'Some author',
						tags: undefined,
						rewards: [],
						nominations: null,
					}),
				});
			}).toThrowError('Field nominations is required');

			expect(() => {
				new Model({
					field1: 'someField',
					metadata: new Metadata({
						author: 'Some author',
						tags: undefined,
						rewards: [],
						penNames: [undefined],
						nominations: [],
					}),
				});
			}).toThrowError(
				'All elements in the penNames array should be of type string, [undefined] received. '
			);

			expect(() => {
				new Model({
					field1: 'someField',
					metadata: new Metadata({
						author: 'Some author',
						tags: [<any>1234],
						rewards: [],
						nominations: [],
					}),
				});
			}).toThrowError(
				'All elements in the tags array should be of type string | null | undefined, [number] received. 1234'
			);

			expect(
				new Model(<any>{ extraAttribute: 'some value', field1: 'some value' })
			).toHaveProperty('extraAttribute');

			expect(() => {
				Model.copyOf(<any>undefined, d => d);
			}).toThrow('The source object is not a valid model');
			expect(() => {
				const source = new Model({ field1: 'something' });
				Model.copyOf(source, d => (d.field1 = <any>1234));
			}).toThrow(
				'Field field1 should be of type string, number received. 1234'
			);
		});

		test('Delete params', async () => {
			await expect(DataStore.delete(<any>undefined)).rejects.toThrow(
				'Model or Model Constructor required'
			);

			await expect(DataStore.delete(<any>Model)).rejects.toThrow(
				'Id to delete or criteria required. Do you want to delete all? Pass Predicates.ALL'
			);

			await expect(DataStore.delete(Model, <any>(() => {}))).rejects.toThrow(
				'Criteria required. Do you want to delete all? Pass Predicates.ALL'
			);

			await expect(DataStore.delete(Model, <any>(() => {}))).rejects.toThrow(
				'Criteria required. Do you want to delete all? Pass Predicates.ALL'
			);

			await expect(DataStore.delete(<any>{})).rejects.toThrow(
				'Object is not an instance of a valid model'
			);

			await expect(
				DataStore.delete(new Model({ field1: 'somevalue' }), <any>{})
			).rejects.toThrow('Invalid criteria');
		});

		test('Query params', async () => {
			await expect(DataStore.query(<any>undefined)).rejects.toThrow(
				'Constructor is not for a valid model'
			);

			await expect(DataStore.query(<any>undefined)).rejects.toThrow(
				'Constructor is not for a valid model'
			);

			await expect(
				DataStore.query(Model, <any>'someid', { page: 0 })
			).rejects.toThrow('Limit is required when requesting a page');

			await expect(
				DataStore.query(Model, <any>'someid', { page: <any>'a', limit: 10 })
			).rejects.toThrow('Page should be a number');

			await expect(
				DataStore.query(Model, <any>'someid', { page: -1, limit: 10 })
			).rejects.toThrow("Page can't be negative");

			await expect(
				DataStore.query(Model, <any>'someid', { page: 0, limit: <any>'avalue' })
			).rejects.toThrow('Limit should be a number');

			await expect(
				DataStore.query(Model, <any>'someid', { page: 0, limit: -1 })
			).rejects.toThrow("Limit can't be negative");
		});
	});

	test("non-@models can't be saved", async () => {
		const { Metadata } = initSchema(testSchema()) as {
			Metadata: NonModelTypeConstructor<Metadata>;
		};

		const metadata = new Metadata({
			author: 'some author',
			tags: [],
			rewards: [],
			nominations: [],
		});

		await expect(DataStore.save(<any>metadata)).rejects.toThrow(
			'Object is not an instance of a valid model'
		);
	});

	describe('Type definitions', () => {
		let Model: PersistentModelConstructor<Model>;

		beforeEach(() => {
			let model: Model;

			jest.resetModules();
			jest.doMock('../src/storage/storage', () => {
				const mock = jest.fn().mockImplementation(() => ({
					init: jest.fn(),
					runExclusive: jest.fn(() => [model]),
					query: jest.fn(() => [model]),
					observe: jest.fn(() => Observable.from([])),
				}));

				(<any>mock).getNamespace = () => ({ models: {} });

				return { ExclusiveStorage: mock };
			});
			({ initSchema, DataStore } = require('../src/datastore/datastore'));

			const classes = initSchema(testSchema());

			({ Model } = classes as { Model: PersistentModelConstructor<Model> });

			model = new Model({
				field1: 'Some value',
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
				expectType<Model>(oneModelById);
				expect(oneModelById.field1).toBeDefined();
				expect(oneModelById).toBeInstanceOf(Model);
			});
			test('with criteria', async () => {
				const multiModelWithCriteria = await DataStore.query(Model, c =>
					c.field1('contains', 'something')
				);
				expectType<Model[]>(multiModelWithCriteria);
				const [one] = multiModelWithCriteria;
				expect(one.field1).toBeDefined();
				expect(one).toBeInstanceOf(Model);
			});
			test('with pagination', async () => {
				const allModelsPaginated = await DataStore.query(
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
				expectType<Model>(oneModelById);
				expect(oneModelById.field1).toBeDefined();
				expect(oneModelById).toBeInstanceOf(Model);
			});
			test('with criteria', async () => {
				const multiModelWithCriteria = await DataStore.query<Model>(Model, c =>
					c.field1('contains', 'something')
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
				const model = new Model({ field1: 'somevalue' });

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
				DataStore.observe(Model, c => c.field1('ne', 'somevalue')).subscribe(
					({ element, model }) => {
						expectType<PersistentModelConstructor<Model>>(model);
						expectType<Model>(element);
					}
				);
			});
		});

		describe('Observe with generic type', () => {
			test('subscribe to model instance', async () => {
				const model = new Model({ field1: 'somevalue' });

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
				DataStore.observe<Model>(Model, c =>
					c.field1('ne', 'somevalue')
				).subscribe(({ element, model }) => {
					expectType<PersistentModelConstructor<Model>>(model);
					expectType<Model>(element);
				});
			});
		});
	});
});

//#region Test helpers

declare class Model {
	public readonly id: string;
	public readonly field1: string;
	public readonly metadata?: Metadata;

	constructor(init: ModelInit<Model>);

	static copyOf(
		src: Model,
		mutator: (draft: MutableModel<Model>) => void | Model
	): Model;
}

export declare class Metadata {
	readonly author: string;
	readonly tags?: string[];
	readonly rewards: string[];
	readonly penNames?: string[];
	readonly nominations: string[];
	constructor(init: Metadata);
}

function testSchema(): Schema {
	return {
		enums: {},
		models: {
			Model: {
				name: 'Model',
				pluralName: 'Models',
				syncable: true,
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
					},
					field1: {
						name: 'field1',
						isArray: false,
						type: 'String',
						isRequired: true,
					},
					metadata: {
						name: 'metadata',
						isArray: false,
						type: {
							nonModel: 'Metadata',
						},
						isRequired: false,
						attributes: [],
					},
				},
			},
			LocalModel: {
				name: 'LocalModel',
				pluralName: 'LocalModels',
				syncable: false,
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
					},
					field1: {
						name: 'field1',
						isArray: false,
						type: 'String',
						isRequired: true,
					},
				},
			},
		},
		nonModels: {
			Metadata: {
				name: 'Metadata',
				fields: {
					author: {
						name: 'author',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					tags: {
						name: 'tags',
						isArray: true,
						type: 'String',
						isRequired: false,
						isArrayNullable: true,
						attributes: [],
					},
					rewards: {
						name: 'rewards',
						isArray: true,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					penNames: {
						name: 'penNames',
						isArray: true,
						type: 'String',
						isRequired: true,
						isArrayNullable: true,
						attributes: [],
					},
					nominations: {
						name: 'nominations',
						isArray: true,
						type: 'String',
						isRequired: false,
						attributes: [],
					}
				},
			},
		},
		version: '1',
	};
}

//#endregion
