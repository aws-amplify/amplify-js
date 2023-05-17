import { Observable } from 'zen-observable-ts';
import {
	pause,
	getDataStore,
	graphqlServiceSettled,
	waitForEmptyOutbox,
	waitForDataStoreReady,
	waitForSyncQueriesReady,
	warpTime,
	unwarpTime,
} from './helpers';
import { Predicates } from '../src/predicates';
import { syncExpression } from '../src/types';

/**
 * Surfaces errors sooner and outputs them more clearly if/when
 * a test begins to fail.
 */
async function waitForEmptyOutboxOrError(service) {
	const pendingError = new Promise((resolve, reject) => {
		service.log = (channel, message) => {
			if (channel.includes('API Response')) {
				if (message.errors?.length > 0) reject(message);
			}
		};
	});

	return await Promise.race([waitForEmptyOutbox(), pendingError]);
}

/**
 * Creates a promise to wait for the next subscription message and
 * returns it when it arrives.
 *
 * @param observable Any `Observable`
 */
function waitForNextMessage<T>(observable: Observable<T>) {
	return new Promise(resolve => {
		const subscription = observable.subscribe(message => {
			subscription.unsubscribe();
			resolve(message);
		});
	});
}

describe('DataStore sync engine', () => {
	// establish types :)
	let {
		DataStore,
		errorHandler,
		schema,
		connectivityMonitor,
		Model,
		ModelWithExplicitOwner,
		ModelWithExplicitCustomOwner,
		ModelWithMultipleCustomOwner,
		BasicModel,
		BasicModelWritableTS,
		LegacyJSONPost,
		LegacyJSONComment,
		Post,
		Comment,
		HasOneParent,
		HasOneChild,
		CompositePKParent,
		CompositePKChild,
		graphqlService,
		simulateConnect,
		simulateDisconnect,
		simulateDisruption,
		simulateDisruptionEnd,
	} = getDataStore({ online: true, isNode: false });

	beforeEach(async () => {
		// we don't need to see all the console warnings for these tests ...
		(console as any)._warn = console.warn;
		console.warn = () => {};

		({
			DataStore,
			errorHandler,
			schema,
			connectivityMonitor,
			Model,
			ModelWithExplicitOwner,
			ModelWithExplicitCustomOwner,
			ModelWithMultipleCustomOwner,
			BasicModel,
			BasicModelWritableTS,
			LegacyJSONPost,
			LegacyJSONComment,
			Post,
			Comment,
			Model,
			HasOneParent,
			HasOneChild,
			CompositePKParent,
			CompositePKChild,
			graphqlService,
			simulateConnect,
			simulateDisconnect,
			simulateDisruption,
			simulateDisruptionEnd,
		} = getDataStore({ online: true, isNode: false }));
		await DataStore.start();
	});

	afterEach(async () => {
		await DataStore.clear();
		console.warn = (console as any)._warn;
	});

	describe('basic protocol', () => {
		test('sends model create to the cloud', async () => {
			const post = await DataStore.save(new Post({ title: 'post title' }));

			// give thread control back to subscription event handlers.
			await waitForEmptyOutbox();

			const table = graphqlService.tables.get('Post')!;
			expect(table.size).toEqual(1);

			const savedItem = table.get(JSON.stringify([post.id])) as any;
			expect(savedItem.title).toEqual(post.title);
		});

		test('omits readonly fields from mutation events on create', async () => {
			// make sure our test model still meets requirements to make this test valid.
			expect(schema.models.BasicModel.fields.createdAt.isReadOnly).toBe(true);

			const m = await DataStore.save(
				new BasicModel({
					body: 'whatever and ever',
				})
			);

			await waitForEmptyOutbox();

			const table = graphqlService.tables.get('BasicModel')!;
			expect(table.size).toEqual(1);

			const savedItem = table.get(JSON.stringify([m.id])) as any;
			expect(savedItem.body).toEqual(m.body);
		});

		test('omits all unspecified fields from mutation on create', async () => {
			// make sure our test model still meets requirements to make this test valid.
			expect(schema.models.Model.fields.optionalField1.isRequired).toBe(false);

			await DataStore.save(
				new Model({
					field1: 'whatever and ever',
					dateCreated: new Date().toISOString(),
				})
			);

			const omitted_optional_fields = [
				'emails',
				'ips',
				'logins',
				'metadata',
				'optionalField',
			];

			await waitForEmptyOutbox();

			const table = graphqlService.tables.get('Model')!;
			expect(table.size).toEqual(1);

			const [mutation] = graphqlService.requests
				.filter(r => r.operation === 'mutation' && r.tableName === 'Model')
				.map(req => req.variables.input);

			for (const field of omitted_optional_fields) {
				expect(mutation[field]).toEqual(undefined);
			}
		});

		test('includes explicit null fields from mutation on create', async () => {
			// make sure our test model still meets requirements to make this test valid.
			expect(schema.models.Model.fields.optionalField1.isRequired).toBe(false);

			await DataStore.save(
				new Model({
					field1: 'whatever and ever',
					dateCreated: new Date().toISOString(),
					metadata: null,
				})
			);

			await waitForEmptyOutbox();

			const table = graphqlService.tables.get('Model')!;
			expect(table.size).toEqual(1);

			const [mutation] = graphqlService.requests
				.filter(r => r.operation === 'mutation' && r.tableName === 'Model')
				.map(req => req.variables.input);

			expect(mutation.metadata).toEqual(null);
		});

		test('omits all unchanged fields from mutation on update', async () => {
			// make sure our test model still meets requirements to make this test valid.
			expect(schema.models.Model.fields.optionalField1.isRequired).toBe(false);

			const saved = await DataStore.save(
				new Model({
					field1: 'whatever and ever',
					dateCreated: new Date().toISOString(),
				})
			);

			await waitForEmptyOutbox();
			const retrieved = (await DataStore.query(Model, saved.id))!;

			const updated = await DataStore.save(
				Model.copyOf(retrieved, d => (d.optionalField1 = 'new value'))
			);

			const omitted_fields = ['field1', 'emails', 'ips', 'logins', 'metadata'];

			await waitForEmptyOutbox();

			const table = graphqlService.tables.get('Model')!;
			expect(table.size).toEqual(1);

			const [createMutation, updateMutation] = graphqlService.requests
				.filter(r => r.operation === 'mutation' && r.tableName === 'Model')
				.map(req => req.variables.input);

			for (const field of omitted_fields) {
				expect(updateMutation[field]).toEqual(undefined);
			}
		});

		test('includes explicit null fields from mutation on update', async () => {
			// make sure our test model still meets requirements to make this test valid.
			expect(schema.models.Model.fields.optionalField1.isRequired).toBe(false);

			const saved = await DataStore.save(
				new Model({
					field1: 'whatever and ever',
					dateCreated: new Date().toISOString(),
					optionalField1: 'something',
				})
			);

			await waitForEmptyOutbox();
			const retrieved = (await DataStore.query(Model, saved.id))!;

			await DataStore.save(
				Model.copyOf(retrieved, d => (d.optionalField1 = null))
			);

			await waitForEmptyOutbox();

			const table = graphqlService.tables.get('Model')!;
			expect(table.size).toEqual(1);

			const [createMutation, updateMutation] = graphqlService.requests
				.filter(r => r.operation === 'mutation' && r.tableName === 'Model')
				.map(req => req.variables.input);

			expect(updateMutation.optionalField1).toEqual(null);
		});

		test('omits null owner fields from mutation events on create', async () => {
			const m = await DataStore.save(
				new ModelWithExplicitOwner({
					title: 'very clever title',
					owner: null,
				})
			);

			await waitForEmptyOutboxOrError(graphqlService);

			const table = graphqlService.tables.get('ModelWithExplicitOwner')!;
			expect(table.size).toEqual(1);

			const savedItem = table.get(JSON.stringify([m.id])) as any;
			expect(savedItem.title).toEqual(m.title);
		});

		test('omits undefined owner fields from mutation events on create', async () => {
			const m = await DataStore.save(
				new ModelWithExplicitOwner({
					title: 'very clever title',
					owner: undefined,
				})
			);

			await waitForEmptyOutboxOrError(graphqlService);

			const table = graphqlService.tables.get('ModelWithExplicitOwner')!;
			expect(table.size).toEqual(1);

			const savedItem = table.get(JSON.stringify([m.id])) as any;
			expect(savedItem.title).toEqual(m.title);
		});

		test('omits null custom owner fields from mutation events on create', async () => {
			const m = await DataStore.save(
				new ModelWithExplicitCustomOwner({
					title: 'very clever title',
					customowner: null,
				})
			);

			await waitForEmptyOutboxOrError(graphqlService);

			const table = graphqlService.tables.get('ModelWithExplicitCustomOwner')!;
			expect(table.size).toEqual(1);

			const savedItem = table.get(JSON.stringify([m.id])) as any;
			expect(savedItem.title).toEqual(m.title);
		});

		test('omits undefined custom owner fields from mutation events on create', async () => {
			const m = await DataStore.save(
				new ModelWithExplicitCustomOwner({
					title: 'very clever title',
					customowner: undefined,
				})
			);

			await waitForEmptyOutboxOrError(graphqlService);

			const table = graphqlService.tables.get('ModelWithExplicitCustomOwner')!;
			expect(table.size).toEqual(1);

			const savedItem = table.get(JSON.stringify([m.id])) as any;
			expect(savedItem.title).toEqual(m.title);
		});

		test('omits empty owner fields (multi, both empty) from mutation events on create', async () => {
			const m = await DataStore.save(
				new ModelWithMultipleCustomOwner({
					title: 'very clever title',
					customownerOne: undefined,
					customownerTwo: undefined,
				})
			);

			await waitForEmptyOutboxOrError(graphqlService);

			const table = graphqlService.tables.get('ModelWithMultipleCustomOwner')!;
			expect(table.size).toEqual(1);

			const savedItem = table.get(JSON.stringify([m.id])) as any;
			expect(savedItem.title).toEqual(m.title);
		});

		test('omits empty owner fields (multi, owner 1 empty) from mutation events on create', async () => {
			const m = await DataStore.save(
				new ModelWithMultipleCustomOwner({
					title: 'very clever title',
					customownerOne: undefined,
					customownerTwo: 'bob',
				})
			);

			await waitForEmptyOutboxOrError(graphqlService);

			const table = graphqlService.tables.get('ModelWithMultipleCustomOwner')!;
			expect(table.size).toEqual(1);

			const savedItem = table.get(JSON.stringify([m.id])) as any;
			expect(savedItem.title).toEqual(m.title);
		});

		test('omits null custom owner fields (multi, owner 2 empty) from mutation events on create', async () => {
			const m = await DataStore.save(
				new ModelWithMultipleCustomOwner({
					title: 'very clever title',
					customownerOne: 'bob',
					customownerTwo: undefined,
				})
			);

			await waitForEmptyOutboxOrError(graphqlService);

			const table = graphqlService.tables.get('ModelWithMultipleCustomOwner')!;
			expect(table.size).toEqual(1);

			const savedItem = table.get(JSON.stringify([m.id])) as any;
			expect(savedItem.title).toEqual(m.title);
		});

		test('includes timestamp fields in mutation events when NOT readonly', async () => {
			// make sure our test model still meets requirements to make this test valid.
			expect(
				schema.models.BasicModelWritableTS.fields.createdAt.isReadOnly
			).toBe(false);

			const m = await DataStore.save(
				new BasicModelWritableTS({
					body: 'whatever else',
				})
			);

			await waitForEmptyOutbox();

			const table = graphqlService.tables.get('BasicModelWritableTS')!;
			expect(table.size).toEqual(1);

			const savedItem = table.get(JSON.stringify([m.id])) as any;
			expect(savedItem.body).toEqual(m.body);
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

		test('send model updates where field is nullified to the cloud', async () => {
			const original = await DataStore.save(
				new Model({
					field1: 'field 1 value',
					dateCreated: new Date().toISOString(),
					optionalField1: 'optional field value',
				})
			);
			await waitForEmptyOutbox();

			const updated = await DataStore.save(
				Model.copyOf(
					(await DataStore.query(Model, original.id))!,
					m => (m.optionalField1 = undefined)
				)
			);
			const retrievedBeforeMutate = await DataStore.query(Model, original.id);
			await waitForEmptyOutbox();

			const table = graphqlService.tables.get('Model');
			const cloudItem = table?.get(JSON.stringify([original.id])) as any;
			const retrievedAfterMutate = await DataStore.query(Model, original.id);

			expect(updated.optionalField1).toBe(null);
			expect(cloudItem.optionalField1).toBe(null);
			expect(retrievedBeforeMutate?.optionalField1).toBe(null);
			expect(retrievedAfterMutate?.optionalField1).toBe(null);
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

		[null, undefined].forEach(value => {
			test(`model field can be set to ${value} to remove connection hasOne parent`, async () => {
				const child = await DataStore.save(
					new HasOneChild({ content: 'child content' })
				);
				const parent = await DataStore.save(
					new HasOneParent({
						child,
					})
				);
				await waitForEmptyOutboxOrError(graphqlService);
				const parentTable = graphqlService.tables.get('HasOneParent')!;
				const savedParentWithChild = parentTable.get(
					JSON.stringify([parent.id])
				) as any;
				expect(savedParentWithChild.hasOneParentChildId).toEqual(child.id);

				const parentWithoutChild = HasOneParent.copyOf(
					(await DataStore.query(HasOneParent, parent.id))!,
					draft => {
						draft.child = value;
					}
				);
				await DataStore.save(parentWithoutChild);

				await waitForEmptyOutboxOrError(graphqlService);

				const savedParentWithoutChild = parentTable.get(
					JSON.stringify([parent.id])
				) as any;
				expect(savedParentWithoutChild.hasOneParentChildId).toEqual(null);
			});

			test(`model field can be set to ${value} to remove connection on child hasMany`, async () => {
				const parent = await DataStore.save(
					new CompositePKParent({
						customId: 'customId',
						content: 'content',
					})
				);

				const child = await DataStore.save(
					new CompositePKChild({
						childId: 'childId',
						content: 'content',
						parent,
					})
				);

				await waitForEmptyOutboxOrError(graphqlService);
				const childTable = graphqlService.tables.get('CompositePKChild')!;
				const savedChildWithParent = childTable.get(
					JSON.stringify([child.childId, child.content])
				) as any;
				expect(savedChildWithParent.parentId).toEqual(parent.customId);
				expect(savedChildWithParent.parentTitle).toEqual(parent.content);

				const childWithoutParent = CompositePKChild.copyOf(
					(await DataStore.query(CompositePKChild, {
						childId: child.childId,
						content: child.content,
					}))!,
					draft => {
						draft.parent = value;
					}
				);
				await DataStore.save(childWithoutParent);

				await waitForEmptyOutboxOrError(graphqlService);

				const savedChildWithoutParent = childTable.get(
					JSON.stringify([child.childId, child.content])
				) as any;
				expect(savedChildWithoutParent.parentId).toEqual(null);
				expect(savedChildWithoutParent.parentTitle).toEqual(null);
			});
		});
	});

	describe('connection state change handling', () => {
		beforeEach(async () => {
			warpTime();
		});

		afterEach(async () => {
			unwarpTime();
		});

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

		test('survives online -> offline -> save/online race', async () => {
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

		test('survives online -> offline -> update/online race', async () => {
			const post = await DataStore.save(
				new Post({
					title: 'a title',
				})
			);

			await waitForEmptyOutbox();
			await simulateDisconnect();

			const outboxEmpty = waitForEmptyOutbox();

			const retrieved = await DataStore.query(Post, post.id);
			await DataStore.save(
				Post.copyOf(retrieved!, updated => (updated.title = 'new title'))
			);

			// NO PAUSE: Simulate reconnect IMMEDIATELY, causing a race
			// between the save and the sync engine reconnection operations.

			await simulateConnect();
			await outboxEmpty;

			const table = graphqlService.tables.get('Post')!;
			expect(table.size).toEqual(1);

			const cloudPost = table.get(JSON.stringify([post.id])) as any;
			expect(cloudPost.title).toEqual('new title');
		});

		test('survives online -> offline -> delete/online race', async () => {
			const post = await DataStore.save(
				new Post({
					title: 'a title',
				})
			);

			await waitForEmptyOutbox();
			await simulateDisconnect();

			const outboxEmpty = waitForEmptyOutbox();

			const retrieved = await DataStore.query(Post, post.id);
			await DataStore.delete(retrieved!);

			// NO PAUSE: Simulate reconnect IMMEDIATELY, causing a race
			// between the save and the sync engine reconnection operations.

			await simulateConnect();
			await outboxEmpty;

			const table = graphqlService.tables.get('Post')!;
			expect(table.size).toEqual(1);

			const cloudPost = table.get(JSON.stringify([post.id])) as any;
			expect(cloudPost.title).toEqual('a title');
			expect(cloudPost._deleted).toEqual(true);
		});

		test('survives online -> connection disruption -> online cycle and triggers re-sync', async () => {
			const post = await DataStore.save(
				new Post({
					title: 'a title',
				})
			);

			await waitForEmptyOutbox();
			await simulateDisruption();

			// simulate second client creating a new post
			const secondPostId = '1c49fa30-ef5c-44f5-b503-234af5a0a088';
			await graphqlService.graphql({
				query:
					'mutation operation($input: CreatePostInput!){\n' +
					'\t\tcreatePost(input: $input){\n' +
					'\t\t\tid\n' +
					'title\n' +
					'blogId\n' +
					'_version\n' +
					'_lastChangedAt\n' +
					'_deleted\n' +
					'\t\t}\n' +
					'\t}',
				variables: {
					input: {
						id: secondPostId,
						title: 'a title 2',
						blogId: null,
						_version: undefined,
					},
				},
				authMode: undefined,
				authToken: undefined,
			});

			// wait for subscription message if connection were not disrupted
			// next DataStore.query(Post) would have length of 2 if not disrupted
			await pause(1);

			// DataStore has not received new subscription message
			expect((await DataStore.query(Post)).length).toEqual(1);

			await simulateDisruptionEnd();
			await waitForSyncQueriesReady();

			expect((await DataStore.query(Post)).length).toEqual(2);
			expect((await DataStore.query(Post, post.id))!.title).toEqual('a title');
			expect((await DataStore.query(Post, secondPostId))!.title).toEqual(
				'a title 2'
			);

			const thirdPost = await DataStore.save(
				new Post({
					title: 'a title 3',
				})
			);

			expect((await DataStore.query(Post)).length).toEqual(3);

			await waitForEmptyOutbox();

			const table = graphqlService.tables.get('Post')!;
			expect(table.size).toEqual(3);

			const cloudPost = table.get(JSON.stringify([post.id])) as any;
			expect(cloudPost.title).toEqual('a title');

			const cloudSecondPost = table.get(JSON.stringify([secondPostId])) as any;
			expect(cloudSecondPost.title).toEqual('a title 2');

			const cloudThirdPost = table.get(JSON.stringify([thirdPost.id])) as any;
			expect(cloudThirdPost.title).toEqual('a title 3');
		});

		test('does not error when disruption before sync queries start', async () => {
			const postPromise = DataStore.save(
				new Post({
					title: 'a title',
				})
			);
			const errorLog = jest.spyOn(console, 'error');
			await simulateDisruption();
			await simulateDisruptionEnd();

			await waitForSyncQueriesReady();
			expect(errorLog).not.toHaveBeenCalled();
			await waitForEmptyOutbox();
			const table = graphqlService.tables.get('Post')!;
			expect(table.size).toEqual(1);

			const cloudPost = table.get(
				JSON.stringify([(await postPromise).id])
			) as any;
			expect(cloudPost.title).toEqual('a title');

			/**
			 * TODO: See if we can remove this. This was added to get the test
			 * working again after introducing latency to the fake GraphQL
			 * service. It seems like sync queries are going out and are not
			 * playing well with `DataStore.clear()` (which happens in
			 * `afterEach`), resulting in the test hanging indefinitely.
			 */
			await waitForSyncQueriesReady();
		});

		/**
		 * NOTE: The following test assertions are based on *existing* behavior, not *correct*
		 * behavior. Once we have fixed rapid single-field consecutive updates, and updates on a
		 * poor connection, we should update these assertions to reflect the *correct* behavior.
		 *
		 * Test observed rapid single-field mutations with variable connection latencies, as well as
		 * waiting / not waiting on the outbox between mutations. All permutations are necessary,
		 * as each scenario results in different observed behavior - essentially, whether or not
		 * the outbox merges updates. We are updating a single field with each mutation to ensure
		 * that the outbox's `syncOutboxVersionsOnDequeue` does the right value comparison when
		 * there are multiple fields present on a model, but only one is updated.
		 *
		 * NOTE: if these tests fail, and you witness one of the following:
		 *     1) The retry throws an error
		 *     2) The number of observed updates has changed
		 *     3) The record's final version number has changed
		 * make sure you haven't adjusted the artifical latency or `pause` values, as this will
		 * result in a change in the expected number of merges performed by the outbox.
		 */
		describe('observed rapid single-field mutations with variable connection latencies', () => {
			// Tuple of updated title and version:
			type SubscriptionLogTuple = [string, number];

			/**
			 * Since we're essentially testing race conditions, we want to test the outbox logic
			 * exactly the same each time the tests are run. Minor fluctuations in test runs can
			 * cause different outbox behavior, so we set jitter to `0`.
			 */
			const jitter: number = 0;
			const latency: number = 1000;

			/**
			 * @property originalId `id` of the record to update
			 * @property numberOfUpdates number of primary client updates to perform (excludes external client updates)
			 * @property waitOnOutbox whether or not to wait for the outbox to be empty after each update
			 * @property pauseBeforeMutation whether or not to pause prior to the mutation
			 */
			type ConsecutiveUpdatesParams = {
				originalId: string;
				numberOfUpdates: number;
				waitOnOutbox: boolean;
				pauseBeforeMutation: boolean;
			};

			/**
			 * Helper function to perform consecutive updates on a record given it's `id`.
			 * As explained in detail below, config options are important here, as they will affect
			 * whether or not the outbox will merge updates.
			 */
			const performConsecutiveUpdates = async ({
				originalId,
				numberOfUpdates,
				waitOnOutbox,
				pauseBeforeMutation,
			}: ConsecutiveUpdatesParams) => {
				// Mutate the original record multiple times:
				for (let number = 0; number < numberOfUpdates; number++) {
					/**
					 * When we want to test a scenario where the outbox does not
					 * necessarily merge all outgoing requests (for instance, when
					 * we do not add artifical latency to the connection), we make
					 * the mutations rapidly in this loop. However, because of how
					 * rapidly this loop executes, we are creating an artifical situation
					 * where mutations will always be merged. Setting `pauseBeforeMutation`
					 * to `true` will adding a semi-realistic pause ("button clicks")
					 * between updates.
					 * Not required when awaiting the outbox after each mutation.
					 * Additionally not required if we are intentionally testing
					 * rapid updates, such as when the initial save is still pending.
					 */
					if (pauseBeforeMutation) {
						await pause(200);
					}

					const retrieved = await DataStore.query(Post, originalId);

					await DataStore.save(
						// @ts-ignore
						Post.copyOf(retrieved, updated => {
							updated.title = `post title ${number}`;
						})
					);

					/**
					 * When we want to test a scenario where the user is waiting for a long
					 * period of time between each mutation (non-concurrent updates), we wait
					 * for an empty outbox after each mutation. This ensures each mutation
					 * completes a full cycle before the next mutation begins. This guarantees
					 * that there will NEVER be concurrent updates being processed by the outbox.
					 * For use with variable latencies.
					 */
					if (waitOnOutbox) {
						await waitForEmptyOutbox();
					}
				}
			};

			/**
			 *
			 * @param originalId `id` of the record that was updated
			 * @param expectedFinalVersion expected final `_version` of the record after all updates are complete
			 * @param expectedFinalTitle expected final `title` of the record after all updates are complete
			 */
			const expectFinalRecordsToMatch = async (
				postId: string,
				version: number,
				title: string
			) => {
				// Validate that the record was saved to the service:
				const table = graphqlService.tables.get('Post')!;
				expect(table.size).toEqual(1);

				// Validate that the title was updated successfully:
				const savedItem = table.get(JSON.stringify([postId])) as any;
				expect(savedItem.title).toEqual(title);

				// Validate that the `_version` was incremented correctly:
				expect(savedItem._version).toEqual(version);

				// Validate that `query` returns the latest `title` and `_version`:
				const queryResult = await DataStore.query(Post, postId);
				expect(queryResult?.title).toEqual(title);
				// @ts-ignore
				expect(queryResult?._version).toEqual(version);
			};

			describe('single client updates', () => {
				test('rapid mutations on poor connection when initial create is not pending', async () => {
					// Number of updates to perform in this test:
					const numberOfUpdates = 3;

					// For tracking sequence of versions and titles returned by `DataStore.observe()`:
					const subscriptionLog: SubscriptionLogTuple[] = [];

					// Record to update:
					const original = await DataStore.save(
						new Post({
							title: 'original title',
							blogId: 'blog id',
						})
					);

					/**
					 * Make sure the save was successfully sent out. There is a separate test
					 * for testing an update when the initial save is still in the outbox
					 * (see below). Here `_version` IS defined.
					 */
					await waitForEmptyOutbox();

					const subscription = await DataStore.observe(Post).subscribe(
						({ opType, element }) => {
							const response: SubscriptionLogTuple = [
								element.title,
								// No, TypeScript, there is a version:
								// @ts-ignore
								element._version,
							];
							// Track sequence of versions and titles
							subscriptionLog.push(response);
						}
					);

					/**
					 * Note: Running this test without increased latencies will still fail,
					 * however, the `expectedNumberOfUpdates` received by the fake service
					 * will be different (here they are merged in the outbox). See the
					 * tests following this one.
					 */
					graphqlService.setLatencies({
						request: latency,
						response: latency,
						subscriber: latency,
						jitter,
					});

					// Note: We do NOT wait for the outbox to be empty here, because
					// we want to test concurrent updates being processed by the outbox.
					await performConsecutiveUpdates({
						originalId: original.id,
						numberOfUpdates,
						waitOnOutbox: false,
						pauseBeforeMutation: false,
					});

					// Now we wait for the outbox to do what it needs to do:
					await waitForEmptyOutbox();

					/**
					 * Because we have increased the latency, and don't wait for the outbox
					 * to clear on each mutation, the outbox will merge some of the mutations.
					 * In this example, we expect the number of requests received to be one less than
					 * the actual number of updates. If we were running this test without
					 * increased latency, we'd expect more requests to be received.
					 */
					const expectedNumberOfUpdates = numberOfUpdates - 1;

					await graphqlServiceSettled(
						graphqlService,
						expectedNumberOfUpdates,
						'Post'
					);

					// Validate that `observe` returned the expected updates to
					// `title` and `version`, in the expected order:
					expect(subscriptionLog).toEqual([
						['post title 0', 1],
						['post title 1', 1],
						['post title 2', 1],
						['post title 0', 3],
					]);

					await expectFinalRecordsToMatch(original.id, 3, 'post title 0');

					// Cleanup:
					await subscription.unsubscribe();
				});
				test('rapid mutations on fast connection when initial create is not pending', async () => {
					// Number of updates to perform in this test:
					const numberOfUpdates = 3;

					// For tracking sequence of versions and titles returned by `DataStore.observe()`:
					const subscriptionLog: SubscriptionLogTuple[] = [];

					// Record to update:
					const original = await DataStore.save(
						new Post({
							title: 'original title',
							blogId: 'blog id',
						})
					);

					/**
					 * Make sure the save was successfully sent out. There is a separate test
					 * for testing an update when the save is still in the outbox (see below).
					 * Here, `_version` is defined.
					 */
					await waitForEmptyOutbox();

					const subscription = await DataStore.observe(Post).subscribe(
						({ opType, element }) => {
							const response: SubscriptionLogTuple = [
								element.title,
								// No, TypeScript, there is a version:
								// @ts-ignore
								element._version,
							];
							// Track sequence of versions and titles
							subscriptionLog.push(response);
						}
					);

					// Note: We do NOT wait for the outbox to be empty here, because
					// we want to test concurrent updates being processed by the outbox.
					await performConsecutiveUpdates({
						originalId: original.id,
						numberOfUpdates,
						waitOnOutbox: false,
						pauseBeforeMutation: true,
					});

					// Now we wait for the outbox to do what it needs to do:
					await waitForEmptyOutbox();

					/**
					 * Because we have NOT increased the latency, the outbox will not merge
					 * the mutations. In this example, we expect the number of requests
					 * received to be the same as the number of updates. If we were
					 * running this test with increased latency, we'd expect less requests
					 * to be received.
					 */
					await graphqlServiceSettled(graphqlService, numberOfUpdates, 'Post');

					// Validate that `observe` returned the expected updates to
					// `title` and `version`, in the expected order:
					expect(subscriptionLog).toEqual([
						['post title 0', 1],
						['post title 1', 1],
						['post title 2', 1],
						['post title 0', 4],
					]);

					await expectFinalRecordsToMatch(original.id, 4, 'post title 0');

					// Cleanup:
					await subscription.unsubscribe();
				});
				test('rapid mutations on poor connection when initial create is pending', async () => {
					// Number of updates to perform in this test:
					const numberOfUpdates = 3;

					// For tracking sequence of versions and titles returned by `DataStore.observe()`:
					const subscriptionLog: SubscriptionLogTuple[] = [];

					// Record to update:
					const original = await DataStore.save(
						new Post({
							title: 'original title',
							blogId: 'blog id',
						})
					);

					/**
					 * NOTE: We do NOT wait for the outbox here - we are testing
					 * updates on a record that is still in the outbox.
					 */

					const subscription = await DataStore.observe(Post).subscribe(
						({ opType, element }) => {
							const response: SubscriptionLogTuple = [
								element.title,
								// No, TypeScript, there is a version:
								// @ts-ignore
								element._version,
							];
							// Track sequence of versions and titles
							subscriptionLog.push(response);
						}
					);

					/**
					 * Note: Running this test without increased latencies will still fail,
					 * however, the `expectedNumberOfUpdates` received by the fake service
					 * will be different (here they are merged in the outbox). See the
					 * tests following this one.
					 */
					graphqlService.setLatencies({
						request: latency,
						response: latency,
						subscriber: latency,
						jitter,
					});

					// Note: We do NOT wait for the outbox to be empty here, because
					// we want to test concurrent updates being processed by the outbox.
					await performConsecutiveUpdates({
						originalId: original.id,
						numberOfUpdates,
						waitOnOutbox: false,
						pauseBeforeMutation: false, // no pause here, unlike other tests! because we want to test when save is pending.
					});

					// Now we wait for the outbox to do what it needs to do:
					await waitForEmptyOutbox();

					/**
					 * Currently, the service does not receive any requests.
					 */
					await graphqlServiceSettled(graphqlService, 0, 'Post');

					// Validate that `observe` returned the expected updates to
					// `title` and `version`, in the expected order:
					expect(subscriptionLog).toEqual([
						['post title 0', undefined],
						['post title 1', undefined],
						['post title 2', undefined],
						['post title 2', 1],
					]);

					await expectFinalRecordsToMatch(original.id, 1, 'post title 2');

					// Cleanup:
					await subscription.unsubscribe();
				});
				test('rapid mutations on fast connection when initial create is pending', async () => {
					// Number of updates to perform in this test:
					const numberOfUpdates = 3;

					// For tracking sequence of versions and titles returned by `DataStore.observe()`:
					const subscriptionLog: SubscriptionLogTuple[] = [];

					// Record to update:
					const original = await DataStore.save(
						new Post({
							title: 'original title',
							blogId: 'blog id',
						})
					);

					/**
					 * NOTE: We do NOT wait for the outbox here - we are testing
					 * updates on a record that is still in the outbox.
					 */

					const subscription = await DataStore.observe(Post).subscribe(
						({ opType, element }) => {
							const response: SubscriptionLogTuple = [
								element.title,
								// No, TypeScript, there is a version:
								// @ts-ignore
								element._version,
							];
							// Track sequence of versions and titles
							subscriptionLog.push(response);
						}
					);

					// Note: We do NOT wait for the outbox to be empty here, because
					// we want to test concurrent updates being processed by the outbox.
					await performConsecutiveUpdates({
						originalId: original.id,
						numberOfUpdates,
						waitOnOutbox: false,
						pauseBeforeMutation: true,
					});

					// Now we wait for the outbox to do what it needs to do:
					await waitForEmptyOutbox();

					/**
					 * Currently, the service does not receive any requests.
					 */
					await graphqlServiceSettled(graphqlService, 0, 'Post');

					// Validate that `observe` returned the expected updates to
					// `title` and `version`, in the expected order:
					expect(subscriptionLog).toEqual([
						['post title 0', undefined],
						['post title 1', undefined],
						['post title 2', undefined],
						['post title 2', 1],
					]);

					await expectFinalRecordsToMatch(original.id, 1, 'post title 2');

					// Cleanup:
					await subscription.unsubscribe();
				});
				test('observe on poor connection with awaited outbox', async () => {
					// Number of updates to perform in this test:
					const numberOfUpdates = 3;

					// For tracking sequence of versions and titles returned by `DataStore.observe()`:
					const subscriptionLog: SubscriptionLogTuple[] = [];

					// Record to update:
					const original = await DataStore.save(
						new Post({
							title: 'original title',
							blogId: 'blog id',
						})
					);

					/**
					 * Make sure the save was successfully sent out. There is a separate test
					 * for testing an update when the save is still in the outbox (see above).
					 * Here, `_version` is defined.
					 */
					await waitForEmptyOutbox();

					const subscription = await DataStore.observe(Post).subscribe(
						({ opType, element }) => {
							const response: SubscriptionLogTuple = [
								element.title,
								// No, TypeScript, there is a version:
								// @ts-ignore
								element._version,
							];
							// Track sequence of versions and titles
							subscriptionLog.push(response);
						}
					);

					/**
					 * Note: Running this test without increased latencies will still fail,
					 * however, the `expectedNumberOfUpdates` received by the fake service
					 * will be different (here they are merged in the outbox). See the
					 * tests following this one.
					 */
					graphqlService.setLatencies({
						request: latency,
						response: latency,
						subscriber: latency,
						jitter,
					});

					/**
					 * We wait for the empty outbox on each mutation, because
					 * we want to test non-concurrent updates (i.e. we want to make
					 * sure all the updates are going out and are being observed)
					 */
					await performConsecutiveUpdates({
						originalId: original.id,
						numberOfUpdates,
						waitOnOutbox: true,
						pauseBeforeMutation: false,
					});

					/**
					 * Even though we have increased the latency, we are still waiting
					 * on the outbox after each mutation. Therefore, mutations will not
					 * be merged.
					 */
					await graphqlServiceSettled(graphqlService, numberOfUpdates, 'Post');

					// Validate that `observe` returned the expected updates to
					// `title` and `version`, in the expected order:
					expect(subscriptionLog).toEqual([
						['post title 0', 1],
						['post title 0', 2],
						['post title 1', 2],
						['post title 1', 3],
						['post title 2', 3],
						['post title 2', 4],
					]);

					await expectFinalRecordsToMatch(original.id, 4, 'post title 2');

					// Cleanup:
					await subscription.unsubscribe();
				});
				test('observe on fast connection with awaited outbox', async () => {
					// Number of updates to perform in this test:
					const numberOfUpdates = 3;

					// For tracking sequence of versions and titles returned by `DataStore.observe()`:
					const subscriptionLog: SubscriptionLogTuple[] = [];

					// Record to update:
					const original = await DataStore.save(
						new Post({
							title: 'original title',
							blogId: 'blog id',
						})
					);

					/**
					 * Make sure the save was successfully sent out. There is a separate test
					 * for testing an update when the save is still in the outbox (see above).
					 * Here, `_version` is defined.
					 */
					await waitForEmptyOutbox();

					const subscription = await DataStore.observe(Post).subscribe(
						({ opType, element }) => {
							const response: SubscriptionLogTuple = [
								element.title,
								// No, TypeScript, there is a version:
								// @ts-ignore
								element._version,
							];
							// Track sequence of versions and titles
							subscriptionLog.push(response);
						}
					);

					/**
					 * We wait for the empty outbox on each mutation, because
					 * we want to test non-concurrent updates (i.e. we want to make
					 * sure all the updates are going out and are being observed)
					 */
					await performConsecutiveUpdates({
						originalId: original.id,
						numberOfUpdates,
						waitOnOutbox: true,
						pauseBeforeMutation: false,
					});

					/**
					 * Even though we have increased the latency, we are still waiting
					 * on the outbox after each mutation. Therefore, mutations will not
					 * be merged.
					 */
					await graphqlServiceSettled(graphqlService, numberOfUpdates, 'Post');

					// Validate that `observe` returned the expected updates to
					// `title` and `version`, in the expected order:
					expect(subscriptionLog).toEqual([
						['post title 0', 1],
						['post title 0', 2],
						['post title 1', 2],
						['post title 1', 3],
						['post title 2', 3],
						['post title 2', 4],
					]);

					await expectFinalRecordsToMatch(original.id, 4, 'post title 2');

					// Cleanup:
					await subscription.unsubscribe();
				});
			});
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

		test('omits implicit FK fields in selection set', async () => {
			// old CLI + amplify V5 + sync expressions resulted in broken sync queries,
			// where FK/connection keys were included in the sync queries, *sometimes*
			// resulting in incorrect sync queries.

			let selectionSet: string[];
			graphqlService.log = (message, query) => {
				if (
					message === 'Parsed Request' &&
					query.selection === 'syncLegacyJSONPosts'
				) {
					selectionSet = query.items;
				}
			};

			await resyncWith([
				syncExpression(LegacyJSONPost, p =>
					p?.title.eq("whatever, it doesn't matter.")
				),
			]);

			expect(selectionSet!).toBeDefined();
			expect(selectionSet!).toEqual([
				'id',
				'title',
				'createdAt',
				'updatedAt',
				'_version',
				'_lastChangedAt',
				'_deleted',
				'blog',
			]);
		});

		test('subscription query receives expected filter variable', async () => {
			await resyncWith([
				syncExpression(
					Post,
					async () => post => post.title.contains('cleaning')
				),
			]);

			// first 3 subscription requests are from calling DataStore.start in the `beforeEach`
			const [, , , onCreate, onUpdate, onDelete] = graphqlService.requests
				.filter(r => r.operation === 'subscription' && r.tableName === 'Post')
				.map(req => req.variables.filter);

			const expectedFilter = {
				and: [
					{
						title: {
							contains: 'cleaning',
						},
					},
				],
			};

			expect(onCreate).toEqual(expectedFilter);
			expect(onUpdate).toEqual(expectedFilter);
			expect(onDelete).toEqual(expectedFilter);
		});

		test('subscription query receives expected filter variable - nested', async () => {
			await resyncWith([
				syncExpression(
					Model,
					async () => m =>
						m.or(or => [
							or.and(and => [
								and.field1.eq('field'),
								and.createdAt.gt('1/1/2023'),
							]),
							or.and(and => [
								and.or(or => [
									or.optionalField1.beginsWith('a'),
									or.optionalField1.notContains('z'),
								]),
								and.emails.ne('-'),
							]),
						])
				),
			]);

			// first 3 subscription requests are from calling DataStore.start in the `beforeEach`
			const [, , , onCreate, onUpdate, onDelete] = graphqlService.requests
				.filter(r => r.operation === 'subscription' && r.tableName === 'Model')
				.map(req => req.variables.filter);

			expect(onCreate).toEqual(onUpdate);
			expect(onCreate).toEqual(onDelete);
			expect(onCreate).toMatchInlineSnapshot(`
			Object {
			  "or": Array [
			    Object {
			      "and": Array [
			        Object {
			          "field1": Object {
			            "eq": "field",
			          },
			        },
			        Object {
			          "createdAt": Object {
			            "gt": "1/1/2023",
			          },
			        },
			      ],
			    },
			    Object {
			      "and": Array [
			        Object {
			          "or": Array [
			            Object {
			              "optionalField1": Object {
			                "beginsWith": "a",
			              },
			            },
			            Object {
			              "optionalField1": Object {
			                "notContains": "z",
			              },
			            },
			          ],
			        },
			        Object {
			          "emails": Object {
			            "ne": "-",
			          },
			        },
			      ],
			    },
			  ],
			}
		`);
		});
	});

	describe('error handling', () => {
		/**
		 * NOTE that some of these tests mock sync responses, which are initiated
		 * in the `beforeEach` one `describe` level up. This should still allow us
		 * time to intercept sync and subscription queries. If we find that these
		 * tests are *racing* the sync process, either move this describe block out
		 * and only `DataStore.start()` in the individual tests, or instantiate
		 * `errorHandler` listeners up a level.
		 */

		// Individual unauthorized error with `null` items indicates that AppSync
		// recognizes the auth, but the resolver rejected with $util.unauthorized()
		// in the request mapper.
		test('request mapper $util.unauthorized error on sync', async () => {
			graphqlService.intercept = (request, next) => {
				if (request.query.includes('syncLegacyJSONComments')) {
					throw {
						data: { syncLegacyJSONComments: null },
						errors: [
							{
								path: ['syncLegacyJSONComments'],
								data: null,
								errorType: 'Unauthorized',
								errorInfo: null,
								locations: [{ line: 2, column: 3, sourceName: null }],
								message:
									'Not Authorized to access syncLegacyJSONComments on type Query',
							},
						],
					};
				} else {
					return next();
				}
			};

			const error: any = await waitForNextMessage(errorHandler);
			expect(error.errorType).toBe('Unauthorized');
		});

		// Individual unauthorized error with `null` items indicates that AppSync
		// recognizes the auth, but the resolver rejected with $util.unauthorized()
		// in the request mapper.
		test('request mapper $util.unauthorized error on mutate', async () => {
			graphqlService.intercept = (request, next) => {
				if (request.query.includes('createLegacyJSONComment')) {
					throw {
						data: { createLegacyJSONComment: null },
						errors: [
							{
								path: ['createLegacyJSONComment'],
								data: null,
								errorType: 'Unauthorized',
								errorInfo: null,
								locations: [{ line: 2, column: 3, sourceName: null }],
								message:
									'Not Authorized to access createLegacyJSONComment on type Mutation',
							},
						],
					};
				} else {
					return next();
				}
			};
			DataStore.save(
				new LegacyJSONComment({
					content: 'test content',
				})
			);

			const error: any = await waitForNextMessage(errorHandler);
			expect(error.errorType).toBe('Unauthorized');
		});
	});
});
