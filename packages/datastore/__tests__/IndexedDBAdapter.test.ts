import Adapter from '../src/storage/adapter/IndexedDBAdapter';
import 'fake-indexeddb/auto';
import {
	DataStore as DataStoreType,
	initSchema as initSchemaType,
	syncClasses,
} from '../src/datastore/datastore';
import { PersistentModelConstructor, SortDirection } from '../src/types';
import {
	pause,
	expectMutation,
	Model,
	User,
	Profile,
	Post,
	Comment,
	testSchema,
	getDataStore,
} from './helpers';
import { Predicates } from '../src/predicates';
import { addCommonQueryTests } from './commonAdapterTests';

let initSchema: typeof initSchemaType;
let DataStore: typeof DataStoreType;
// using any to get access to private methods
const IDBAdapter = <any>Adapter;

describe('IndexedDBAdapter tests', () => {
	async function getMutations(adapter) {
		await pause(250);
		return await adapter.getAll('sync_MutationEvent');
	}

	async function clearOutbox(adapter) {
		await pause(250);
		return await adapter.delete(syncClasses['MutationEvent']);
	}

	({ initSchema, DataStore } = require('../src/datastore/datastore'));
	addCommonQueryTests({
		initSchema,
		DataStore,
		storageAdapter: Adapter,
		getMutations,
		clearOutbox,
	});

	describe('Query', () => {
		let Model: PersistentModelConstructor<Model>;
		let model1Id: string;
		const spyOnGetOne = jest.spyOn(IDBAdapter, 'getByKey');
		const spyOnGetAll = jest.spyOn(IDBAdapter, 'getAll');
		const spyOnEngine = jest.spyOn(IDBAdapter, 'enginePagination');
		const spyOnMemory = jest.spyOn(IDBAdapter, 'inMemoryPagination');

		beforeAll(async () => {
			({ initSchema, DataStore } = require('../src/datastore/datastore'));
			DataStore.configure({ storageAdapter: Adapter });

			const classes = initSchema(testSchema());

			({ Model } = classes as {
				Model: PersistentModelConstructor<Model>;
			});

			// NOTE: sort() test on these models can be flaky unless we
			// strictly control the datestring of each! In a non-negligible percentage
			// of test runs on a reasonably fast machine, DataStore.save() seemed to return
			// quickly enough that dates were colliding. (or so it seemed!)

			const baseDate = new Date();

			await DataStore.start();

			({ id: model1Id } = await DataStore.save(
				new Model({
					field1: 'field1 value 0',
					dateCreated: baseDate.toISOString(),
				})
			));
			await DataStore.save(
				new Model({
					field1: 'field1 value 1',
					dateCreated: new Date(baseDate.getTime() + 1).toISOString(),
				})
			);
			await DataStore.save(
				new Model({
					field1: 'field1 value 2',
					dateCreated: new Date(baseDate.getTime() + 2).toISOString(),
				})
			);
		});

		beforeEach(() => {
			jest.clearAllMocks();
		});

		afterAll(async () => {
			await DataStore.clear();
		});

		it('Should call getById for query by id', async () => {
			const result = await DataStore.query(Model, model1Id);

			expect(result!.field1).toEqual('field1 value 0');
			expect(spyOnGetOne).toHaveBeenCalled();
			expect(spyOnGetAll).not.toHaveBeenCalled();
			expect(spyOnEngine).not.toHaveBeenCalled();
			expect(spyOnMemory).not.toHaveBeenCalled();
		});

		it('Should call getAll & inMemoryPagination for query with a predicate', async () => {
			const results = await DataStore.query(Model, c =>
				c.field1.eq('field1 value 1')
			);

			expect(results.length).toEqual(1);
			expect(spyOnGetAll).toHaveBeenCalled();
			expect(spyOnEngine).not.toHaveBeenCalled();
			expect(spyOnMemory).toHaveBeenCalled();
		});

		it('Should call getAll & inMemoryPagination for query with sort', async () => {
			const results = await DataStore.query(Model, Predicates.ALL, {
				sort: s => s.dateCreated(SortDirection.DESCENDING),
			});

			expect(results.length).toEqual(3);
			expect(results[0].field1).toEqual('field1 value 2');
			expect(spyOnGetAll).toHaveBeenCalled();
			expect(spyOnEngine).not.toHaveBeenCalled();
			expect(spyOnMemory).toHaveBeenCalled();
		});

		it('Should call enginePagination for query with pagination but no sort or predicate', async () => {
			const results = await DataStore.query(Model, Predicates.ALL, {
				limit: 1,
			});

			expect(results.length).toEqual(1);
			expect(spyOnGetAll).not.toHaveBeenCalled();
			expect(spyOnEngine).toHaveBeenCalled();
			expect(spyOnMemory).not.toHaveBeenCalled();
		});

		it('Should call getAll for query without predicate and pagination', async () => {
			const results = await DataStore.query(Model);

			expect(results.length).toEqual(3);
			expect(spyOnGetAll).toHaveBeenCalled();
			expect(spyOnEngine).not.toHaveBeenCalled();
			expect(spyOnMemory).not.toHaveBeenCalled();
		});
	});

	describe('Delete', () => {
		let User: PersistentModelConstructor<User>;
		let Profile: PersistentModelConstructor<Profile>;
		let profile1Id: string;
		let user1Id: string;
		let Post: PersistentModelConstructor<Post>;
		let Comment: PersistentModelConstructor<Comment>;
		let post1Id: string;
		let comment1Id: string;

		beforeAll(async () => {
			({ initSchema, DataStore } = require('../src/datastore/datastore'));

			const classes = initSchema(testSchema());

			({ User } = classes as {
				User: PersistentModelConstructor<User>;
			});

			({ Profile } = classes as {
				Profile: PersistentModelConstructor<Profile>;
			});

			({ id: profile1Id } = await DataStore.save(
				new Profile({ firstName: 'Rick', lastName: 'Bob' })
			));

			({ id: user1Id } = await DataStore.save(
				new User({ name: 'test', profileID: profile1Id })
			));
		});

		beforeEach(async () => {
			({ initSchema, DataStore } = require('../src/datastore/datastore'));
			const classes = initSchema(testSchema());
			({ Post } = classes as {
				Post: PersistentModelConstructor<Post>;
			});

			({ Comment } = classes as {
				Comment: PersistentModelConstructor<Comment>;
			});

			const post = await DataStore.save(new Post({ title: 'Test' }));
			({ id: post1Id } = post);

			({ id: comment1Id } = await DataStore.save(
				new Comment({ content: 'Test Content', post })
			));
		});

		it('Should perform a cascading delete on a record with a Has One relationship', async () => {
			expect.assertions(4);
			let user = await DataStore.query(User, user1Id);
			let profile = await DataStore.query(Profile, profile1Id);

			// double-checking that both of the records exist at first
			expect(user!.id).toEqual(user1Id);
			expect(profile!.id).toEqual(profile1Id);

			await DataStore.delete(User, user1Id);

			user = await DataStore.query(User, user1Id);
			profile = await DataStore.query(Profile, profile1Id);

			// both should be undefined, even though we only explicitly deleted the user
			expect(user).toBeUndefined();
			expect(profile).toBeUndefined();
		});

		it('Should perform a cascading delete on a record with a Has Many relationship', async () => {
			expect.assertions(4);
			let post = await DataStore.query(Post, post1Id);
			let comment = await DataStore.query(Comment, comment1Id);

			// double-checking that both of the records exist at first
			expect(post!.id).toEqual(post1Id);
			expect(comment!.id).toEqual(comment1Id);

			await DataStore.delete(Post, post!.id);

			post = await DataStore.query(Post, post1Id);
			comment = await DataStore.query(Comment, comment1Id);

			// both should be undefined, even though we only explicitly deleted the post
			expect(post).toBeUndefined();
			expect(comment).toBeUndefined();
		});
	});

	describe('Save', () => {
		let User: PersistentModelConstructor<User>;
		let Profile: PersistentModelConstructor<Profile>;
		let profile: Profile;

		beforeAll(async () => {
			({ initSchema, DataStore } = require('../src/datastore/datastore'));

			const classes = initSchema(testSchema());

			({ User } = classes as {
				User: PersistentModelConstructor<User>;
			});

			({ Profile } = classes as {
				Profile: PersistentModelConstructor<Profile>;
			});

			profile = await DataStore.save(
				new Profile({ firstName: 'Rick', lastName: 'Bob' })
			);
		});

		it('should allow linking model via model field', async () => {
			const savedUser = await DataStore.save(
				new User({ name: 'test', profile })
			);
			const user1Id = savedUser.id;

			const user = await DataStore.query(User, user1Id);
			expect(user!.profileID).toEqual(profile.id);
			expect(await user!.profile).toEqual(profile);
		});

		it('should allow linking model via FK', async () => {
			const savedUser = await DataStore.save(
				new User({ name: 'test', profileID: profile.id })
			);
			const user1Id = savedUser.id;

			const user = await DataStore.query(User, user1Id);
			expect(user!.profileID).toEqual(profile.id);
			expect(await user!.profile).toEqual(profile);
		});
	});

	describe('Benchmark', () => {
		const { DataStore, User } = getDataStore();

		afterEach(async () => {
			await DataStore.clear();
		});

		const benchmark = async (f, iterations = 1000) => {
			const start = new Date();
			for (let i = 0; i < iterations; i++) {
				await f();
			}
			const end = new Date();
			return end.getTime() - start.getTime();
		};

		/**
		 * This test ensures fake indexeddb is giving us observably different performance on indexed
		 * vs non-indexed queries, as well as demonstrate a baseline for how much of a difference we're
		 * looking for.
		 */
		test('[SANITY CHECK] queries against key vs key-key fields yield measurably different performance', async () => {
			// get by PK using the `byId` index is sable behavior, AFAIK. so, we'll benchmark against that.
			// saving records is very heavy. to stay within test time limits, we'll seed a "small" number of
			// records a query "many" times.

			// as we seed records, remember the *last* user, so that scans and queries work "reasonably hard"
			// to find it.
			let user: User;

			// seed the records
			for (let i = 0; i < 250; i++) {
				user = await DataStore.save(
					new User({
						name: `user ${i}`,
					})
				);
			}

			// check timing of fetch byPk
			const byPkTime = await benchmark(async () => {
				const fetched = await DataStore.query(User, user.id);
				expect(fetched).toBeDefined();
			});

			// check timing of fetch by non-indexed field (name)
			const byNameTime = await benchmark(async () => {
				const fetched = await DataStore.query(User, u => u.name.eq(user.name));
				expect(fetched.length).toBe(1);
			});

			// clamp indexed queries on a small data-set to be less than 1/3
			// of the runtime of their non-indexed equivalent.
			//
			// We're using a rather unimpressive 1/3 here instead of
			// something smaller and more realistic overall (like 1/8) because of the
			// overhead of each loop, such as asserting on the results.
			expect(byPkTime / byNameTime).toBeLessThanOrEqual(1 / 3);
		});
	});
});
