import Adapter from '../src/storage/adapter/IndexedDBAdapter';
import 'fake-indexeddb/auto';
import {
	DataStore as DataStoreType,
	initSchema as initSchemaType,
} from '../src/datastore/datastore';
import { PersistentModelConstructor, SortDirection } from '../src/types';
import { Model, User, Profile, Post, Comment, testSchema } from './helpers';
import { Predicates } from '../src/predicates';

let initSchema: typeof initSchemaType;
let DataStore: typeof DataStoreType;
// using any to get access to private methods
const IDBAdapter = <any>Adapter;

async function pause(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

describe('IndexedDBAdapter tests', () => {
	describe('Query', () => {
		let Model: PersistentModelConstructor<Model>;
		let model1Id: string;

		const spyOnGetOne = jest.spyOn(IDBAdapter, 'getById');
		const spyOnGetAll = jest.spyOn(IDBAdapter, 'getAll');
		const spyOnEngine = jest.spyOn(IDBAdapter, 'enginePagination');
		const spyOnMemory = jest.spyOn(IDBAdapter, 'inMemoryPagination');

		beforeAll(async () => {
			({ initSchema, DataStore } = require('../src/datastore/datastore'));

			const classes = initSchema(testSchema());

			({ Model } = classes as {
				Model: PersistentModelConstructor<Model>;
			});

			// NOTE: sort() test on these models can be flaky unless we
			// strictly control the datestring of each! In a non-negligible percentage
			// of test runs on a reasonably fast machine, DataStore.save() seemed to return
			// quickly enough that dates were colliding. (or so it seemed!)

			const baseDate = new Date();

			({ id: model1Id } = await DataStore.save(
				new Model({
					field1: 'Some value',
					dateCreated: baseDate.toISOString(),
				})
			));
			await DataStore.save(
				new Model({
					field1: 'another value',
					dateCreated: new Date(baseDate.getTime() + 1).toISOString(),
				})
			);
			await DataStore.save(
				new Model({
					field1: 'a third value',
					dateCreated: new Date(baseDate.getTime() + 2).toISOString(),
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
			expect(spyOnEngine).not.toHaveBeenCalled();
			expect(spyOnMemory).not.toHaveBeenCalled();
		});

		it('Should call getAll & inMemoryPagination for query with a predicate', async () => {
			const results = await DataStore.query(Model, c =>
				c.field1('eq', 'another value')
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
			expect(results[0].field1).toEqual('a third value');
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

		it('should match fields of any non-empty value for `("ne", undefined)`', async () => {
			const results = await DataStore.query(Model, m =>
				m.field1('ne', undefined)
			);
			expect(results.length).toEqual(3);
		});

		it('should match fields of any non-empty value for `("ne", null)`', async () => {
			const results = await DataStore.query(Model, m => m.field1('ne', null));
			expect(results.length).toEqual(3);
		});

		it('should NOT match fields of any non-empty value for `("eq", undefined)`', async () => {
			const results = await DataStore.query(Model, m =>
				m.field1('eq', undefined)
			);
			expect(results.length).toEqual(0);
		});

		it('should NOT match fields of any non-empty value for `("eq", null)`', async () => {
			const results = await DataStore.query(Model, m => m.field1('eq', null));
			expect(results.length).toEqual(0);
		});

		it('should NOT match fields of any non-empty value for `("gt", null)`', async () => {
			const results = await DataStore.query(Model, m => m.field1('gt', null));
			expect(results.length).toEqual(0);
		});

		it('shouldNOT  match fields of any non-empty value for `("ge", null)`', async () => {
			const results = await DataStore.query(Model, m => m.field1('ge', null));
			expect(results.length).toEqual(0);
		});

		it('should NOT match fields of any non-empty value for `("lt", null)`', async () => {
			const results = await DataStore.query(Model, m => m.field1('lt', null));
			expect(results.length).toEqual(0);
		});

		it('should NOT match fields of any non-empty value for `("le", null)`', async () => {
			const results = await DataStore.query(Model, m => m.field1('le', null));
			expect(results.length).toEqual(0);
		});

		it('should NOT match fields of any non-empty value for `("gt", undefined)`', async () => {
			const results = await DataStore.query(Model, m =>
				m.field1('gt', undefined)
			);
			expect(results.length).toEqual(0);
		});

		it('should NOT match fields of any non-empty value for `("ge", undefined)`', async () => {
			const results = await DataStore.query(Model, m =>
				m.field1('ge', undefined)
			);
			expect(results.length).toEqual(0);
		});

		it('should NOT match fields of any non-empty value for `("lt", undefined)`', async () => {
			const results = await DataStore.query(Model, m =>
				m.field1('lt', undefined)
			);
			expect(results.length).toEqual(0);
		});

		it('should NOT match fields of any non-empty value for `("le", undefined)`', async () => {
			const results = await DataStore.query(Model, m =>
				m.field1('le', undefined)
			);
			expect(results.length).toEqual(0);
		});
	});

	describe('Delete', () => {
		let User: PersistentModelConstructor<User>;
		let Profile: PersistentModelConstructor<Profile>;
		let profile1Id: string;
		let user1Id: string;

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

		it('Should perform a cascading delete on a record with a Has One relationship', async () => {
			let user = await DataStore.query(User, user1Id);
			let profile = await DataStore.query(Profile, profile1Id);

			// double-checking that both of the records exist at first
			expect(user.id).toEqual(user1Id);
			expect(profile.id).toEqual(profile1Id);

			await DataStore.delete(User, user1Id);

			user = await DataStore.query(User, user1Id);
			profile = await DataStore.query(Profile, profile1Id);

			// both should be undefined, even though we only explicitly deleted the user
			expect(user).toBeUndefined;
			expect(profile).toBeUndefined;
		});
	});

	describe('Save', () => {
		let User: PersistentModelConstructor<User>;
		let Profile: PersistentModelConstructor<Profile>;
		let Comment: PersistentModelConstructor<Comment>;
		let Post: PersistentModelConstructor<Post>;
		let adapter: any;

		async function getMutations() {
			await pause(250);
			return await adapter.getAll('sync_MutationEvent');
		}

		beforeEach(async () => {
			({ initSchema, DataStore } = require('../src/datastore/datastore'));

			DataStore.configure({
				storageAdapter: Adapter,
			});
			(DataStore as any).amplifyConfig.aws_appsync_graphqlEndpoint =
				'https://0.0.0.0/does/not/exist/graphql';

			const classes = initSchema(testSchema());

			({ User, Profile, Comment, Post } = classes as {
				User: PersistentModelConstructor<User>;
				Profile: PersistentModelConstructor<Profile>;
				Comment: PersistentModelConstructor<Comment>;
				Post: PersistentModelConstructor<Post>;
			});

			await DataStore.clear();

			// ensure `.storageAdapter` is set.
			await DataStore.start();

			adapter = (DataStore as any).storageAdapter;
			const syncEngine = (DataStore as any).sync;

			// my jest spy-fu wasn't up to snuff here. but, this succesfully
			// prevents the mutation process from clearing the mutation queue, which
			// allows us to observe the state of mutations.
			(syncEngine as any).mutationsProcessor.isReady = () => false;
		});

		it('should allow linking model via model field', async () => {
			const profile = await DataStore.save(
				new Profile({ firstName: 'Rick', lastName: 'Bob' })
			);

			const savedUser = await DataStore.save(
				new User({ name: 'test', profile })
			);
			const user1Id = savedUser.id;

			const user = await DataStore.query(User, user1Id);
			expect(user.profileID).toEqual(profile.id);
			expect(user.profile).toEqual(profile);
		});

		it('should allow linking model via FK', async () => {
			const profile = await DataStore.save(
				new Profile({ firstName: 'Rick', lastName: 'Bob' })
			);

			const savedUser = await DataStore.save(
				new User({ name: 'test', profileID: profile.id })
			);
			const user1Id = savedUser.id;

			const user = await DataStore.query(User, user1Id);
			expect(user.profileID).toEqual(profile.id);
			expect(user.profile).toEqual(profile);
		});

		it('should produce a single mutation for an updated model with a BelongTo (regression test)', async () => {
			// SQLite adapter, for example, was producing an extra mutation
			// in this scenario.

			const post = await DataStore.save(
				new Post({
					title: 'some post',
				})
			);

			const comment = await DataStore.save(
				new Comment({
					content: 'some comment',
					post,
				})
			);

			console.log('UPDATE CONTENT');

			const updatedComment = await DataStore.save(
				Comment.copyOf(comment, draft => {
					draft.content = 'updated content';
				})
			);

			const mutations = await getMutations();
			console.log('mutations 1', mutations);

			// comment update should be smashed to together with post
			expect(mutations.length).toBe(2);
		});

		it('should produce a mutation for a nested BELONGS_TO insert', async () => {
			const comment = await DataStore.save(
				new Comment({
					content: 'newly created comment',
					post: new Post({
						title: 'newly created post',
					}),
				})
			);

			const mutations = await getMutations();
			console.log('mutations 2', mutations);

			// one for the new comment, one for the new post
			expect(mutations.length).toBe(2);
		});
	});
});
