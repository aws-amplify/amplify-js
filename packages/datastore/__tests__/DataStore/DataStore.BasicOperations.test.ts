import { from, of } from 'rxjs';
import {
	DataStore as DataStoreType,
	initSchema as initSchemaType,
} from '../../src/datastore/datastore';
import {
	NonModelTypeConstructor,
	PersistentModelConstructor,
} from '../../src/types';
import { Metadata, Model, testSchema, getDataStore } from '../helpers';

let initSchema: typeof initSchemaType;

let { DataStore } = getDataStore() as {
	DataStore: typeof DataStoreType;
};

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
		expect(patches[0].map(p => p.path.join(''))).toEqual(expectedPatchedFields);
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
			}).toThrow('Field login should be of type Login, string recieved. login');
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
			}).toThrow('Field username should be of type string, number received. 4');
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
