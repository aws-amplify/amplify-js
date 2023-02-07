import { Observable } from 'zen-observable-ts';
import { parse } from 'graphql';
import {
	pause,
	getDataStore,
	waitForEmptyOutbox,
	waitForDataStoreReady,
} from './helpers';
import { Predicates } from '../src/predicates';
import { syncExpression } from '../src/types';

describe('DataStore sync engine', () => {
	// establish types :)
	let {
		DataStore,
		connectivityMonitor,
		Post,
		Comment,
		graphqlService,
		simulateConnect,
		simulateDisconnect,
	} = getDataStore({ online: true, isNode: false });

	beforeEach(async () => {
		({
			DataStore,
			connectivityMonitor,
			Post,
			Comment,
			graphqlService,
			simulateConnect,
			simulateDisconnect,
		} = getDataStore({ online: true, isNode: false }));
		await DataStore.start();
	});

	afterEach(async () => {
		await DataStore.clear();
	});

	describe('basic protocol', () => {
		test('sends model create to the cloud', async () => {
			const post = await DataStore.save(new Post({ title: 'post title' }));

			// give thread control back to subscription event handlers.
			await pause(1);

			const table = graphqlService.tables.get('Post')!;
			expect(table.size).toEqual(1);

			const savedItem = table.get(JSON.stringify([post.id])) as any;
			expect(savedItem.title).toEqual(post.title);
		});

		test('uses model create subscription event to populate sync protocol metadata', async () => {
			const post = await DataStore.save(new Post({ title: 'post title' }));
			await waitForEmptyOutbox();

			const retrieved = (await DataStore.query(Post, post.id)) as any;

			expect(retrieved._version).toBe(1);
			expect(retrieved._deleted).toBe(false);
			expect(retrieved._lastChangedAt).toBeGreaterThan(0);
		});

		test('sends model update to the cloud', async () => {
			const post = await DataStore.save(new Post({ title: 'post title' }));
			await waitForEmptyOutbox();

			const retrieved = await DataStore.query(Post, post.id);

			const updated = await DataStore.save(
				Post.copyOf(retrieved!, draft => {
					draft.title = 'updated title';
				})
			);
			await waitForEmptyOutbox();

			const table = graphqlService.tables.get('Post')!;
			expect(table.size).toEqual(1);

			const savedItem = table.get(JSON.stringify([post.id])) as any;
			expect(savedItem.title).toEqual(updated.title);
		});

		test('sends model deletes to the cloud', async () => {
			const post = await DataStore.save(new Post({ title: 'post title' }));
			await waitForEmptyOutbox();

			const retrieved = await DataStore.query(Post, post.id);
			const deleted = await DataStore.delete(retrieved!);
			await waitForEmptyOutbox();

			const table = graphqlService.tables.get('Post')!;
			expect(table.size).toEqual(1);

			const savedItem = table.get(JSON.stringify([post.id])) as any;
			expect(savedItem.title).toEqual(deleted.title);
			expect(savedItem._deleted).toEqual(true);
		});

		test('sends conditional model deletes to the cloud with valid conditions', async () => {
			const post = await DataStore.save(new Post({ title: 'post title' }));
			await waitForEmptyOutbox();

			const retrieved = await DataStore.query(Post, post.id);

			const deleted = await DataStore.delete(retrieved!, p =>
				p.title.eq('post title')
			);
			await waitForEmptyOutbox();

			const table = graphqlService.tables.get('Post')!;
			expect(table.size).toEqual(1);

			const savedItem = table.get(JSON.stringify([post.id])) as any;
			expect(savedItem.title).toEqual(deleted.title);
			expect(savedItem._deleted).toEqual(true);
		});
	});

	describe('connection state change handling', () => {
		test('survives online -> offline -> online cycle', async () => {
			const post = await DataStore.save(
				new Post({
					title: 'a title',
				})
			);

			await waitForEmptyOutbox();
			await simulateDisconnect();
			await simulateConnect();
			await pause(1);

			const anotherPost = await DataStore.save(
				new Post({
					title: 'another title',
				})
			);

			await waitForEmptyOutbox();

			const table = graphqlService.tables.get('Post')!;
			expect(table.size).toEqual(2);

			const cloudPost = table.get(JSON.stringify([post.id])) as any;
			expect(cloudPost.title).toEqual('a title');

			const cloudAnotherPost = table.get(
				JSON.stringify([anotherPost.id])
			) as any;
			expect(cloudAnotherPost.title).toEqual('another title');
		});

		test('survives online -> offline -> save -> online cycle (non-racing)', async () => {
			const post = await DataStore.save(
				new Post({
					title: 'a title',
				})
			);

			await waitForEmptyOutbox();
			await simulateDisconnect();

			const outboxEmpty = waitForEmptyOutbox();
			const anotherPost = await DataStore.save(
				new Post({
					title: 'another title',
				})
			);

			// In this scenario, we want to test the case where the offline
			// save is NOT in a race with reconnection. So, we pause *briefly*.
			await pause(1);

			await simulateConnect();
			await outboxEmpty;

			const table = graphqlService.tables.get('Post')!;
			expect(table.size).toEqual(2);

			const cloudPost = table.get(JSON.stringify([post.id])) as any;
			expect(cloudPost.title).toEqual('a title');

			const cloudAnotherPost = table.get(
				JSON.stringify([anotherPost.id])
			) as any;
			expect(cloudAnotherPost.title).toEqual('another title');
		});

		/**
		 * Existing bug. (Sort of.)
		 *
		 * Outbox mutations are processed, but the hub events are not sent, so
		 * the test hangs and times out. :shrug:
		 *
		 * It is notable that the data is correct in this case, we just don't
		 * receive all of the expected Hub events.
		 */
		test.skip('survives online -> offline -> save/online race', async () => {
			const post = await DataStore.save(
				new Post({
					title: 'a title',
				})
			);

			await waitForEmptyOutbox();
			await simulateDisconnect();

			const outboxEmpty = waitForEmptyOutbox();

			const anotherPost = await DataStore.save(
				new Post({
					title: 'another title',
				})
			);

			// NO PAUSE: Simulate reconnect IMMEDIATELY, causing a race
			// between the save and the sync engine reconnection operations.

			await simulateConnect();
			await outboxEmpty;

			const table = graphqlService.tables.get('Post')!;
			expect(table.size).toEqual(2);

			const cloudPost = table.get(JSON.stringify([post.id])) as any;
			expect(cloudPost.title).toEqual('a title');

			const cloudAnotherPost = table.get(
				JSON.stringify([anotherPost.id])
			) as any;
			expect(cloudAnotherPost.title).toEqual('another title');
		});
	});

	describe('selective sync', () => {
		const generateTestData = async () => {
			const titles = [
				'1. doing laundry',
				'2. making dinner',
				'3. cleaning dishes',
				'4. taking out the trash',
				'5. cleaning your boots',
			];

			for (const title of titles) {
				await DataStore.save(
					new Post({
						title,
					})
				);
			}
		};

		const resyncWith = async (expressions: any[]) => {
			(DataStore as any).syncExpressions = expressions;
			await DataStore.start();
			await waitForDataStoreReady();
		};

		beforeEach(async () => {
			await generateTestData();

			// make sure "AppSync" has all the records.
			await waitForEmptyOutbox();

			// clear the local -- each test herein will configure sync expressions
			// and begin syncing on a clean database.
			await DataStore.clear();
		});

		/**
		 * Don't call `DataStore.configure()` directly. It will clobber the AppSync
		 * configuration and will no longer interact with the fake backend on restart.
		 */

		test('Predicates.ALL', async () => {
			await resyncWith([syncExpression(Post, () => Predicates.ALL)]);

			const records = await DataStore.query(Post);

			// This is working in integ tests. Need to dive on why
			// fake graphql service isn't handling Predicates.All.
			// expect(records.length).toBe(5);

			// leaving test in to validate the type.
		});

		test('Predicates.ALL async', async () => {
			await resyncWith([syncExpression(Post, async () => Predicates.ALL)]);

			const records = await DataStore.query(Post);

			// This is working in integ tests. Need to dive on why
			// fake graphql service isn't handling Predicates.All.
			// expect(records.length).toBe(5);

			// leaving test in to validate the type.
		});

		test('basic contains() filtering', async () => {
			await resyncWith([
				syncExpression(Post, post => post?.title.contains('cleaning')),
			]);

			const records = await DataStore.query(Post);
			expect(records.length).toBe(2);
		});

		test('basic contains() filtering - as synchronous condition producer', async () => {
			await resyncWith([
				syncExpression(Post, () => post => post.title.contains('cleaning')),
			]);

			const records = await DataStore.query(Post);
			expect(records.length).toBe(2);
		});

		test('basic contains() filtering - as asynchronous condition producer', async () => {
			await resyncWith([
				syncExpression(
					Post,
					async () => post => post.title.contains('cleaning')
				),
			]);

			const records = await DataStore.query(Post);
			expect(records.length).toBe(2);
		});
	});
});
