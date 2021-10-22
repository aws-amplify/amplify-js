import Adapter from '../src/storage/adapter/IndexedDBAdapter';
import 'fake-indexeddb/auto';
import {
	DataStore as DataStoreType,
	initSchema as initSchemaType,
} from '../src/datastore/datastore';
import { PersistentModelConstructor, SortDirection } from '../src/types';
import { Model, User, Post, Comment, Profile, testSchema } from './helpers';
import { Predicates } from '../src/predicates';

let initSchema: typeof initSchemaType;
let DataStore: typeof DataStoreType;
// using any to get access to private methods
const IDBAdapter = <any>Adapter;

describe('IndexedDBAdapter tests', () => {
	describe('Query', () => {
		let Model: PersistentModelConstructor<Model>;
		let Post: PersistentModelConstructor<Post>;
		let Comment: PersistentModelConstructor<Comment>;
		let model1Id: string;
		const spyOnGetOne = jest.spyOn(IDBAdapter, 'getById');
		const spyOnGetAll = jest.spyOn(IDBAdapter, 'getAll');
		const spyOnEngine = jest.spyOn(IDBAdapter, 'enginePagination');
		const spyOnMemory = jest.spyOn(IDBAdapter, 'inMemoryPagination');

		beforeAll(async () => {
			({ initSchema, DataStore } = require('../src/datastore/datastore'));

			const classes = initSchema(testSchema());

			({ Model, Post, Comment } = classes as {
				Model: PersistentModelConstructor<Model>;
				Post: PersistentModelConstructor<Post>;
				Comment: PersistentModelConstructor<Comment>;
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
			expect(spyOnEngine).not.toHaveBeenCalled();
			expect(spyOnMemory).not.toHaveBeenCalled();
		});

		it('Should call getAll & inMemoryPagination for query with a predicate', async () => {
			const results = await DataStore.query(Model, c =>
				c.field1.eq('another value')
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

		// TODO: make ALL comparison operators use available indexes when possible.
		// This particular test just ensures nested predicates JOINS are scalable.
		it.only('Should scale closer to O(log(N)) than O(N) time for eq() against non-PK keys', async () => {
			// Comment has byPost key

			// make some data happen
			async function populateSampleData(size) {
				await DataStore.clear();
				for (let post_i = 0; post_i < size; post_i++) {
					const post = await DataStore.save(
						new Post({
							title: `post ${post_i}`,
						})
					);
					await DataStore.save(
						new Comment({
							content: `comment on post (${post_i})`,
							post,
						})
					);
				}
			}

			async function getSampleComments(postId: string, expectTitle: string) {
				const comments = await DataStore.query(Comment, c =>
					c.post.id.eq(postId)
				);
				expect(comments.length).toEqual(1);
				expect(comments[0].content).toEqual(expectTitle);
			}

			async function benchmarkBatch(size) {
				// populate data!
				await populateSampleData(size);

				const timings = [];

				const samplePosts = await DataStore.query(Post, p =>
					p.title.contains(Math.floor(size / 2).toString())
				);

				// get a few timings
				const samplesCount = 5;
				for (let i = 0; i < samplesCount; i++) {
					const start = performance.now();

					// magnify the timings
					for (let j = 0; j < 50; j++) {
						// fetch some post comments somewhere in the middle
						await getSampleComments(
							samplePosts[0].id,
							`comment on post (${Math.floor(size / 2).toString()})`
						);
					}

					timings.push(performance.now() - start);
				}

				// use the median behavior to try to ignore outlying behavior.
				timings.sort();
				return timings[Math.floor(samplesCount / 2)];
			}

			function bigODifference(
				bigOFunction,
				baselineSize,
				baselineTime,
				testSize,
				testTime
			) {
				const pureBigOTime = bigOFunction(baselineSize);
				const coefficient = baselineTime / pureBigOTime;
				const pureTestBatchTime = bigOFunction(testSize);
				const adjustedTestBatchTime = coefficient * pureTestBatchTime;
				const diff = Math.abs(adjustedTestBatchTime - testTime);
				console.log('bigODiff', {
					baselineSize,
					baselineTime,
					testSize,
					testTime,
					pureBigOTime,
					coefficient,
					pureTestBatchTime,
					adjustedTestBatchTime,
					diff,
				});
				return diff;
			}

			// we'll want to ignore any constant-time overhead from measurement comparisions.
			// this number is slightly inflated. but, the inflation should be a negligible
			// proportion of the larger batch timings, which are orders of magnitude larger.
			// the warm-up batch accounts for anything under the hood on the first interaction
			// that won't happen in subsequent batches.
			await benchmarkBatch(1);
			const overheadTime = await benchmarkBatch(1);

			const baselineSize = 20;
			const baselineTime = (await benchmarkBatch(baselineSize)) - overheadTime;

			const testBatchSize = 100;
			const testBatchTime =
				(await benchmarkBatch(testBatchSize)) - overheadTime;

			const linearTimeDiff = bigODifference(
				n => n,
				baselineSize,
				baselineTime,
				testBatchSize,
				testBatchTime
			);
			const logTimeDiff = bigODifference(
				n => Math.log2(n),
				baselineSize,
				baselineTime,
				testBatchSize,
				testBatchTime
			);

			console.log('COMPLEXITY TEST', {
				overheadTime,
				baselineSize,
				baselineTime,
				testBatchSize,
				testBatchTime,
				linearTimeDiff,
				logTimeDiff,
			});

			// expect actual performance to be closer to pure log time than pure linear time.
			expect(logTimeDiff).toBeLessThan(linearTimeDiff);
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
});
