import 'fake-indexeddb/auto';
import { decodeTime } from 'ulid';
import { from, of } from 'rxjs';
import {
	DataStore as DataStoreType,
	initSchema as initSchemaType,
} from '../../src/datastore/datastore';
import { Predicates } from '../../src/predicates';
import { ExclusiveStorage as StorageType } from '../../src/storage/storage';
import {
	NonModelTypeConstructor,
	PersistentModelConstructor,
} from '../../src/types';
import {
	Metadata,
	Model,
	BasicModelRequiredTS,
	getDataStore,
	PostCustomPK as PostCustomPKType,
	testSchema,
} from '../helpers';

let initSchema: typeof initSchemaType;

let { DataStore } = getDataStore() as {
	DataStore: typeof DataStoreType;
};
const nameOf = <T>(name: keyof T) => name;

/**
 * Does nothing intentionally, we care only about type checking
 */
const expectType: <T>(param: T) => void = () => {};

/**
 * Renders more complete out of band traces.
 */
process.on('unhandledRejection', reason => {
	console.log(reason); // log the reason including the stack trace
});

describe('DataStore tests', () => {
	// `console` methods have been mocked in jest.setup.js
	const consoleError = console.error as jest.Mock;
	const consoleWarn = console.warn as jest.Mock;
	const consoleDebug = console.debug as jest.Mock;
	const consoleInfo = console.info as jest.Mock;

	beforeEach(() => {
		jest.resetModules();

		jest.doMock('../../src/storage/storage', () => {
			const mock = jest.fn().mockImplementation(() => ({
				init: jest.fn(),
				runExclusive: jest.fn(),
				query: jest.fn(() => []),
				save: jest.fn(() => []),
				observe: jest.fn(() => of()),
				clear: jest.fn(),
			}));

			(<any>mock).getNamespace = () => ({ models: {} });

			return { ExclusiveStorage: mock };
		});
		({ initSchema, DataStore } = require('../../src/datastore/datastore'));
	});

	afterEach(async () => {
		consoleError.mockClear();
		consoleWarn.mockClear();
		consoleDebug.mockClear();
		consoleInfo.mockClear();
		try {
			await DataStore.clear();
		} catch (error) {
			// we expect some tests to leave DataStore in a state where this
			// error will be thrown on clear.
			if (!/not initialized/.test(error.message)) {
				throw error;
			}
		}
	});

	/**
	 * The following two "error on schema not initialized" tests enforce that
	 * DataStore starts and clears alert customers that they may have multiple
	 * versions of DataStore installed.
	 */

	test('error on schema not initialized on start', async () => {
		const errorRegex = /Schema is not initialized/;
		await expect(DataStore.start()).rejects.toThrow(errorRegex);

		expect(consoleError).toHaveBeenCalledWith(
			expect.stringMatching(errorRegex)
		);
	});

	test('error on schema not initialized on clear', async () => {
		const errorRegex = /Schema is not initialized/;
		await expect(DataStore.clear()).rejects.toThrow(errorRegex);

		expect(consoleError).toHaveBeenCalledWith(
			expect.stringMatching(errorRegex)
		);
	});

	test("non-@models can't be saved", async () => {
		const { Metadata } = initSchema(testSchema()) as {
			Metadata: NonModelTypeConstructor<Metadata>;
		};

		const metadata = new Metadata({
			author: 'some author',
			tags: [],
			rewards: [],
			penNames: [],
			nominations: [],
		});

		await expect(DataStore.save(<any>metadata)).rejects.toThrow(
			'Object is not an instance of a valid model'
		);
	});

	describe('initSchema tests', () => {
		test('Model class is created', () => {
			const classes = initSchema(testSchema());

			expect(classes).toHaveProperty('Model');

			const { Model } = classes as {
				Model: PersistentModelConstructor<Model>;
			};

			expect(Model).toHaveProperty(
				nameOf<PersistentModelConstructor<any>>('copyOf')
			);

			expect(typeof Model.copyOf).toBe('function');
		});

		test('Model class can be instantiated', () => {
			const validate = require('uuid-validate');
			const { Model } = initSchema(testSchema()) as {
				Model: PersistentModelConstructor<Model>;
			};

			const model = new Model({
				field1: 'something',
				dateCreated: new Date().toISOString(),
			});

			expect(model).toBeInstanceOf(Model);

			expect(model.id).toBeDefined();

			// syncable models use uuid v4
			expect(validate(model.id, 4)).toBe(true);
		});

		test('Non-syncable models get a ulid', () => {
			const { LocalModel } = initSchema(testSchema()) as {
				LocalModel: PersistentModelConstructor<Model>;
			};

			const now = Date.now();
			const model = new LocalModel({
				field1: 'something',
				dateCreated: new Date().toISOString(),
			});

			expect(model).toBeInstanceOf(LocalModel);

			expect(model.id).toBeDefined();

			const decodedTime = decodeTime(model.id);

			const diff = Math.abs(decodedTime - now);

			expect(diff).toBeLessThan(1000);
		});

		test('initSchema is executed only once', () => {
			initSchema(testSchema());

			expect(() => {
				initSchema(testSchema());
			}).not.toThrow();

			expect(consoleWarn).toHaveBeenCalledWith(
				'The schema has already been initialized'
			);
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
				penNames: [],
				nominations: [],
			});

			expect(metadata).toBeInstanceOf(Metadata);

			expect(metadata).not.toHaveProperty('id');
		});

		describe('Check codegenVersion', () => {
			const invalidcodegenVersion = [
				'1.2.0',
				'4.0.0',
				'3.0',
				'3.1.9999',
				'5.4.1',
				'3',
				'unknown',
			];
			const validcodegenVersion = [
				'3.2.0',
				'3.2.4',
				'3.4.0',
				'3.5.6',
				'3.5.0-beta',
				'3.5.0-beta.1',
				'3.8.1-tagged-release',
				'3.8.1-tagged-release.1',
				'3.9.4+alpha',
			];

			describe('Invalid codegenVersion', () => {
				invalidcodegenVersion.forEach(codegenVersion => {
					test(`fails on codegenVersion = ${codegenVersion}`, () => {
						expect(() => {
							initSchema({ ...testSchema(), codegenVersion });
						}).toThrow(
							'Models were generated with an unsupported version of codegen.'
						);
					});
				});
			});

			describe('Valid codegenVersion', () => {
				validcodegenVersion.forEach(codegenVersion => {
					test(`passes on codegenVersion = ${codegenVersion}`, () => {
						expect(() => {
							initSchema({ ...testSchema(), codegenVersion });
						}).not.toThrow(
							'Models were generated with an unsupported version of codegen.'
						);
					});
				});
			});
		});
	});

	describe('Immutability', () => {
		test('Field cannot be changed', () => {
			const { Model } = initSchema(testSchema()) as {
				Model: PersistentModelConstructor<Model>;
			};

			const model = new Model({
				field1: 'something',
				dateCreated: new Date().toISOString(),
			});

			expect(() => {
				(<any>model).field1 = 'edit';
			}).toThrow("Cannot assign to read only property 'field1' of object");
		});

		test('Model can be copied+edited by creating an edited copy', () => {
			const { Model } = initSchema(testSchema()) as {
				Model: PersistentModelConstructor<Model>;
			};

			const model1 = new Model({
				field1: 'something',
				dateCreated: new Date().toISOString(),
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
				dateCreated: new Date().toISOString(),
			});

			const model2 = Model.copyOf(model1, draft => {
				(<any>draft).id = 'a-new-id';
			});

			// ID should be kept the same
			expect(model1.id).toBe(model2.id);

			// we should always be told *in some way* when an "update" will not actually
			// be applied. for now, this is a warning, because throwing an error, updating
			// the record's PK, or creating a new record are all breaking changes.
			expect(consoleWarn).toHaveBeenCalledWith(
				expect.stringContaining(
					"copyOf() does not update PK fields. The 'id' update is being ignored."
				),
				expect.objectContaining({ source: model1 })
			);
		});

		test('Optional field can be initialized with undefined', () => {
			const { Model } = initSchema(testSchema()) as {
				Model: PersistentModelConstructor<Model>;
			};

			const model1 = new Model({
				field1: 'something',
				dateCreated: new Date().toISOString(),
				optionalField1: undefined,
			});

			expect(model1.optionalField1).toBeNull();
		});

		test('Optional field can be initialized with null', () => {
			const { Model } = initSchema(testSchema()) as {
				Model: PersistentModelConstructor<Model>;
			};

			const model1 = new Model({
				field1: 'something',
				dateCreated: new Date().toISOString(),

				// strict mode actually forbids assigning null to optional field **as we've defined them.**
				// but, for customers not using strict TS and for JS developers, we need to ensure `null`
				// is accepted and handled as expected.
				optionalField1: null as unknown as undefined,
			});

			// strictly speaking (pun intended), the signature for optional fields is `type | undefined`.
			// AFAIK, customers compiling exclusively in strict mode shouldn't ever see a `null` here.
			// but, JS customers might explicitly set it to `null`.
			expect(model1.optionalField1).toBeNull();
		});

		test('Optional field can be changed to undefined inside copyOf', () => {
			const { Model } = initSchema(testSchema()) as {
				Model: PersistentModelConstructor<Model>;
			};

			const model1 = new Model({
				field1: 'something',
				dateCreated: new Date().toISOString(),
				optionalField1: 'something-else',
			});

			const model2 = Model.copyOf(model1, draft => {
				(<any>draft).optionalField1 = undefined;
			});

			// ID should be kept the same
			expect(model1.id).toBe(model2.id);

			expect(model1.optionalField1).toBe('something-else');
			expect(model2.optionalField1).toBeNull();
		});

		test('Optional field can be set to null inside copyOf', () => {
			const { Model } = initSchema(testSchema()) as {
				Model: PersistentModelConstructor<Model>;
			};

			const model1 = new Model({
				field1: 'something',
				dateCreated: new Date().toISOString(),
			});

			const model2 = Model.copyOf(model1, draft => {
				(<any>draft).optionalField1 = null;
			});

			// ID should be kept the same
			expect(model1.id).toBe(model2.id);

			expect(model1.optionalField1).toBeNull();
			expect(model2.optionalField1).toBeNull();
		});

		test('Required timestamp field can be omitted', async () => {
			const { BasicModelRequiredTS } = initSchema(testSchema()) as {
				BasicModelRequiredTS: PersistentModelConstructor<BasicModelRequiredTS>;
			};

			const m = new BasicModelRequiredTS({
				body: 'something',
			} as any);

			expect(m.createdAt).toBeNull();
			expect(m.updatedOn).toBeNull();
		});

		test('Required timestamp field can be null during a copyOf', async () => {
			const { BasicModelRequiredTS } = initSchema(testSchema()) as {
				BasicModelRequiredTS: PersistentModelConstructor<BasicModelRequiredTS>;
			};

			const m = new BasicModelRequiredTS({
				body: 'something',
			} as any);

			const copied = BasicModelRequiredTS.copyOf(m, d => (d.body = 'new body'));

			expect(copied.createdAt).toBeNull();
			expect(copied.updatedOn).toBeNull();
		});

		test('multiple copyOf operations carry all changes on save', async () => {
			let model: Model;
			const save = jest.fn(() => [model]);
			const query = jest.fn(() => [model]);

			jest.resetModules();
			jest.doMock('../../src/storage/storage', () => {
				const mock = jest.fn().mockImplementation(() => {
					const _mock = {
						init: jest.fn(),
						save,
						query,
						runExclusive: jest.fn(fn => fn.bind(this, _mock)()),
						clear: jest.fn(),
					};

					return _mock;
				});

				(<any>mock).getNamespace = () => ({ models: {} });

				return { ExclusiveStorage: mock };
			});

			({ initSchema, DataStore } = require('../../src/datastore/datastore'));

			const classes = initSchema(testSchema());

			const { Model } = classes as { Model: PersistentModelConstructor<Model> };

			const model1 = new Model({
				dateCreated: new Date().toISOString(),
				field1: 'original',
				optionalField1: 'original',
			});
			model = model1;

			await DataStore.save(model1);

			const model2 = Model.copyOf(model1, draft => {
				(<any>draft).field1 = 'field1Change1';
				(<any>draft).optionalField1 = 'optionalField1Change1';
			});

			const model3 = Model.copyOf(model2, draft => {
				(<any>draft).field1 = 'field1Change2';
			});
			model = model3;

			await DataStore.save(model3);

			const [settingsSave, saveOriginalModel, saveModel3] = <any>(
				save.mock.calls
			);

			const [_model, _condition, _mutator, [patches]] = saveModel3;

			const expectedPatches = [
				{
					op: 'replace',
					path: ['field1'],
					value: 'field1Change2',
				},
				{
					op: 'replace',
					path: ['optionalField1'],
					value: 'optionalField1Change1',
				},
			];
			expect(patches).toMatchObject(expectedPatches);
		});

		test('Non @model - Field cannot be changed', () => {
			const { Metadata } = initSchema(testSchema()) as {
				Metadata: NonModelTypeConstructor<Metadata>;
			};

			const nonModel = new Metadata({
				author: 'something',
				rewards: [],
				penNames: [],
				nominations: [],
			});

			expect(() => {
				(<any>nonModel).author = 'edit';
			}).toThrow("Cannot assign to read only property 'author' of object");
		});
	});

	describe('Initialization', () => {
		test('start is called only once', async () => {
			const storage: StorageType =
				require('../../src/storage/storage').ExclusiveStorage;

			const classes = initSchema(testSchema());

			const { Model } = classes as {
				Model: PersistentModelConstructor<Model>;
			};

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
			const storage: StorageType =
				require('../../src/storage/storage').ExclusiveStorage;

			const classes = initSchema(testSchema());

			const { Model } = classes as {
				Model: PersistentModelConstructor<Model>;
			};

			DataStore.observe(Model).subscribe(jest.fn());

			expect(storage).toHaveBeenCalledTimes(1);
		});
	});
});
