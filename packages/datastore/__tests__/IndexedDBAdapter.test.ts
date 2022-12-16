import * as IDB from 'idb';
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
	DefaultPKParent,
	DefaultPKChild,
	CompositePKParent,
	CompositePKChild,
	testSchema,
	getDataStore,
} from './helpers';
import { Predicates as PredicatesClass } from '../src/predicates';
import { addCommonQueryTests } from './commonAdapterTests';

let initSchema: typeof initSchemaType;
let DataStore: typeof DataStoreType;
let Predicates = PredicatesClass;

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

		let spyOnGetOne: jest.SpyInstance<any>;
		let spyOnGetAll: jest.SpyInstance<any>;
		let spyOnEngine: jest.SpyInstance<any>;
		let spyOnMemory: jest.SpyInstance<any>;

		beforeEach(async () => {
			({ DataStore, Model } = getDataStore({
				storageAdapterFactory: () => {
					const IDBAdapter =
						require('../src/storage/adapter/IndexedDBAdapter').default;
					spyOnGetOne = jest.spyOn(IDBAdapter, 'getByKey');
					spyOnGetAll = jest.spyOn(IDBAdapter, 'getAll');
					spyOnEngine = jest.spyOn(IDBAdapter, 'enginePagination');
					spyOnMemory = jest.spyOn(IDBAdapter, 'inMemoryPagination');

					// becuase jest has cleared modules, the `Predicates.ALL` we currently have is
					// not the particular instance DataStore recognizes. functionally, this would
					// return the the correct results. but, it won't hit the code paths we're looking
					// to hit in these tests. so, we need to re-import it.
					// this affects calls to `inMemoryPagination` and `enginePagination` in particular
					({ Predicates } = require('../src/predicates'));

					return IDBAdapter;
				},
			}));

			// NOTE: sort() test on these models can be flaky unless we
			// strictly control the datestring of each! In a non-negligible percentage
			// of test runs on a reasonably fast machine, DataStore.save() seemed to return
			// quickly enough that dates were colliding. (or so it seemed!)

			const baseDate = new Date();

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

			jest.clearAllMocks();
		});

		afterEach(async () => {
			await DataStore.clear();
			jest.restoreAllMocks();
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

		beforeEach(async () => {
			({ DataStore, User, Profile, Post, Comment } = getDataStore({
				storageAdapterFactory: () =>
					require('../src/storage/adapter/IndexedDBAdapter').default,
			}));

			({ id: profile1Id } = await DataStore.save(
				new Profile({ firstName: 'Rick', lastName: 'Bob' })
			));

			({ id: user1Id } = await DataStore.save(
				new User({ name: 'test', profileID: profile1Id })
			));

			({ id: profile1Id } = await DataStore.save(
				new Profile({ firstName: 'Rick', lastName: 'Bob' })
			));

			({ id: user1Id } = await DataStore.save(
				new User({ name: 'test', profileID: profile1Id })
			));

			const post = await DataStore.save(new Post({ title: 'Test' }));
			({ id: post1Id } = post);

			({ id: comment1Id } = await DataStore.save(
				new Comment({ content: 'Test Content', post })
			));
		});

		afterEach(async () => {
			await DataStore.clear();
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

		beforeEach(async () => {
			({ DataStore, User, Profile } = getDataStore({
				storageAdapterFactory: () =>
					require('../src/storage/adapter/IndexedDBAdapter').default,
			}));

			profile = await DataStore.save(
				new Profile({ firstName: 'Rick', lastName: 'Bob' })
			);
		});

		afterEach(async () => {
			await DataStore.clear();
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
});

/**
 * Execute many operations against datastore, comparing performance between operations
 * that should benefit from using indexes versus those that don't.
 *
 * Unlike clamping fine-grained calls to the adapter, these also ensure no other funny
 * business is going on. But, they should be kept to a minimum as they consume notable
 * wall-clock time.
 */
describe('IndexedDB benchmarks', () => {
	let adapter: typeof Adapter;

	const {
		DataStore,
		User,
		DefaultPKParent,
		DefaultPKChild,
		CompositePKParent,
		CompositePKChild,
	} = getDataStore({
		storageAdapterFactory: () => {
			adapter = require('../src/storage/adapter/IndexedDBAdapter').default;
			return adapter;
		},
	});

	afterEach(async () => {
		await DataStore.clear();
	});

	const benchmark = async (f, iterations = 100) => {
		const start = new Date();
		for (let i = 0; i < iterations; i++) {
			await f();
		}
		const end = new Date();
		return end.getTime() - start.getTime();
	};

	/**
	 * Saves a bunch of records to IndexedDB directly, bypassing DataStore.
	 *
	 * Used to load a lot of data very quickly, bypassing DataStore safety checks, and
	 * performing all saves in a single transaction for maximum speed.
	 *
	 * Intended specifically for seeing benchmark data.
	 *
	 * @param size number of records to add
	 * @param table the table to add to
	 * @param build a function that accepts an Int (number of record to add) and returns
	 * an instantiated record to save.
	 */
	const sideloadIDBData = async <T>(
		size: number,
		table: string,
		build: (i: number) => T
	) => {
		await DataStore.start();
		const db = (adapter as any).db;

		const tx = db.transaction([`user_${table}`], 'readwrite');
		const store = tx.objectStore(`user_${table}`);

		async function save(item: T) {
			await store.add(item);
			return item;
		}

		const saves: Promise<any>[] = [];
		for (let i = 0; i < size; i++) {
			saves.push(save(build(i)));
		}
		await Promise.all(saves);

		// should exist, even though TS doesn't believe it exists.
		await tx.done;
	};

	/**
	 * This test ensures fake indexeddb is giving us observably different performance on indexed
	 * vs non-indexed queries, as well as demonstrate a baseline for how much of a difference we're
	 * looking for.
	 */
	test('[SANITY CHECK] PK queries against measurably faster than queries against non-key fields', async () => {
		// get by PK using the `byId` index is sable behavior, AFAIK. so, we'll benchmark against that.
		// saving records is very heavy. to stay within test time limits, we'll seed a "small" number of
		// records a query "many" times.

		// as we seed records, we'll remember the last inserted user.
		let user: User;

		// seed the records
		await sideloadIDBData(250, 'User', i => {
			user = new User({
				name: `user ${i}`,
			});
			return user;
		});

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

		// clamp indexed queries on a small data-set to be less than 1/2
		// of the runtime of their non-indexed equivalent.
		//
		// We're using a rather unimpressive 1/2 here instead of
		// something smaller and more realistic overall (like 1/8) because of the
		// overhead of each loop, such as asserting on the results.
		expect(byPkTime / byNameTime).toBeLessThanOrEqual(1 / 2);
	});

	test('queries using `eq` against indexed vs non-indexed field are measurably faster', async () => {
		// `id.eq()` should use an index, `name.eq()` should not.

		// as we seed records, we'll remember the last inserted user.
		let user: User;

		await sideloadIDBData(250, 'User', i => {
			user = new User({
				name: `user ${i}`,
			});
			return user;
		});

		// check timing of fetch byPk
		const byPkTime = await benchmark(async () => {
			const fetched = await DataStore.query(User, u => u.id.eq(user.id));
			expect(fetched).toBeDefined();
		});

		// check timing of fetch by non-indexed field (name)
		const byNameTime = await benchmark(async () => {
			const fetched = await DataStore.query(User, u => u.name.eq(user.name));
			expect(fetched.length).toBe(1);
		});

		// clamp indexed queries on a small data-set to be less than 1/2
		// of the runtime of their non-indexed equivalent.
		//
		// We're using a rather unimpressive 1/2 here instead of
		// something smaller and more realistic overall (like 1/8) because of the
		// overhead of each loop, such as asserting on the results.
		expect(byPkTime / byNameTime).toBeLessThanOrEqual(1 / 2);
	});

	test('queries using `eq` against multi-field indexes vs non-indexed field are measurably faster', async () => {
		// `id.eq()` should use an index, `name.eq()` should not.

		// as we seed records, we'll remember the last inserted user.
		let item: CompositePKParent;

		await sideloadIDBData(250, 'CompositePKParent', i => {
			item = new CompositePKParent({
				customId: `id ${i}`,
				content: `content ${i}`,
			});
			return item;
		});

		// check timing of fetch byPk
		const byContentTime = await benchmark(async () => {
			// `content` alone will not be able to use the index.
			const fetched = await DataStore.query(CompositePKParent, i =>
				i.content.eq(item.content)
			);
			expect(fetched).toBeDefined();
		});

		// check timing of fetch by non-indexed field (name)
		const byPKEqTime = await benchmark(async () => {
			const fetched = await DataStore.query(CompositePKParent, ({ and }) =>
				and(i => [i.customId.eq(item.customId), i.content.eq(item.content)])
			);
			expect(fetched.length).toBe(1);
		});

		console.log({ byPKEqTime, byContentTime });

		// clamp indexed queries on a small data-set to be less than 1/2
		// of the runtime of their non-indexed equivalent.
		//
		// We're using a rather unimpressive 1/2 here instead of
		// something smaller and more realistic overall (like 1/8) because of the
		// overhead of each loop, such as asserting on the results.
		expect(byPKEqTime / byContentTime).toBeLessThanOrEqual(1 / 2);
	});

	test('deep joins are within time limits expected if indexes are being used using default PK', async () => {
		const parents: DefaultPKParent[] = [];
		await sideloadIDBData(250, 'DefaultPKParent', i => {
			const parent = new DefaultPKParent({
				content: `content ${i}`,
			});
			parents.push(parent);
			return parent;
		});

		let child: DefaultPKChild;
		await sideloadIDBData(250, 'DefaultPKChild', i => {
			child = new DefaultPKChild({
				content: `content ${i}`,
				parent: parents[i],
			});
			return child;
		});

		const time = await benchmark(async () => {
			const fetched = await DataStore.query(DefaultPKParent, p =>
				p.children.parent.children.parent.children.parent.children.parent.children.parent.children.id.eq(
					child.id
				)
			);
			expect(fetched.length).toBe(1);
		}, 1);

		// actual time on a decent dev machine is around 15ms, compared
		// to over 130ms when the optimization is disabled.
		expect(time).toBeLessThan(50);
	});

	test('deep joins are within time limits expected if indexes are being used using custom PK', async () => {
		const parents: CompositePKParent[] = [];
		await sideloadIDBData(250, 'CompositePKParent', i => {
			const parent = new CompositePKParent({
				customId: `id ${i}`,
				content: `content ${i}`,
			});
			parents.push(parent);
			return parent;
		});

		let child: CompositePKChild;
		await sideloadIDBData(250, 'CompositePKChild', i => {
			child = new CompositePKChild({
				childId: `id ${i}`,
				content: `content ${i}`,
				parent: parents[i],
			});
			return child;
		});

		const time = await benchmark(async () => {
			const fetched = await DataStore.query(CompositePKParent, p =>
				p.children.parent.children.parent.children.parent.children.parent.children.parent.children.and(
					c => [c.childId.eq(child.childId), c.content.eq(child.content)]
				)
			);
			expect(fetched.length).toBe(1);
		}, 1);

		// actual time on a decent dev machine is around 20ms, compared
		// to over 150ms when the optimization is disabled.
		expect(time).toBeLessThan(50);
	});
});
