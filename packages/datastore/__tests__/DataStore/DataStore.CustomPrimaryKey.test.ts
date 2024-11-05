import { from, of } from 'rxjs';

import { Predicates } from '../../src/predicates';
import {
	NonModelTypeConstructor,
	PersistentModelConstructor,
} from '../../src/types';
import {
	DataStore as DataStoreType,
	initSchema as initSchemaType,
} from '../../src/datastore/datastore';
import { ExclusiveStorage as StorageType } from '../../src/storage/storage';
import {
	Metadata,
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

describe('DataStore Custom PK tests', () => {
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

	describe('initSchema tests', () => {
		test('PostCustomPK class is created', () => {
			const classes = initSchema(testSchema());

			expect(classes).toHaveProperty('PostCustomPK');

			const { PostCustomPK } = classes as {
				PostCustomPK: PersistentModelConstructor<PostCustomPKType>;
			};

			expect(PostCustomPK).toHaveProperty(
				nameOf<PersistentModelConstructor<any>>('copyOf'),
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
					"copyOf() does not update PK fields. The 'postId' update is being ignored.",
				),
				expect.objectContaining({ source: model1 }),
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
				expectedPatchedFields,
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
					value: ['john@doe.com', 'jane@doe.com', 'joe@doe.com', 'joe@doe.com'],
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
			}).toThrow('Field title should be of type string, number received. 1234');

			expect(() => {
				new PostCustomPK({
					postId: '12345',
					title: 'someField',
					dateCreated: 'not-a-date',
				});
			}).toThrow(
				'Field dateCreated should be of type AWSDateTime, validation failed. not-a-date',
			);

			expect(() => {
				new PostCustomPK({
					postId: '12345',
					title: 'someField',
					dateCreated: new Date().toISOString(),
					emails: [null as any], // because we're trying to trigger JS error
				});
			}).toThrow(
				'All elements in the emails array should be of type string, [null] received. ',
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
				'All elements in the emails array should be of type AWSEmail, validation failed for one or more elements. not-an-email',
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
			}).toThrow('Field title should be of type string, number received. 1234');
		});

		test('Delete params', async () => {
			await expect(DataStore.delete(<any>undefined)).rejects.toThrow(
				'Model or Model Constructor required',
			);

			await expect(DataStore.delete(<any>PostCustomPK)).rejects.toThrow(
				'Id to delete or criteria required. Do you want to delete all? Pass Predicates.ALL',
			);

			await expect(
				DataStore.delete(PostCustomPK, <any>(() => {})),
			).rejects.toThrow(
				"Invalid predicate. Terminate your predicate with a valid condition (e.g., `p => p.field.eq('value')`) or pass `Predicates.ALL`.",
			);

			await expect(DataStore.delete(<any>{})).rejects.toThrow(
				'Object is not an instance of a valid model',
			);

			await expect(
				DataStore.delete(
					new PostCustomPK({
						postId: '12345',
						title: 'somevalue',
						dateCreated: new Date().toISOString(),
					}),
					<any>{},
				),
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
						}),
					);
				}),
			);

			const deleted = await DataStore.delete(PostCustomPK, m =>
				m.title.eq('someField'),
			);

			const sortedRecords = deleted.sort((a, b) =>
				a.postId < b.postId ? -1 : 1,
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
				}),
			);

			const deleted: PostCustomPKType[] = await DataStore.delete(
				PostCustomPK,
				saved.postId,
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
				}),
			);

			const deleted: PostCustomPKType[] = await DataStore.delete(
				PostCustomPK,

				m => m.postId.eq(saved.postId),
			);

			expect(deleted.length).toEqual(1);
			expect(deleted[0]).toEqual(model!);
		});

		test('Query params', async () => {
			await expect(DataStore.query(<any>undefined)).rejects.toThrow(
				'Constructor is not for a valid model',
			);

			await expect(DataStore.query(<any>undefined)).rejects.toThrow(
				'Constructor is not for a valid model',
			);

			await expect(
				DataStore.query(PostCustomPK, <any>'someid', { page: 0 }),
			).rejects.toThrow('Limit is required when requesting a page');

			await expect(
				DataStore.query(PostCustomPK, <any>'someid', {
					page: <any>'a',
					limit: 10,
				}),
			).rejects.toThrow('Page should be a number');

			await expect(
				DataStore.query(PostCustomPK, <any>'someid', { page: -1, limit: 10 }),
			).rejects.toThrow("Page can't be negative");

			await expect(
				DataStore.query(PostCustomPK, <any>'someid', {
					page: 0,
					limit: <any>'avalue',
				}),
			).rejects.toThrow('Limit should be a number');

			await expect(
				DataStore.query(PostCustomPK, <any>'someid', {
					page: 0,
					limit: -1,
				}),
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
				({ initSchema, DataStore } = require('../../src/datastore/datastore'));

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
						'someid',
					);

					expectType<PostCustomPKType>(onePostCustomPKById!);
					expect(onePostCustomPKById!.title).toBeDefined();
					expect(onePostCustomPKById).toBeInstanceOf(PostCustomPK);
				});
				test('with criteria', async () => {
					const multiPostCustomPKWithCriteria = await DataStore.query(
						PostCustomPK,
						c => c.title.contains('something'),
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
						{ page: 0, limit: 20 },
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
						'someid',
					);
					expectType<PostCustomPKType>(onePostCustomPKById!);
					expect(onePostCustomPKById!.title).toBeDefined();
					expect(onePostCustomPKById).toBeInstanceOf(PostCustomPK);
				});
				test('with criteria', async () => {
					const multiPostCustomPKWithCriteria =
						await DataStore.query<PostCustomPKType>(PostCustomPK, c =>
							c.title.contains('something'),
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
							{ page: 0, limit: 20 },
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
