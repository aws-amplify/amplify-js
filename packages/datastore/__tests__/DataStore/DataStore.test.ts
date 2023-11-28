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
	PersistentModel,
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
		try {
			await DataStore.clear();
		} catch (error) {
			// we expect some tests to leave DataStore in a state where this
			// error will be thrown on clear.
			if (!error.message.match(/not initialized/)) {
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
		const errorLog = jest.spyOn(console, 'error');
		const errorRegex = /Schema is not initialized/;
		await expect(DataStore.start()).rejects.toThrow(errorRegex);

		expect(errorLog).toHaveBeenCalledWith(expect.stringMatching(errorRegex));
	});

	test('error on schema not initialized on clear', async () => {
		const errorLog = jest.spyOn(console, 'error');
		const errorRegex = /Schema is not initialized/;
		await expect(DataStore.clear()).rejects.toThrow(errorRegex);

		expect(errorLog).toHaveBeenCalledWith(expect.stringMatching(errorRegex));
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

			const spy = jest.spyOn(console, 'warn');

			expect(() => {
				initSchema(testSchema());
			}).not.toThrow();

			expect(spy).toHaveBeenCalledWith(
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
			const consoleWarn = jest.spyOn(console, 'warn');

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

	describe('Basic operations', () => {
		let Model: PersistentModelConstructor<Model>;
		let Metadata: NonModelTypeConstructor<Metadata>;

		beforeEach(() => {
			jest.resetModules();
			jest.doMock('../../src/storage/storage', () => {
				const mock = jest.fn().mockImplementation(() => ({
					init: jest.fn(),
					runExclusive: jest.fn(() => []),
					query: jest.fn(() => []),
					observe: jest.fn(() => from([])),
					clear: jest.fn(),
				}));

				(<any>mock).getNamespace = () => ({ models: {} });

				return { ExclusiveStorage: mock };
			});
			({ initSchema, DataStore } = require('../../src/datastore/datastore'));

			const classes = initSchema(testSchema());

			({ Model, Metadata } = classes as {
				Model: PersistentModelConstructor<Model>;
				Metadata: NonModelTypeConstructor<Metadata>;
			});
		});

		test('Save returns the saved model', async () => {
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

			const { Model } = classes as {
				Model: PersistentModelConstructor<Model>;
			};

			model = new Model({
				field1: 'Some value',
				dateCreated: new Date().toISOString(),
			});

			const result = await DataStore.save(model);

			const [settingsSave, modelCall] = <any>save.mock.calls;
			const [_model, _condition, _mutator, patches] = modelCall;

			const expectedPatchedFields = [
				'field1',
				'dateCreated',
				'id',
				'_version',
				'_lastChangedAt',
				'_deleted',
			];

			expect(result).toMatchObject(model);
			expect(patches[0].map(p => p.path.join(''))).toEqual(
				expectedPatchedFields
			);
		});

		test('Save returns the updated model and patches', async () => {
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

			const { Model } = classes as {
				Model: PersistentModelConstructor<Model>;
			};

			model = new Model({
				field1: 'something',
				dateCreated: new Date().toISOString(),
			});

			await DataStore.save(model);

			model = Model.copyOf(model, draft => {
				draft.field1 = 'edited';
			});

			const result = await DataStore.save(model);

			const [settingsSave, modelSave, modelUpdate] = <any>save.mock.calls;
			const [_model, _condition, _mutator, [patches]] = modelUpdate;

			const expectedPatches = [
				{ op: 'replace', path: ['field1'], value: 'edited' },
			];

			expect(result).toMatchObject(model);
			expect(patches).toMatchObject(expectedPatches);
		});

		test('Save returns the updated model and patches - list field', async () => {
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

			const { Model } = classes as {
				Model: PersistentModelConstructor<Model>;
			};

			model = new Model({
				field1: 'something',
				dateCreated: new Date().toISOString(),
				emails: ['john@doe.com', 'jane@doe.com'],
			});

			await DataStore.save(model);

			model = Model.copyOf(model, draft => {
				draft.emails = [...model.emails!, 'joe@doe.com'];
			});

			let result = await DataStore.save(model);

			expect(result).toMatchObject(model);

			model = Model.copyOf(model, draft => {
				draft.emails?.push('joe@doe.com');
			});

			result = await DataStore.save(model);

			expect(result).toMatchObject(model);

			const [settingsSave, modelSave, modelUpdate, modelUpdate2] = <any>(
				save.mock.calls
			);

			const [_model, _condition, _mutator, [patches]] = modelUpdate;
			const [_model2, _condition2, _mutator2, [patches2]] = modelUpdate2;

			const expectedPatches = [
				{
					op: 'replace',
					path: ['emails'],
					value: ['john@doe.com', 'jane@doe.com', 'joe@doe.com'],
				},
			];

			const expectedPatches2 = [
				{
					op: 'replace',
					path: ['emails'],
					value: ['john@doe.com', 'jane@doe.com', 'joe@doe.com', 'joe@doe.com'],
				},
			];

			expect(patches).toMatchObject(expectedPatches);
			expect(patches2).toMatchObject(expectedPatches2);
		});

		test('Read-only fields cannot be overwritten', async () => {
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

			const { Model } = classes as {
				Model: PersistentModelConstructor<Model>;
			};

			expect(() => {
				new Model({
					field1: 'something',
					dateCreated: new Date().toISOString(),
					createdAt: '2021-06-03T20:56:23.201Z',
				} as any);
			}).toThrow('createdAt is read-only.');

			model = new Model({
				field1: 'something',
				dateCreated: new Date().toISOString(),
			});

			expect(() => {
				Model.copyOf(model, draft => {
					(draft as any).createdAt = '2021-06-03T20:56:23.201Z';
				});
			}).toThrow('createdAt is read-only.');

			expect(() => {
				Model.copyOf(model, draft => {
					(draft as any).updatedAt = '2021-06-03T20:56:23.201Z';
				});
			}).toThrow('updatedAt is read-only.');
		});

		describe('Instantiation validations', () => {
			test('required field (undefined)', () => {
				expect(() => {
					new Model({
						field1: undefined!,
						dateCreated: new Date().toISOString(),
					});
				}).toThrow('Field field1 is required');
			});

			test('required field (null)', () => {
				expect(() => {
					new Model({
						field1: null!,
						dateCreated: new Date().toISOString(),
					});
				}).toThrow('Field field1 is required');
			});

			test('wrong type (number -> string)', () => {
				expect(() => {
					new Model({
						field1: <any>1234,
						dateCreated: new Date().toISOString(),
					});
				}).toThrow(
					'Field field1 should be of type string, number received. 1234'
				);
			});

			test('wrong type (string -> date)', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: 'not-a-date',
					});
				}).toThrow(
					'Field dateCreated should be of type AWSDateTime, validation failed. not-a-date'
				);
			});

			test('set nested non model field as undefined', () => {
				expect(
					// @ts-ignore
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						metadata: new Metadata({
							author: 'Some author',
							tags: undefined,
							rewards: [],
							penNames: [],
							nominations: [],
						}),
					}).metadata.tags
				).toBeUndefined();
			});

			test('pass null to nested non model array field (constructor)', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						metadata: new Metadata({
							author: 'Some author',
							tags: undefined,
							rewards: [null!],
							penNames: [],
							nominations: [],
						}),
					});
				}).toThrow(
					'All elements in the rewards array should be of type string, [null] received. '
				);
			});

			// without non model constructor
			test('pass null to nested non model non nullable array field (no constructor)', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						metadata: {
							author: 'Some author',
							tags: undefined,
							rewards: [null!],
							penNames: [],
							nominations: [],
						},
					});
				}).toThrow(
					'All elements in the rewards array should be of type string, [null] received. '
				);
			});

			test('valid model with null optional fields', () => {
				const m = new Model({
					field1: 'someField',
					dateCreated: new Date().toISOString(),
					optionalField1: null,
				});
				expect(m.optionalField1).toBe(null);
			});

			test('valid model with `undefined` optional fields', () => {
				const m = new Model({
					field1: 'someField',
					dateCreated: new Date().toISOString(),
					optionalField1: undefined,
				});
				expect(m.optionalField1).toBe(null);
			});

			test('valid model with omitted optional fields', () => {
				const m = new Model({
					field1: 'someField',
					dateCreated: new Date().toISOString(),
					/**
					 * Omitting this:
					 *
					 * optionalField: undefined
					 */
				});
				expect(m.optionalField1).toBe(null);
			});

			test('copyOf() setting optional field to null', () => {
				const emailsVal = ['test@test.test'];
				const original = new Model({
					field1: 'someField',
					dateCreated: new Date().toISOString(),
					optionalField1: 'defined value',
					emails: emailsVal,
				});
				const copied = Model.copyOf(original, d => (d.optionalField1 = null));
				expect(copied.optionalField1).toBe(null);
				expect(copied.emails).toEqual(emailsVal);
			});

			test('copyOf() setting optional field to undefined', () => {
				const original = new Model({
					field1: 'someField',
					dateCreated: new Date().toISOString(),
					optionalField1: 'defined value',
				});
				const copied = Model.copyOf(
					original,
					d => (d.optionalField1 = undefined)
				);
				expect(copied.optionalField1).toBe(null);
			});

			test('pass null to non nullable array field', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						emails: [null!],
					});
				}).toThrow(
					'All elements in the emails array should be of type string, [null] received. '
				);
			});

			test('pass null to nullable array field', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						ips: [null],
					});
				}).not.toThrow();
			});

			test('valid model array of AWSIPAdress', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						ips: ['1.1.1.1'],
					});
				}).not.toThrow();
			});

			test('invalid AWSIPAddress', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						ips: ['not.an.ip'],
					});
				}).toThrow(
					`All elements in the ips array should be of type AWSIPAddress, validation failed for one or more elements. not.an.ip`
				);
			});

			test('invalid AWSIPAddress in one index', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						ips: ['1.1.1.1', 'not.an.ip'],
					});
				}).toThrow(
					`All elements in the ips array should be of type AWSIPAddress, validation failed for one or more elements. 1.1.1.1,not.an.ip`
				);
			});

			test('valid AWSEmail', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						emails: ['test@example.com'],
					});
				}).not.toThrow();
			});

			test('valid empty array of AWSEmail', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						emails: [],
						ips: [],
					});
				}).not.toThrow();
			});

			test('invalid AWSEmail', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						emails: ['not-an-email'],
					});
				}).toThrow(
					'All elements in the emails array should be of type AWSEmail, validation failed for one or more elements. not-an-email'
				);
			});

			test('required sub non model field with constructor', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						metadata: new Metadata({
							author: 'Some author',
							tags: undefined,
							rewards: [],
							penNames: [],
							nominations: null!,
						}),
					});
				}).toThrow('Field nominations is required');
			});

			test('required sub non model field without constructor', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						metadata: {
							author: 'Some author',
							tags: undefined,
							rewards: [],
							penNames: [],
							nominations: null!,
						},
					});
				}).toThrow('Field nominations is required');
			});

			test('sub non model non nullable array field with constructor', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						metadata: new Metadata({
							author: 'Some author',
							tags: undefined,
							rewards: [],
							penNames: [undefined!],
							nominations: [],
						}),
					});
				}).toThrow(
					'All elements in the penNames array should be of type string, [undefined] received. '
				);
			});

			// without non model constructor
			test('sub non model non nullable array field without constructor', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						metadata: {
							author: 'Some author',
							tags: undefined,
							rewards: [],
							penNames: [undefined!],
							nominations: [],
						},
					});
				}).toThrow(
					'All elements in the penNames array should be of type string, [undefined] received. '
				);
			});

			test('sub non model array field invalid type with constructor', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						metadata: new Metadata({
							author: 'Some author',
							tags: [<any>1234],
							rewards: [],
							penNames: [],
							nominations: [],
						}),
					});
				}).toThrow(
					'All elements in the tags array should be of type string | null | undefined, [number] received. 1234'
				);
			});

			// without non model constructor
			test('sub non model array field invalid type without constructor', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						metadata: {
							author: 'Some author',
							tags: [<any>1234],
							rewards: [],
							penNames: [],
							nominations: [],
						},
					});
				}).toThrow(
					'All elements in the tags array should be of type string | null | undefined, [number] received. 1234'
				);
			});

			test('valid sub non model nullable array field (null) with constructor', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						metadata: new Metadata({
							author: 'Some author',
							rewards: [],
							penNames: [],
							nominations: [],
							misc: [null],
						}),
					});
				}).not.toThrow();
			});

			test('valid sub non model nullable array field (null) without constructor', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						metadata: {
							author: 'Some author',
							rewards: [],
							penNames: [],
							nominations: [],
							misc: [null],
						},
					});
				}).not.toThrow();
			});

			test('valid sub non model nullable array field (undefined) with constructor', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						metadata: new Metadata({
							author: 'Some author',
							rewards: [],
							penNames: [],
							nominations: [],
							misc: [undefined!],
						}),
					});
				}).not.toThrow();
			});

			test('valid sub non model nullable array field (undefined) without constructor', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						metadata: {
							author: 'Some author',
							rewards: [],
							penNames: [],
							nominations: [],
							misc: [undefined!],
						},
					});
				}).not.toThrow();
			});

			test('valid sub non model nullable array field (undefined and null) with constructor', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						metadata: new Metadata({
							author: 'Some author',
							rewards: [],
							penNames: [],
							nominations: [],
							misc: [undefined!, null],
						}),
					});
				}).not.toThrow();
			});

			test('valid sub non model nullable array field (undefined and null) without constructor', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						metadata: {
							author: 'Some author',
							rewards: [],
							penNames: [],
							nominations: [],
							misc: [undefined!, null],
						},
					});
				}).not.toThrow();
			});

			test('valid sub non model nullable array field (null and string) with constructor', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						metadata: new Metadata({
							author: 'Some author',
							rewards: [],
							penNames: [],
							nominations: [],
							misc: [null, 'ok'],
						}),
					});
				}).not.toThrow();
			});

			test('valid sub non model nullable array field (null and string) without constructor', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						metadata: {
							author: 'Some author',
							rewards: [],
							penNames: [],
							nominations: [],
							misc: [null, 'ok'],
						},
					});
				}).not.toThrow();
			});

			test('wrong type sub non model nullable array field (null and number) with constructor', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						metadata: new Metadata({
							author: 'Some author',
							rewards: [],
							penNames: [],
							nominations: [],
							misc: [null, <any>123],
						}),
					});
				}).toThrow(
					'All elements in the misc array should be of type string | null | undefined, [null,number] received. ,123'
				);
			});

			test('wrong type sub non model nullable array field (null and number) without constructor', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						metadata: {
							author: 'Some author',
							rewards: [],
							penNames: [],
							nominations: [],
							misc: [null, <any>123],
						},
					});
				}).toThrow(
					'All elements in the misc array should be of type string | null | undefined, [null,number] received. ,123'
				);
			});

			test('allow extra attribute', () => {
				expect(
					new Model(<any>{ extraAttribute: 'some value', field1: 'some value' })
				).toHaveProperty('extraAttribute');
			});

			test('throw on invalid constructor', () => {
				expect(() => {
					Model.copyOf(<any>undefined, d => d);
				}).toThrow('The source object is not a valid model');
			});

			test('invalid type on copyOf', () => {
				expect(() => {
					const source = new Model({
						field1: 'something',
						dateCreated: new Date().toISOString(),
					});
					Model.copyOf(source, d => (d.field1 = <any>1234));
				}).toThrow(
					'Field field1 should be of type string, number received. 1234'
				);
			});

			test('invalid sub non model type', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						// @ts-ignore
						metadata: 'invalid',
					});
				}).toThrow(
					'Field metadata should be of type Metadata, string recieved. invalid'
				);
			});

			test('sub non model null', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						metadata: null,
					});
				}).not.toThrow(
					'Field metadata should be of type Metadata, string recieved. invalid'
				);
			});

			test('invalid nested sub non model type', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						metadata: {
							author: 'Some author',
							rewards: [],
							penNames: [],
							nominations: [],
							// @ts-ignore
							login: 'login',
						},
					});
				}).toThrow(
					'Field login should be of type Login, string recieved. login'
				);
			});

			test('invalid array sub non model type', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						// @ts-ignore
						logins: ['bad type', 'another bad type'],
					});
				}).toThrow(
					'All elements in the logins array should be of type Login, [string] received. bad type'
				);
			});

			test('invalid array sub non model field type', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						// @ts-ignore
						logins: [{ username: 4 }],
					});
				}).toThrow(
					'Field username should be of type string, number received. 4'
				);
			});

			test('nullable array sub non model', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						logins: [null!, { username: 'user' }],
					});
				}).not.toThrow();
			});

			test('array sub non model wrong type', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						// @ts-ignore
						logins: 'my login',
					});
				}).toThrow(
					'Field logins should be of type [Login | null | undefined], string received. my login'
				);
			});

			test('array sub non model null', () => {
				expect(() => {
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						logins: null,
					});
				}).not.toThrow();
			});
		});

		test('Delete params', async () => {
			await expect(DataStore.delete(<any>undefined)).rejects.toThrow(
				'Model or Model Constructor required'
			);

			await expect(DataStore.delete(<any>Model)).rejects.toThrow(
				'Id to delete or criteria required. Do you want to delete all? Pass Predicates.ALL'
			);

			await expect(DataStore.delete(Model, <any>(() => {}))).rejects.toThrow(
				"Invalid predicate. Terminate your predicate with a valid condition (e.g., `p => p.field.eq('value')`) or pass `Predicates.ALL`."
			);

			await expect(DataStore.delete(<any>{})).rejects.toThrow(
				'Object is not an instance of a valid model'
			);

			await expect(
				DataStore.delete(
					new Model({
						field1: 'somevalue',
						dateCreated: new Date().toISOString(),
					}),
					<any>{}
				)
			).rejects.toThrow('Invalid criteria');
		});

		test('Delete many returns many', async () => {
			const models: Model[] = [];
			const save = jest.fn(model => {
				model instanceof Model && models.push(model);
			});
			const query = jest.fn(() => models);
			const _delete = jest.fn(() => [models, models]);

			jest.resetModules();
			jest.doMock('../../src/storage/storage', () => {
				const mock = jest.fn().mockImplementation(() => {
					const _mock = {
						init: jest.fn(),
						save,
						query,
						delete: _delete,
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

			const { Model } = classes as {
				Model: PersistentModelConstructor<Model>;
			};

			for (let i = 0; i < 10; i++) {
				await DataStore.save(
					new Model({
						field1: 'someField',
						dateCreated: new Date().toISOString(),
						metadata: new Metadata({
							author: 'Some author ' + i,
							rewards: [],
							penNames: [],
							nominations: [],
							misc: [null, 'ok'],
						}),
					})
				);
			}

			const deleted = await DataStore.delete(Model, m =>
				m.field1.eq('someField')
			);

			expect(deleted.length).toEqual(10);
			deleted.forEach(deletedItem => {
				expect(deletedItem.field1).toEqual('someField');
			});
		});

		test('Delete one returns one', async () => {
			let model: Model | undefined;
			const save = jest.fn(saved => (model = saved));
			const query = jest.fn(() => [model]);
			const _delete = jest.fn(() => [[model], [model]]);

			jest.resetModules();
			jest.doMock('../../src/storage/storage', () => {
				const mock = jest.fn().mockImplementation(() => {
					const _mock = {
						init: jest.fn(),
						save,
						query,
						delete: _delete,
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

			const { Model } = classes as {
				Model: PersistentModelConstructor<Model>;
			};

			const saved = await DataStore.save(
				new Model({
					field1: 'someField',
					dateCreated: new Date().toISOString(),
					metadata: new Metadata({
						author: 'Some author',
						rewards: [],
						penNames: [],
						nominations: [],
						misc: [null, 'ok'],
					}),
				})
			);

			const deleted: Model[] = await DataStore.delete(Model, saved.id);

			expect(deleted.length).toEqual(1);
			expect(deleted[0]).toEqual(model);
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
				DataStore.query(Model, <any>'someid', {
					page: 0,
					limit: <any>'avalue',
				})
			).rejects.toThrow('Limit should be a number');

			await expect(
				DataStore.query(Model, <any>'someid', { page: 0, limit: -1 })
			).rejects.toThrow("Limit can't be negative");
		});
	});

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
				DataStore.observe<Model>(Model, c =>
					c.field1.ne('somevalue')
				).subscribe(({ element, model }) => {
					expectType<PersistentModelConstructor<Model>>(model);
					expectType<Model>(element);
				});
			});
		});
	});

	describe('DataStore Custom PK tests', () => {
		describe('initSchema tests', () => {
			test('PostCustomPK class is created', () => {
				const classes = initSchema(testSchema());

				expect(classes).toHaveProperty('PostCustomPK');

				const { PostCustomPK } = classes as {
					PostCustomPK: PersistentModelConstructor<PostCustomPKType>;
				};

				expect(PostCustomPK).toHaveProperty(
					nameOf<PersistentModelConstructor<any>>('copyOf')
				);

				expect(typeof PostCustomPK.copyOf).toBe('function');
			});

			test('PostCustomPK class can be instantiated', () => {
				const { PostCustomPK } = initSchema(testSchema()) as {
					PostCustomPK: PersistentModelConstructor<PostCustomPKType>;
				};

				const model = new PostCustomPK({
					postId: '12345',
					title: 'something',
					dateCreated: new Date().toISOString(),
				});

				expect(model).toBeInstanceOf(PostCustomPK);

				expect(model.postId).toBeDefined();
			});
		});

		describe('Immutability', () => {
			test('Title cannot be changed', () => {
				const { PostCustomPK } = initSchema(testSchema()) as {
					PostCustomPK: PersistentModelConstructor<PostCustomPKType>;
				};

				const model = new PostCustomPK({
					postId: '12345',
					title: 'something',
					dateCreated: new Date().toISOString(),
				});

				expect(() => {
					(<any>model).title = 'edit';
				}).toThrow("Cannot assign to read only property 'title' of object");
			});

			test('PostCustomPK can be copied+edited by creating an edited copy', () => {
				const { PostCustomPK } = initSchema(testSchema()) as {
					PostCustomPK: PersistentModelConstructor<PostCustomPKType>;
				};

				const model1 = new PostCustomPK({
					postId: '12345',
					title: 'something',
					dateCreated: new Date().toISOString(),
				});

				const model2 = PostCustomPK.copyOf(model1, draft => {
					draft.title = 'edited';
				});

				expect(model1).not.toBe(model2);

				// postId should be kept the same
				expect(model1.postId).toBe(model2.postId);

				expect(model1.title).toBe('something');
				expect(model2.title).toBe('edited');
			});

			test('postId cannot be changed inside copyOf', () => {
				const consoleWarn = jest.spyOn(console, 'warn');

				const { PostCustomPK } = initSchema(testSchema()) as {
					PostCustomPK: PersistentModelConstructor<PostCustomPKType>;
				};

				const model1 = new PostCustomPK({
					postId: '12345',
					title: 'something',
					dateCreated: new Date().toISOString(),
				});

				const model2 = PostCustomPK.copyOf(model1, draft => {
					(<any>draft).postId = 'a-new-postId';
				});

				// postId should be kept the same
				expect(model1.postId).toBe(model2.postId);

				// we should always be told *in some way* when an "update" will not actually
				// be applied. for now, this is a warning, because throwing an error, updating
				// the record's PK, or creating a new record are all breaking changes.
				expect(consoleWarn).toHaveBeenCalledWith(
					expect.stringContaining(
						"copyOf() does not update PK fields. The 'postId' update is being ignored."
					),
					expect.objectContaining({ source: model1 })
				);
			});

			test('Optional field can be initialized with undefined', () => {
				const { PostCustomPK } = initSchema(testSchema()) as {
					PostCustomPK: PersistentModelConstructor<PostCustomPKType>;
				};

				const model1 = new PostCustomPK({
					postId: '12345',
					title: 'something',
					description: undefined,
					dateCreated: new Date().toISOString(),
				});

				expect(model1.description).toBeNull();
			});

			test('Optional field can be initialized with null', () => {
				const { PostCustomPK } = initSchema(testSchema()) as {
					PostCustomPK: PersistentModelConstructor<PostCustomPKType>;
				};

				const model1 = new PostCustomPK({
					postId: '12345',
					title: 'something',
					dateCreated: new Date().toISOString(),
					description: null,
				});

				expect(model1.description).toBeNull();
			});

			test('Optional field can be changed to undefined inside copyOf', () => {
				const { PostCustomPK } = initSchema(testSchema()) as {
					PostCustomPK: PersistentModelConstructor<PostCustomPKType>;
				};

				const model1 = new PostCustomPK({
					postId: '12345',
					title: 'something',
					dateCreated: new Date().toISOString(),
					description: 'something-else',
				});

				const model2 = PostCustomPK.copyOf(model1, draft => {
					(<any>draft).description = undefined;
				});

				// postId should be kept the same
				expect(model1.postId).toBe(model2.postId);

				expect(model1.description).toBe('something-else');
				expect(model2.description).toBeNull();
			});

			test('Optional field can be set to null inside copyOf', () => {
				const { PostCustomPK } = initSchema(testSchema()) as {
					PostCustomPK: PersistentModelConstructor<PostCustomPKType>;
				};

				const model1 = new PostCustomPK({
					postId: '12345',
					title: 'something',
					dateCreated: new Date().toISOString(),
				});

				const model2 = PostCustomPK.copyOf(model1, draft => {
					(<any>draft).description = null;
				});

				// postId should be kept the same
				expect(model1.postId).toBe(model2.postId);

				expect(model1.description).toBeNull();
				expect(model2.description).toBeNull();
			});

			test('Non @model - Field cannot be changed', () => {
				const { Metadata } = initSchema(testSchema()) as {
					Metadata: NonModelTypeConstructor<Metadata>;
				};

				const nonPostCustomPK = new Metadata({
					author: 'something',
					rewards: [],
					penNames: [],
					nominations: [],
				});

				expect(() => {
					(<any>nonPostCustomPK).author = 'edit';
				}).toThrow("Cannot assign to read only property 'author' of object");
			});
		});

		describe('Initialization', () => {
			let PostCustomPK;
			test('start is called only once', async () => {
				const storage: StorageType =
					require('../../src/storage/storage').ExclusiveStorage;

				const classes = initSchema(testSchema());

				({ PostCustomPK } = classes as {
					PostCustomPK: PersistentModelConstructor<PostCustomPKType>;
				});

				const promises = [
					DataStore.query(PostCustomPK),
					DataStore.query(PostCustomPK),
					DataStore.query(PostCustomPK),
					DataStore.query(PostCustomPK),
				];

				await Promise.all(promises);

				expect(storage).toHaveBeenCalledTimes(1);
			});

			test('It is initialized when observing (no query)', async () => {
				const storage: StorageType =
					require('../../src/storage/storage').ExclusiveStorage;

				const classes = initSchema(testSchema());

				({ PostCustomPK } = classes as {
					PostCustomPK: PersistentModelConstructor<PostCustomPKType>;
				});

				DataStore.observe(PostCustomPK).subscribe(jest.fn());

				expect(storage).toHaveBeenCalledTimes(1);
			});
		});

		describe('Basic operations', () => {
			let PostCustomPK: PersistentModelConstructor<PostCustomPKType>;

			beforeEach(() => {
				jest.resetModules();
				jest.doMock('../../src/storage/storage', () => {
					const mock = jest.fn().mockImplementation(() => ({
						init: jest.fn(),
						runExclusive: jest.fn(() => []),
						query: jest.fn(() => []),
						observe: jest.fn(() => from([])),
						clear: jest.fn(),
					}));

					(<any>mock).getNamespace = () => ({ models: {} });

					return { ExclusiveStorage: mock };
				});
				({ initSchema, DataStore } = require('../../src/datastore/datastore'));

				const classes = initSchema(testSchema());

				({ PostCustomPK } = classes as {
					PostCustomPK: PersistentModelConstructor<PostCustomPKType>;
				});
			});

			test('Save returns the saved model', async () => {
				let model: PostCustomPKType;
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

				const { PostCustomPK } = classes as {
					PostCustomPK: PersistentModelConstructor<PostCustomPKType>;
				};

				model = new PostCustomPK({
					postId: '12345',
					title: 'Some value',
					dateCreated: new Date().toISOString(),
				});

				const result = await DataStore.save(model);

				const [settingsSave, modelCall] = <any>save.mock.calls;
				const [_model, _condition, _mutator, patches] = modelCall;

				const expectedPatchedFields = [
					'postId',
					'title',
					'dateCreated',
					'_version',
					'_lastChangedAt',
					'_deleted',
				];

				expect(result).toMatchObject(model);
				expect(patches[0].map(p => p.path.join(''))).toEqual(
					expectedPatchedFields
				);
			});

			test('Save returns the updated model and patches', async () => {
				let model: PostCustomPKType;
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

				const { PostCustomPK } = classes as {
					PostCustomPK: PersistentModelConstructor<PostCustomPKType>;
				};

				model = new PostCustomPK({
					postId: '12345',
					title: 'something',
					dateCreated: new Date().toISOString(),
				});

				await DataStore.save(model);

				model = PostCustomPK.copyOf(model, draft => {
					draft.title = 'edited';
				});

				const result = await DataStore.save(model);

				const [settingsSave, modelSave, modelUpdate] = <any>save.mock.calls;
				const [_model, _condition, _mutator, [patches]] = modelUpdate;

				const expectedPatches = [
					{ op: 'replace', path: ['title'], value: 'edited' },
				];

				expect(result).toMatchObject(model);
				expect(patches).toMatchObject(expectedPatches);
			});

			test('Save returns the updated model and patches - list field', async () => {
				let model: PostCustomPKType;
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

				const { PostCustomPK } = classes as {
					PostCustomPK: PersistentModelConstructor<PostCustomPKType>;
				};

				model = new PostCustomPK({
					postId: '12345',
					title: 'something',
					dateCreated: new Date().toISOString(),
					emails: ['john@doe.com', 'jane@doe.com'],
				});

				await DataStore.save(model);

				model = PostCustomPK.copyOf(model, draft => {
					draft.emails = [...draft.emails!, 'joe@doe.com'];
				});

				let result = await DataStore.save(model);

				expect(result).toMatchObject(model);

				model = PostCustomPK.copyOf(model, draft => {
					draft.emails!.push('joe@doe.com');
				});

				result = await DataStore.save(model);

				expect(result).toMatchObject(model);

				const [settingsSave, modelSave, modelUpdate, modelUpdate2] = <any>(
					save.mock.calls
				);

				const [_model, _condition, _mutator, [patches]] = modelUpdate;
				const [_model2, _condition2, _mutator2, [patches2]] = modelUpdate2;

				const expectedPatches = [
					{
						op: 'replace',
						path: ['emails'],
						value: ['john@doe.com', 'jane@doe.com', 'joe@doe.com'],
					},
				];

				const expectedPatches2 = [
					{
						op: 'replace',
						path: ['emails'],
						value: [
							'john@doe.com',
							'jane@doe.com',
							'joe@doe.com',
							'joe@doe.com',
						],
					},
				];

				expect(patches).toMatchObject(expectedPatches);
				expect(patches2).toMatchObject(expectedPatches2);
			});

			test('Read-only fields cannot be overwritten', async () => {
				let model: PostCustomPKType;
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

				const { PostCustomPK } = classes as {
					PostCustomPK: PersistentModelConstructor<PostCustomPKType>;
				};

				expect(() => {
					new PostCustomPK({
						postId: '12345',
						title: 'something',
						dateCreated: new Date().toISOString(),
						createdAt: '2021-06-03T20:56:23.201Z',
					}) as any;
				}).toThrow('createdAt is read-only.');

				model = new PostCustomPK({
					postId: '12345',
					title: 'something',
					dateCreated: new Date().toISOString(),
				});

				expect(() => {
					PostCustomPK.copyOf(model, draft => {
						(draft as any).createdAt = '2021-06-03T20:56:23.201Z';
					});
				}).toThrow('createdAt is read-only.');

				expect(() => {
					PostCustomPK.copyOf(model, draft => {
						(draft as any).updatedAt = '2021-06-03T20:56:23.201Z';
					});
				}).toThrow('updatedAt is read-only.');
			});

			test('Instantiation validations custom pk', async () => {
				expect(() => {
					new PostCustomPK({
						postId: '12345',
						title: undefined as any, // because we're trying to trigger JS error
						dateCreated: new Date().toISOString(),
					});
				}).toThrow('Field title is required');

				expect(() => {
					new PostCustomPK({
						postId: '12345',
						title: null as any, // because we're trying to trigger JS error
						dateCreated: new Date().toISOString(),
					});
				}).toThrow('Field title is required');

				expect(() => {
					new PostCustomPK({
						postId: '12345',
						title: <any>1234,
						dateCreated: new Date().toISOString(),
					});
				}).toThrow(
					'Field title should be of type string, number received. 1234'
				);

				expect(() => {
					new PostCustomPK({
						postId: '12345',
						title: 'someField',
						dateCreated: 'not-a-date',
					});
				}).toThrow(
					'Field dateCreated should be of type AWSDateTime, validation failed. not-a-date'
				);

				expect(() => {
					new PostCustomPK({
						postId: '12345',
						title: 'someField',
						dateCreated: new Date().toISOString(),
						emails: [null as any], // because we're trying to trigger JS error
					});
				}).toThrow(
					'All elements in the emails array should be of type string, [null] received. '
				);

				expect(() => {
					new PostCustomPK({
						postId: '12345',
						title: 'someField',
						dateCreated: new Date().toISOString(),
						emails: ['test@example.com'],
					});
				}).not.toThrow();

				expect(() => {
					new PostCustomPK({
						postId: '12345',
						title: 'someField',
						dateCreated: new Date().toISOString(),
						emails: ['not-an-email'],
					});
				}).toThrow(
					'All elements in the emails array should be of type AWSEmail, validation failed for one or more elements. not-an-email'
				);

				expect(<any>{
					extraAttribute: 'some value',
					title: 'some value',
				}).toHaveProperty('extraAttribute');

				expect(() => {
					PostCustomPK.copyOf(<any>undefined, d => d);
				}).toThrow('The source object is not a valid model');
				expect(() => {
					const source = new PostCustomPK({
						postId: '12345',
						title: 'something',
						dateCreated: new Date().toISOString(),
					});
					PostCustomPK.copyOf(source, d => (d.title = <any>1234));
				}).toThrow(
					'Field title should be of type string, number received. 1234'
				);
			});

			test('Delete params', async () => {
				await expect(DataStore.delete(<any>undefined)).rejects.toThrow(
					'Model or Model Constructor required'
				);

				await expect(DataStore.delete(<any>PostCustomPK)).rejects.toThrow(
					'Id to delete or criteria required. Do you want to delete all? Pass Predicates.ALL'
				);

				await expect(
					DataStore.delete(PostCustomPK, <any>(() => {}))
				).rejects.toThrow(
					"Invalid predicate. Terminate your predicate with a valid condition (e.g., `p => p.field.eq('value')`) or pass `Predicates.ALL`."
				);

				await expect(DataStore.delete(<any>{})).rejects.toThrow(
					'Object is not an instance of a valid model'
				);

				await expect(
					DataStore.delete(
						new PostCustomPK({
							postId: '12345',
							title: 'somevalue',
							dateCreated: new Date().toISOString(),
						}),
						<any>{}
					)
				).rejects.toThrow('Invalid criteria');
			});

			test('Delete many returns many', async () => {
				const models: PostCustomPKType[] = [];
				const save = jest.fn(model => {
					model instanceof PostCustomPK && models.push(model);
				});
				const query = jest.fn(() => models);
				const _delete = jest.fn(() => [models, models]);

				jest.resetModules();
				jest.doMock('../../src/storage/storage', () => {
					const mock: jest.Mock<Storage> = jest.fn().mockImplementation(() => {
						const _mock = {
							init: jest.fn(),
							save,
							query,
							delete: _delete,
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

				const { PostCustomPK } = classes as {
					PostCustomPK: PersistentModelConstructor<PostCustomPKType>;
				};

				Promise.all(
					[...Array(10).keys()].map(async i => {
						await DataStore.save(
							new PostCustomPK({
								postId: `${i}`,
								title: 'someField',
								dateCreated: new Date().toISOString(),
							})
						);
					})
				);

				const deleted = await DataStore.delete(PostCustomPK, m =>
					m.title.eq('someField')
				);

				const sortedRecords = deleted.sort((a, b) =>
					a.postId < b.postId ? -1 : 1
				);

				expect(sortedRecords.length).toEqual(10);
				sortedRecords.forEach((deletedItem, idx) => {
					expect(deletedItem.postId).toEqual(`${idx}`);
					expect(deletedItem.title).toEqual('someField');
				});
			});

			test('Delete one by Custom PK returns one', async () => {
				let model: PostCustomPKType;
				const save = jest.fn(saved => (model = saved));
				const query = jest.fn(() => [model]);
				const _delete = jest.fn(() => [[model], [model]]);

				jest.resetModules();
				jest.doMock('../../src/storage/storage', () => {
					const mock = jest.fn().mockImplementation(() => {
						const _mock = {
							init: jest.fn(),
							save,
							query,
							delete: _delete,
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

				const { PostCustomPK } = classes as {
					PostCustomPK: PersistentModelConstructor<PostCustomPKType>;
				};

				const saved = await DataStore.save(
					new PostCustomPK({
						postId: '12345',
						title: 'someField',
						dateCreated: new Date().toISOString(),
					})
				);

				const deleted: PostCustomPKType[] = await DataStore.delete(
					PostCustomPK,
					saved.postId
				);

				expect(deleted.length).toEqual(1);
				expect(deleted[0]).toEqual(model!);
			});

			test('Delete one by Custom PK with predicate returns one', async () => {
				let model: PostCustomPKType;
				const save = jest.fn(saved => (model = saved));
				const query = jest.fn(() => [model]);
				const _delete = jest.fn(() => [[model], [model]]);

				jest.resetModules();
				jest.doMock('../../src/storage/storage', () => {
					const mock = jest.fn().mockImplementation(() => {
						const _mock = {
							init: jest.fn(),
							save,
							query,
							delete: _delete,
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

				const { PostCustomPK } = classes as {
					PostCustomPK: PersistentModelConstructor<PostCustomPKType>;
				};

				const saved = await DataStore.save(
					new PostCustomPK({
						postId: '12345',
						title: 'someField',
						dateCreated: new Date().toISOString(),
					})
				);

				const deleted: PostCustomPKType[] = await DataStore.delete(
					PostCustomPK,

					m => m.postId.eq(saved.postId)
				);

				expect(deleted.length).toEqual(1);
				expect(deleted[0]).toEqual(model!);
			});

			test('Query params', async () => {
				await expect(DataStore.query(<any>undefined)).rejects.toThrow(
					'Constructor is not for a valid model'
				);

				await expect(DataStore.query(<any>undefined)).rejects.toThrow(
					'Constructor is not for a valid model'
				);

				await expect(
					DataStore.query(PostCustomPK, <any>'someid', { page: 0 })
				).rejects.toThrow('Limit is required when requesting a page');

				await expect(
					DataStore.query(PostCustomPK, <any>'someid', {
						page: <any>'a',
						limit: 10,
					})
				).rejects.toThrow('Page should be a number');

				await expect(
					DataStore.query(PostCustomPK, <any>'someid', { page: -1, limit: 10 })
				).rejects.toThrow("Page can't be negative");

				await expect(
					DataStore.query(PostCustomPK, <any>'someid', {
						page: 0,
						limit: <any>'avalue',
					})
				).rejects.toThrow('Limit should be a number');

				await expect(
					DataStore.query(PostCustomPK, <any>'someid', {
						page: 0,
						limit: -1,
					})
				).rejects.toThrow("Limit can't be negative");
			});

			describe('Type definitions', () => {
				let PostCustomPK: PersistentModelConstructor<PostCustomPKType>;

				beforeEach(() => {
					let model: PostCustomPKType;

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
					({
						initSchema,
						DataStore,
					} = require('../../src/datastore/datastore'));

					const classes = initSchema(testSchema());

					({ PostCustomPK } = classes as {
						PostCustomPK: PersistentModelConstructor<PostCustomPKType>;
					});

					model = new PostCustomPK({
						postId: '12345',
						title: 'Some value',
						dateCreated: new Date().toISOString(),
					});
				});

				describe('Query', () => {
					test('all', async () => {
						const allPostCustomPKs = await DataStore.query(PostCustomPK);

						expectType<PostCustomPKType[]>(allPostCustomPKs);

						const [one] = allPostCustomPKs;
						expect(one.title).toBeDefined();
						expect(one).toBeInstanceOf(PostCustomPK);
					});
					test('one by custom PK', async () => {
						const onePostCustomPKById = await DataStore.query(
							PostCustomPK,
							'someid'
						);

						expectType<PostCustomPKType>(onePostCustomPKById!);
						expect(onePostCustomPKById!.title).toBeDefined();
						expect(onePostCustomPKById).toBeInstanceOf(PostCustomPK);
					});
					test('with criteria', async () => {
						const multiPostCustomPKWithCriteria = await DataStore.query(
							PostCustomPK,
							c => c.title.contains('something')
						);

						expectType<PostCustomPKType[]>(multiPostCustomPKWithCriteria);

						const [one] = multiPostCustomPKWithCriteria;
						expect(one.title).toBeDefined();
						expect(one).toBeInstanceOf(PostCustomPK);
					});
					test('with pagination', async () => {
						const allPostCustomPKsPaginated = await DataStore.query(
							PostCustomPK,
							Predicates.ALL,
							{ page: 0, limit: 20 }
						);

						expectType<PostCustomPKType[]>(allPostCustomPKsPaginated);
						const [one] = allPostCustomPKsPaginated;
						expect(one.title).toBeDefined();
						expect(one).toBeInstanceOf(PostCustomPK);
					});
				});

				describe('Query with generic type', () => {
					test('all', async () => {
						const allPostCustomPKs =
							await DataStore.query<PostCustomPKType>(PostCustomPK);

						expectType<PostCustomPKType[]>(allPostCustomPKs);

						const [one] = allPostCustomPKs;
						expect(one.title).toBeDefined();
						expect(one).toBeInstanceOf(PostCustomPK);
					});
					test('one by postId', async () => {
						const onePostCustomPKById = await DataStore.query<PostCustomPKType>(
							PostCustomPK,
							'someid'
						);
						expectType<PostCustomPKType>(onePostCustomPKById!);
						expect(onePostCustomPKById!.title).toBeDefined();
						expect(onePostCustomPKById).toBeInstanceOf(PostCustomPK);
					});
					test('with criteria', async () => {
						const multiPostCustomPKWithCriteria =
							await DataStore.query<PostCustomPKType>(PostCustomPK, c =>
								c.title.contains('something')
							);

						expectType<PostCustomPKType[]>(multiPostCustomPKWithCriteria);

						const [one] = multiPostCustomPKWithCriteria;
						expect(one.title).toBeDefined();
						expect(one).toBeInstanceOf(PostCustomPK);
					});
					test('with pagination', async () => {
						const allPostCustomPKsPaginated =
							await DataStore.query<PostCustomPKType>(
								PostCustomPK,
								Predicates.ALL,
								{ page: 0, limit: 20 }
							);

						expectType<PostCustomPKType[]>(allPostCustomPKsPaginated);
						const [one] = allPostCustomPKsPaginated;
						expect(one.title).toBeDefined();
						expect(one).toBeInstanceOf(PostCustomPK);
					});
				});
			});
		});
	});
});
