import 'fake-indexeddb/auto';
import { decodeTime } from 'ulid';
import uuidValidate from 'uuid-validate';
import { Observable, from, of } from 'rxjs';
import {
	DataStore as DataStoreType,
	initSchema as initSchemaType,
	DataStoreClass,
} from '../src/datastore/datastore';
import { Predicates } from '../src/predicates';
import { ExclusiveStorage as StorageType } from '../src/storage/storage';
import {
	NonModelTypeConstructor,
	PersistentModel,
	PersistentModelConstructor,
	ModelInit,
	SortDirection,
} from '../src/types';
import {
	Comment,
	Metadata,
	Model,
	BasicModelRequiredTS,
	getDataStore,
	logDate,
	expectIsolation,
	configureSync,
	unconfigureSync,
	pretendModelsAreSynced,
	warpTime,
	unwarpTime,
	pause,
	Post,
	PostCustomPK as PostCustomPKType,
	Profile,
	testSchema,
	User,
	ModelWithBoolean,
} from './helpers';

type T = ModelInit<Model>;

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

// green
describe('DataStore observeQuery, with fake-indexeddb and fake sync', () => {
	//
	// ~~~~ OH HEY! ~~~~~
	//
	// Remember that `observeQuery()` always issues a first snapshot from the data
	// already in storage. This is naturally performed async. Because of this,
	// if you insert items immediately after `observeQuery()`, some of those items
	// MAY show up in the initial snapshot. (Or maybe they won't!)
	//
	// Many of these tests should therefore include timeouts when adding records.
	// These timeouts let `observeQuery()` sneak in and grab its first snapshot
	// before those records hit storage, making for predictable tests.
	//
	// The tests should also account for that initial, empty snapshot.
	//
	// Remember: Snapshots are cumulative.
	//
	// And Also: Be careful when saving decoy records! Calling `done()` in a
	// subscription body while any `DataStore.save()`'s are outstanding WILL
	// result in cryptic errors that surface in subsequent tests!
	//
	// ("Error: An operation was called on an object on which it is not allowed ...")
	//
	// ~~~~ OK. Thanks! ~~~~
	//
	//   (That's it)
	//

	let Comment: PersistentModelConstructor<Comment>;
	let Post: PersistentModelConstructor<Post>;
	let User: PersistentModelConstructor<User>;
	let Profile: PersistentModelConstructor<Profile>;

	/**
	 * Saves and item and waits until the item surfaces through `observe()`
	 * before returning the saved item. Creates a new subscription specific
	 * to the item being saved, which helps ensure all other observers receive
	 * the item before this function returns.
	 *
	 * @param item The model instance to save
	 * @returns The saved instance, returned from `DataStore.save()`
	 */
	const fullSave = async item => {
		return new Promise(async returnSaved => {
			const monitor = DataStore.observe().subscribe(
				({ element, opType, model }) => {
					if (JSON.stringify(element) === JSON.stringify(savedItem)) {
						monitor.unsubscribe();
						returnSaved(savedItem);
					}
				}
			);
			const savedItem = await DataStore.save(item);
		});
	};

	beforeEach(async () => {
		jest.clearAllMocks();
		({ initSchema, DataStore } = require('../src/datastore/datastore'));
		const classes = initSchema(testSchema());
		({ Comment, Post, User, Profile } = classes as {
			Comment: PersistentModelConstructor<Comment>;
			Post: PersistentModelConstructor<Post>;
			User: PersistentModelConstructor<User>;
			Profile: PersistentModelConstructor<Profile>;
		});

		jest.useFakeTimers();
		await configureSync(DataStore);
	});

	afterEach(async () => {
		await DataStore.clear();
		await unconfigureSync(DataStore);
		jest.useRealTimers();
	});

	test('publishes preexisting local data immediately', async done => {
		try {
			for (let i = 0; i < 5; i++) {
				await DataStore.save(
					new Post({
						title: `the post ${i}`,
					})
				);
			}

			const sub = DataStore.observeQuery(Post).subscribe(({ items }) => {
				expect(items.length).toBe(5);
				for (let i = 0; i < 5; i++) {
					expect(items[i].title).toEqual(`the post ${i}`);
				}
				sub.unsubscribe();
				done();
			});
		} catch (error) {
			done(error);
		}
	});

	test('publishes data saved after first snapshot', async done => {
		try {
			const expecteds = [0, 5];

			const sub = DataStore.observeQuery(Post).subscribe(
				({ items, isSynced }) => {
					const expected = expecteds.shift() || 0;
					expect(items.length).toBe(expected);

					for (let i = 0; i < expected; i++) {
						expect(items[i].title).toEqual(`the post ${i}`);
					}

					if (expecteds.length === 0) {
						sub.unsubscribe();
						done();
					}
				}
			);

			for (let i = 0; i < 5; i++) {
				await fullSave(
					new Post({
						title: `the post ${i}`,
					})
				);
			}

			jest.advanceTimersByTime(2000);
		} catch (error) {
			done(error);
		}
	});

	test('can filter items', async done => {
		try {
			const expecteds = [0, 5];

			const sub = DataStore.observeQuery(Post, p =>
				p.title.contains('include')
			).subscribe(({ items }) => {
				const expected = expecteds.shift() || 0;
				expect(items.length).toBe(expected);

				for (const item of items) {
					expect(item.title).toMatch('include');
				}

				if (expecteds.length === 0) {
					sub.unsubscribe();
					done();
				}
			});

			for (let i = 0; i < 10; i++) {
				await fullSave(
					new Post({
						title: `the post ${i} - ${Boolean(i % 2) ? 'include' : 'omit'}`,
					})
				);
			}

			jest.advanceTimersByTime(2000);
		} catch (error) {
			done(error);
		}
	});

	// Fix for: https://github.com/aws-amplify/amplify-js/issues/9325
	test('can remove newly-unmatched items out of the snapshot on subsequent saves', async done => {
		try {
			// watch for post snapshots.
			// the first "real" snapshot should include all five posts with "include"
			// in the title. after the update to change ONE of those posts to "omit" instead,
			// we should see a snapshot of 4 posts with the updated post removed.
			const expecteds = [0, 4, 3];

			const sub = DataStore.observeQuery(Post, p =>
				p.title.contains('include')
			).subscribe(async ({ items }) => {
				const expected = expecteds.shift() || 0;
				expect(items.length).toBe(expected);

				for (const item of items) {
					expect(item.title).toMatch('include');
				}

				if (expecteds.length === 1) {
					// After the second snapshot arrives, changes a single post from
					//   "the post # - include"
					// to
					//   "edited post - omit"

					// This is intended to trigger a new, after-sync'd snapshot.
					// This sanity-checks helps confirms we're testing what we think
					// we're testing:
					expect(
						((DataStore as any).sync as any).getModelSyncedStatus({})
					).toBe(true);

					await pause(100);

					const itemToEdit = (
						await DataStore.query(Post, p => p.title.contains('include'))
					).pop()!;
					await fullSave(
						Post.copyOf(itemToEdit, draft => {
							draft.title = 'second edited post - omit';
						})
					);

					jest.advanceTimersByTime(2000);
				} else if (expecteds.length === 0) {
					sub.unsubscribe();
					done();
				}
			});

			// Creates posts like:
			//
			// "the post 0 - include"
			// "the post 1 - omit"
			// "the post 2 - include"
			// "the post 3 - omit"
			//
			// etc.
			//
			// ... so that we can expect to see each other one filtered out.
			for (let i = 0; i < 10; i++) {
				await fullSave(
					new Post({
						title: `the post ${i} - ${Boolean(i % 2) ? 'include' : 'omit'}`,
					})
				);
			}

			// Changes a single post from
			//   "the post # - include"
			// to
			//   "edited post - omit"
			//
			// to add an UPDATE to the first snapshot that we should expect to
			// see filtered out.
			((DataStore as any).sync as any).getModelSyncedStatus = (model: any) =>
				true;

			const itemToEdit = (
				await DataStore.query(Post, p => p.title.contains('include'))
			).pop()!;

			await fullSave(
				Post.copyOf(itemToEdit, draft => {
					draft.title = 'first edited post - omit';
				})
			);

			jest.advanceTimersByTime(2000);
		} catch (error) {
			done(error);
		}
	});

	test('publishes preexisting local data AND follows up with subsequent saves', async done => {
		try {
			const expecteds = [5, 15];

			for (let i = 0; i < 5; i++) {
				await DataStore.save(
					new Post({
						title: `the post ${i}`,
					})
				);
			}

			const sub = DataStore.observeQuery(Post).subscribe(
				({ items, isSynced }) => {
					const expected = expecteds.shift() || 0;
					expect(items.length).toBe(expected);

					for (let i = 0; i < expected; i++) {
						expect(items[i].title).toEqual(`the post ${i}`);
					}

					if (expecteds.length === 0) {
						sub.unsubscribe();
						done();
					}
				}
			);

			for (let i = 5; i < 15; i++) {
				await fullSave(
					new Post({
						title: `the post ${i}`,
					})
				);
			}

			jest.advanceTimersByTime(2000);
		} catch (error) {
			done(error);
		}
	});

	test('removes deleted items from the snapshot', async done => {
		try {
			const expecteds = [5, 4];

			for (let i = 0; i < 5; i++) {
				await DataStore.save(
					new Post({
						title: `the post ${i}`,
					})
				);
			}

			const sub = DataStore.observeQuery(Post).subscribe(
				async ({ items, isSynced }) => {
					const expected = expecteds.shift() || 0;
					expect(items.length).toBe(expected);

					for (let i = 0; i < expected; i++) {
						expect(items[i].title).toContain(`the post`);
					}

					if (expecteds.length === 0) {
						sub.unsubscribe();
						done();
					} else {
						const itemToDelete = (await DataStore.query(Post)).pop()!;
						await DataStore.delete(itemToDelete);
						jest.advanceTimersByTime(2000);
					}
				}
			);
		} catch (error) {
			done(error);
		}
	});

	test('removes deleted items from the snapshot with a predicate', done => {
		(async () => {
			try {
				const expecteds = [5, 4];

				for (let i = 0; i < 5; i++) {
					await DataStore.save(
						new Post({
							title: `the post ${i}`,
						})
					);
				}

				const sub = DataStore.observeQuery(Post, p =>
					p.title.beginsWith('the post')
				).subscribe(({ items, isSynced }) => {
					const expected = expecteds.shift() || 0;
					expect(items.length).toBe(expected);

					for (let i = 0; i < expected; i++) {
						expect(items[i].title).toContain(`the post`);
					}

					if (expecteds.length === 0) {
						sub.unsubscribe();
						done();
					}
				});

				const itemToDelete = (await DataStore.query(Post)).pop()!;
				await DataStore.delete(itemToDelete);
				jest.advanceTimersByTime(2000);
			} catch (error) {
				done(error);
			}
		})();
	});

	test('attaches related belongsTo properties consistently with query() on INSERT', async done => {
		try {
			const expecteds = [5, 15];

			for (let i = 0; i < 5; i++) {
				await DataStore.save(
					new Comment({
						content: `comment content ${i}`,
						post: await DataStore.save(
							new Post({
								title: `new post ${i}`,
							})
						),
					})
				);
			}

			const sub = DataStore.observeQuery(Comment).subscribe(
				async ({ items, isSynced }) => {
					const expected = expecteds.shift() || 0;
					expect(items.length).toBe(expected);

					for (let i = 0; i < expected; i++) {
						expect(items[i].content).toEqual(`comment content ${i}`);
						expect((await items[i].post).title).toEqual(`new post ${i}`);
					}

					if (expecteds.length === 0) {
						sub.unsubscribe();
						done();
					}
				}
			);

			for (let i = 5; i < 15; i++) {
				await fullSave(
					new Comment({
						content: `comment content ${i}`,
						post: await DataStore.save(
							new Post({
								title: `new post ${i}`,
							})
						),
					})
				);
			}

			jest.advanceTimersByTime(2000);
		} catch (error) {
			done(error);
		}
	});

	test('attaches related hasOne properties consistently with query() on INSERT', async done => {
		try {
			const expecteds = [5, 15];

			for (let i = 0; i < 5; i++) {
				await DataStore.save(
					new User({
						name: `user ${i}`,
						profile: await DataStore.save(
							new Profile({
								firstName: `firstName ${i}`,
								lastName: `lastName ${i}`,
							})
						),
					})
				);
			}

			const sub = DataStore.observeQuery(User).subscribe(
				async ({ items, isSynced }) => {
					const expected = expecteds.shift() || 0;
					expect(items.length).toBe(expected);

					for (let i = 0; i < expected; i++) {
						expect(items[i].name).toEqual(`user ${i}`);
						expect((await items[i].profile)!.firstName).toEqual(
							`firstName ${i}`
						);
						expect((await items[i].profile)!.lastName).toEqual(`lastName ${i}`);
					}

					if (expecteds.length === 0) {
						sub.unsubscribe();
						done();
					}
				}
			);

			for (let i = 5; i < 15; i++) {
				await fullSave(
					new User({
						name: `user ${i}`,
						profile: await DataStore.save(
							new Profile({
								firstName: `firstName ${i}`,
								lastName: `lastName ${i}`,
							})
						),
					})
				);
			}

			jest.advanceTimersByTime(2000);
		} catch (error) {
			done(error);
		}
	});

	test('attaches related belongsTo properties consistently with query() on UPDATE', async done => {
		try {
			const expecteds = [
				['old post 0', 'old post 1', 'old post 2', 'old post 3', 'old post 4'],
				['new post 0', 'new post 1', 'new post 2', 'new post 3', 'new post 4'],
			];

			for (let i = 0; i < 5; i++) {
				await DataStore.save(
					new Comment({
						content: `comment content ${i}`,
						post: await DataStore.save(
							new Post({
								title: `old post ${i}`,
							})
						),
					})
				);
			}

			const sub = DataStore.observeQuery(Comment).subscribe(
				async ({ items, isSynced }) => {
					const expected = expecteds.shift() || [];
					expect(items.length).toBe(expected.length);

					for (let i = 0; i < expected.length; i++) {
						expect(items[i].content).toContain(`comment content ${i}`);
						expect((await items[i].post).title).toEqual(expected[i]);
					}

					if (expecteds.length === 0) {
						sub.unsubscribe();
						done();
					}
				}
			);

			let postIndex = 0;
			const comments = await DataStore.query(Comment);
			for (const comment of comments) {
				const newPost = await DataStore.save(
					new Post({
						title: `new post ${postIndex++}`,
					})
				);

				await fullSave(
					Comment.copyOf(comment, draft => {
						draft.content = `updated: ${comment.content}`;
						draft.post = newPost;
					})
				);
			}

			jest.advanceTimersByTime(2000);
		} catch (error) {
			done(error);
		}
	});

	test('attaches related hasOne properties consistently with query() on UPDATE', async done => {
		try {
			const expecteds = [
				[
					'first name 0',
					'first name 1',
					'first name 2',
					'first name 3',
					'first name 4',
				],
				[
					'new first name 0',
					'new first name 1',
					'new first name 2',
					'new first name 3',
					'new first name 4',
				],
			];

			for (let i = 0; i < 5; i++) {
				await DataStore.save(
					new User({
						name: `user ${i}`,
						profile: await DataStore.save(
							new Profile({
								firstName: `first name ${i}`,
								lastName: `last name ${i}`,
							})
						),
					})
				);
			}

			const sub = DataStore.observeQuery(User).subscribe(
				async ({ items, isSynced }) => {
					const expected = expecteds.shift() || [];
					expect(items.length).toBe(expected.length);

					for (let i = 0; i < expected.length; i++) {
						expect(items[i].name).toContain(`user ${i}`);
						expect((await items[i].profile)!.firstName).toEqual(expected[i]);
					}

					if (expecteds.length === 0) {
						sub.unsubscribe();
						done();
					}
				}
			);

			let userIndex = 0;
			const users = await DataStore.query(User);
			for (const user of users) {
				const newProfile = await DataStore.save(
					new Profile({
						firstName: `new first name ${userIndex++}`,
						lastName: `new last name ${userIndex}`,
					})
				);

				await fullSave(
					User.copyOf(user, draft => {
						draft.name = `updated: ${user.name}`;
						draft.profile = newProfile;
					})
				);
			}

			jest.advanceTimersByTime(2000);
		} catch (error) {
			done(error);
		}
	});
});
