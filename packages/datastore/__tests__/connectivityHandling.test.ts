import { Observable } from 'rxjs';
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
		 * NOTE:
		 * The following test assertions are based on *existing* behavior, not *correct*
		 * behavior. Once we have fixed rapid single-field consecutive updates, and updates on a
		 * poor connection, we should update these assertions to reflect the *correct* behavior.
		 *
		 * WHAT WE ARE TESTING:
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
		 *
		 * NOTES ON HOW WE PERFORM CONSECUTIVE UPDATES:
		 *
		 * When we want to test a scenario where the outbox does not necessarily merge all outgoing
		 * requests (for instance, when we do not add artifical latency to the connection), we make
		 * the mutations rapidly (i.e. we don't await the outbox). However, because of how
		 * rapidly the mutations are performed, we are creating an artifical situation where
		 * mutations will always be merged. Adding a slight pause between mutations dds a
		 * semi-realistic pause ("button clicks") between updates. This is not required when awaiting
		 * the outbox after each mutation. Additionally, a pause is not required if we are
		 * intentionally testing rapid updates, such as when the initial save is still pending.
		 *
		 * When we want to test a scenario where the user is waiting for a long period of time
		 * between each mutation (non-concurrent updates), we wait for an empty outbox after each
		 * mutation. This ensures each mutation completes a full cycle before the next mutation
		 * begins. This guarantees that there will NEVER be concurrent updates being processed by
		 * the outbox.
		 */
		describe('observed rapid single-field mutations with variable connection latencies', () => {
			// Number of primary client updates:
			const numberOfUpdates = 3;

			// Incremented after each update:
			let expectedNumberOfUpdates = 0;

			// Tuple of updated `title` and `_version`:
			type SubscriptionLogTuple = [string, number];

			// updated `title`, `blogId`, and `_version`:
			type SubscriptionLogMultiField = [string, string, number];

			/**
			 * Since we're essentially testing race conditions, we want to test the outbox logic
			 * exactly the same each time the tests are run. Minor fluctuations in test runs can
			 * cause different outbox behavior, so we set jitter to `0`.
			 */
			const jitter: number = 0;
			const latency: number = 1000;

			/**
			 * Simulate a second client updating the original post
			 * @param originalPostId id of the post to update
			 * @param updatedFields field(s) to update
			 * @param version version number to be sent with the request (what would have been
			 * returned from a query prior to update)
			 */
			type ExternalPostUpdateParams = {
				originalPostId: string;
				updatedFields: Partial<any>;
				version: number | undefined;
			};

			const externalPostUpdate = async ({
				originalPostId,
				updatedFields,
				version,
			}: ExternalPostUpdateParams) => {
				await graphqlService.externalGraphql(
					{
						query: `
							mutation operation($input: UpdatePostInput!, $condition: ModelPostConditionInput) {
								updatePost(input: $input, condition: $condition) {
									id
									title
									blogId
									updatedAt
									createdAt
									_version
									_lastChangedAt
									_deleted
								}
							}
						`,
						variables: {
							input: {
								id: originalPostId,
								...updatedFields,
								_version: version,
							},
							condition: null,
						},
						authMode: undefined,
						authToken: undefined,
					},
					// For now we always ignore latency for external mutations. This could be a param if needed.
					true
				);
			};

			/**
			 * Query post, update, then increment counter.
			 * @param postId - id of the post to update
			 * @param updatedTitle - title to update the post with
			 */
			const revPost = async (postId: string, updatedTitle: string) => {
				const retrieved = await DataStore.query(Post, postId);

				await DataStore.save(
					// @ts-ignore
					Post.copyOf(retrieved, updated => {
						updated.title = updatedTitle;
					})
				);

				expectedNumberOfUpdates++;
			};

			/**
			 * @param postId `id` of the record that was updated
			 * @param version expected final `_version` of the record after all updates are complete
			 * @param title expected final `title` of the record after all updates are complete
			 * @param blogId expected final `blogId` of the record after all updates are complete
			 */
			type FinalAssertionParams = {
				postId: string;
				version: number;
				title: string;
				blogId?: string | null;
			};

			const expectFinalRecordsToMatch = async ({
				postId,
				version,
				title,
				blogId = undefined,
			}: FinalAssertionParams) => {
				// Validate that the record was saved to the service:
				const table = graphqlService.tables.get('Post')!;
				expect(table.size).toEqual(1);

				// Validate that the title was updated successfully:
				const savedItem = table.get(JSON.stringify([postId])) as any;
				expect(savedItem.title).toEqual(title);

				if (blogId) expect(savedItem.blogId).toEqual(blogId);

				// Validate that the `_version` was incremented correctly:
				expect(savedItem._version).toEqual(version);

				// Validate that `query` returns the latest `title` and `_version`:
				const queryResult = await DataStore.query(Post, postId);
				expect(queryResult?.title).toEqual(title);
				// @ts-ignore
				expect(queryResult?._version).toEqual(version);

				if (blogId) expect(queryResult?.blogId).toEqual(blogId);
			};

			describe('single client updates', () => {
				/**
				 * All observed updates. Also includes "updates" from initial record creation,
				 * since we start the subscription in the `beforeEach` block.
				 */
				let subscriptionLog: SubscriptionLogTuple[] = [];

				beforeEach(async () => {
					await DataStore.observe(Post).subscribe(({ opType, element }) => {
						if (opType === 'UPDATE') {
							const response: SubscriptionLogTuple = [
								element.title,
								// No, TypeScript, there is a version:
								// @ts-ignore
								element._version,
							];
							// Track sequence of versions and titles
							subscriptionLog.push(response);
						}
					});
				});

				afterEach(async () => {
					expectedNumberOfUpdates = 0;
					subscriptionLog = [];
				});

				test('rapid mutations on poor connection when initial create is not pending', async () => {
					// Record to update:
					const original = await DataStore.save(
						new Post({
							title: 'original title',
							blogId: 'blog id',
						})
					);

					/**
					 * Make sure the save was successfully sent out. Here `_version` IS defined.
					 */
					await waitForEmptyOutbox();

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

					//region perform consecutive updates
					await revPost(original.id, 'post title 0');
					await revPost(original.id, 'post title 1');
					await revPost(original.id, 'post title 2');
					//endregion

					// Now we wait for the outbox to do what it needs to do:
					await waitForEmptyOutbox();

					/**
					 * Because we have increased the latency, and don't wait for the outbox
					 * to clear on each mutation, the outbox will merge some of the mutations.
					 * In this example, we expect the number of requests received to be one less than
					 * the actual number of updates. If we were running this test without
					 * increased latency, we'd expect more requests to be received.
					 */
					await graphqlServiceSettled({
						graphqlService,
						expectedNumberOfUpdates: expectedNumberOfUpdates - 1,
						externalNumberOfUpdates: 0,
						modelName: 'Post',
					});

					// Validate that `observe` returned the expected updates to
					// `title` and `version`, in the expected order:
					expect(subscriptionLog).toEqual([
						['original title', 1],
						['post title 0', 1],
						['post title 1', 1],
						['post title 2', 1],
						['post title 0', 3],
					]);

					expectFinalRecordsToMatch({
						postId: original.id,
						version: 3,
						title: 'post title 0',
					});
				});
				test('rapid mutations on fast connection when initial create is not pending', async () => {
					// Record to update:
					const original = await DataStore.save(
						new Post({
							title: 'original title',
							blogId: 'blog id',
						})
					);

					/**
					 * Make sure the save was successfully sent out. Here, `_version` is defined.
					 */
					await waitForEmptyOutbox();

					// Note: We do NOT wait for the outbox to be empty here, because
					// we want to test concurrent updates being processed by the outbox.

					//region perform consecutive updates
					await pause(200);
					await revPost(original.id, 'post title 0');

					await pause(200);
					await revPost(original.id, 'post title 1');

					await pause(200);
					await revPost(original.id, 'post title 2');
					//endregion

					// Now we wait for the outbox to do what it needs to do:
					await waitForEmptyOutbox();

					/**
					 * Because we have NOT increased the latency, the outbox will not merge
					 * the mutations. In this example, we expect the number of requests
					 * received to be the same as the number of updates. If we were
					 * running this test with increased latency, we'd expect less requests
					 * to be received.
					 */
					await graphqlServiceSettled({
						graphqlService,
						expectedNumberOfUpdates: numberOfUpdates,
						externalNumberOfUpdates: 0,
						modelName: 'Post',
					});

					// Validate that `observe` returned the expected updates to
					// `title` and `version`, in the expected order:
					expect(subscriptionLog).toEqual([
						['original title', 1],
						['post title 0', 1],
						['post title 1', 1],
						['post title 2', 1],
						['post title 0', 4],
					]);

					expectFinalRecordsToMatch({
						postId: original.id,
						version: 4,
						title: 'post title 0',
					});
				});
				test('rapid mutations on poor connection when initial create is pending', async () => {
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

					//region perform consecutive updates
					await revPost(original.id, 'post title 0');
					await revPost(original.id, 'post title 1');
					await revPost(original.id, 'post title 2');
					//endregion

					// Now we wait for the outbox to do what it needs to do:
					await waitForEmptyOutbox();

					/**
					 * Currently, the service does not receive any requests.
					 */
					await graphqlServiceSettled({
						graphqlService,
						expectedNumberOfUpdates: 0,
						externalNumberOfUpdates: 0,
						modelName: 'Post',
					});

					// Validate that `observe` returned the expected updates to
					// `title` and `version`, in the expected order:
					expect(subscriptionLog).toEqual([
						['post title 0', undefined],
						['post title 1', undefined],
						['post title 2', undefined],
						['post title 2', 1],
					]);

					expectFinalRecordsToMatch({
						postId: original.id,
						version: 1,
						title: 'post title 2',
					});
				});
				test('rapid mutations on fast connection when initial create is pending', async () => {
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

					//region perform consecutive updates
					await pause(200);
					await revPost(original.id, 'post title 0');

					await pause(200);
					await revPost(original.id, 'post title 1');

					await pause(200);
					await revPost(original.id, 'post title 2');
					//endregion

					// Now we wait for the outbox to do what it needs to do:
					await waitForEmptyOutbox();

					/**
					 * Currently, the service does not receive any requests.
					 */
					await graphqlServiceSettled({
						graphqlService,
						expectedNumberOfUpdates: 0,
						externalNumberOfUpdates: 0,
						modelName: 'Post',
					});

					// Validate that `observe` returned the expected updates to
					// `title` and `version`, in the expected order:
					expect(subscriptionLog).toEqual([
						['post title 0', undefined],
						['post title 1', undefined],
						['post title 2', undefined],
						['post title 2', 1],
					]);

					expectFinalRecordsToMatch({
						postId: original.id,
						version: 1,
						title: 'post title 2',
					});
				});
				test('observe on poor connection with awaited outbox', async () => {
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

					//region perform consecutive updates
					await revPost(original.id, 'post title 0');
					await waitForEmptyOutbox();

					await revPost(original.id, 'post title 1');
					await waitForEmptyOutbox();

					await revPost(original.id, 'post title 2');
					await waitForEmptyOutbox();
					//endregion

					/**
					 * Even though we have increased the latency, we are still waiting
					 * on the outbox after each mutation. Therefore, mutations will not
					 * be merged.
					 */
					await graphqlServiceSettled({
						graphqlService,
						expectedNumberOfUpdates: numberOfUpdates,
						externalNumberOfUpdates: 0,
						modelName: 'Post',
					});

					// Validate that `observe` returned the expected updates to
					// `title` and `version`, in the expected order:
					expect(subscriptionLog).toEqual([
						['original title', 1],
						['post title 0', 1],
						['post title 0', 2],
						['post title 1', 2],
						['post title 1', 3],
						['post title 2', 3],
						['post title 2', 4],
					]);

					expectFinalRecordsToMatch({
						postId: original.id,
						version: 4,
						title: 'post title 2',
					});
				});
				test('observe on fast connection with awaited outbox', async () => {
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

					/**
					 * We wait for the empty outbox on each mutation, because
					 * we want to test non-concurrent updates (i.e. we want to make
					 * sure all the updates are going out and are being observed)
					 */

					//region perform consecutive updates
					await revPost(original.id, 'post title 0');
					await waitForEmptyOutbox();

					await revPost(original.id, 'post title 1');
					await waitForEmptyOutbox();

					await revPost(original.id, 'post title 2');
					await waitForEmptyOutbox();
					//endregion

					/**
					 * Even though we have increased the latency, we are still waiting
					 * on the outbox after each mutation. Therefore, mutations will not
					 * be merged.
					 */
					await graphqlServiceSettled({
						graphqlService,
						expectedNumberOfUpdates: numberOfUpdates,
						externalNumberOfUpdates: 0,
						modelName: 'Post',
					});

					// Validate that `observe` returned the expected updates to
					// `title` and `version`, in the expected order:
					expect(subscriptionLog).toEqual([
						['original title', 1],
						['post title 0', 1],
						['post title 0', 2],
						['post title 1', 2],
						['post title 1', 3],
						['post title 2', 3],
						['post title 2', 4],
					]);

					expectFinalRecordsToMatch({
						postId: original.id,
						version: 4,
						title: 'post title 2',
					});
				});
			});
			/**
			 * The following multi-client tests are almost identical to the single-client tests above:
			 * as a result, the comments in these tests relate specifically to multi-client operations only.
			 * The primary differences are that we inject external client updates, and add many permutations
			 * on essentially the same patterns. For a complete understanding of how these tests work (why /
			 * when we await the outbox, pause, wait for the service to settle, etc), refer to the
			 * single-field tests.
			 */
			describe('Multi-client updates', () => {
				describe('Updates to the same field', () => {
					/**
					 * All observed updates. Also includes "updates" from initial record creation,
					 * since we start the subscription in the `beforeEach` block.
					 */
					let subscriptionLog: SubscriptionLogTuple[] = [];

					beforeEach(async () => {
						await DataStore.observe(Post).subscribe(({ opType, element }) => {
							if (opType === 'UPDATE') {
								const response: SubscriptionLogTuple = [
									element.title,
									// No, TypeScript, there is a version:
									// @ts-ignore
									element._version,
								];
								// Track sequence of versions and titles
								subscriptionLog.push(response);
							}
						});
					});

					afterEach(async () => {
						expectedNumberOfUpdates = 0;
						subscriptionLog = [];
					});

					test('rapid mutations on poor connection when initial create is not pending', async () => {
						const original = await DataStore.save(
							new Post({
								title: 'original title',
								blogId: 'blog id',
							})
						);

						await waitForEmptyOutbox();

						graphqlService.setLatencies({
							request: latency,
							response: latency,
							subscriber: latency,
							jitter,
						});

						//region perform consecutive updates
						await revPost(original.id, 'post title 0');

						await revPost(original.id, 'post title 1');

						await externalPostUpdate({
							originalPostId: original.id,
							updatedFields: { title: 'update from second client' },
							version: 1,
						});

						await revPost(original.id, 'post title 2');
						//endregion

						await waitForEmptyOutbox();

						await graphqlServiceSettled({
							graphqlService,
							expectedNumberOfUpdates: expectedNumberOfUpdates - 1,
							externalNumberOfUpdates: 1,
							modelName: 'Post',
						});

						expect(subscriptionLog).toEqual([
							['original title', 1],
							['post title 0', 1],
							['post title 1', 1],
							['post title 2', 1],
							['update from second client', 4],
						]);

						expectFinalRecordsToMatch({
							postId: original.id,
							version: 4,
							title: 'update from second client',
						});
					});
					test('rapid mutations on fast connection when initial create is not pending', async () => {
						const original = await DataStore.save(
							new Post({
								title: 'original title',
								blogId: 'blog id',
							})
						);

						await waitForEmptyOutbox();

						//region perform consecutive updates
						await pause(200);
						await revPost(original.id, 'post title 0');

						await pause(200);
						await revPost(original.id, 'post title 1');

						await externalPostUpdate({
							originalPostId: original.id,
							updatedFields: { title: 'update from second client' },
							version: 1,
						});

						await pause(200);
						await revPost(original.id, 'post title 2');
						//endregion

						await waitForEmptyOutbox();

						await graphqlServiceSettled({
							graphqlService,
							expectedNumberOfUpdates: numberOfUpdates,
							externalNumberOfUpdates: 1,
							modelName: 'Post',
						});

						expect(subscriptionLog).toEqual([
							['original title', 1],
							['post title 0', 1],
							['post title 1', 1],
							['post title 2', 1],
							['post title 0', 5],
						]);

						expectFinalRecordsToMatch({
							postId: original.id,
							version: 5,
							title: 'post title 0',
						});
					});
					test('observe on poor connection with awaited outbox', async () => {
						const original = await DataStore.save(
							new Post({
								title: 'original title',
								blogId: 'blog id',
							})
						);

						await waitForEmptyOutbox();

						graphqlService.setLatencies({
							request: latency,
							response: latency,
							subscriber: latency,
							jitter,
						});

						//region perform consecutive updates
						await revPost(original.id, 'post title 0');
						await waitForEmptyOutbox();

						await revPost(original.id, 'post title 1');
						await waitForEmptyOutbox();

						await externalPostUpdate({
							originalPostId: original.id,
							updatedFields: { title: 'update from second client' },
							version: 3,
						});

						await revPost(original.id, 'post title 2');
						await waitForEmptyOutbox();
						//endregion

						await graphqlServiceSettled({
							graphqlService,
							expectedNumberOfUpdates: numberOfUpdates,
							externalNumberOfUpdates: 1,
							modelName: 'Post',
						});

						expect(subscriptionLog).toEqual([
							['original title', 1],
							['post title 0', 1],
							['post title 0', 2],
							['post title 1', 2],
							['post title 1', 3],
							['update from second client', 4],
							['post title 2', 4],
							['post title 2', 5],
						]);

						expectFinalRecordsToMatch({
							postId: original.id,
							version: 5,
							title: 'post title 2',
						});
					});
					test('observe on fast connection with awaited outbox', async () => {
						const original = await DataStore.save(
							new Post({
								title: 'original title',
								blogId: 'blog id',
							})
						);

						await waitForEmptyOutbox();

						//region perform consecutive updates
						await revPost(original.id, 'post title 0');
						await waitForEmptyOutbox();

						await revPost(original.id, 'post title 1');
						await waitForEmptyOutbox();

						await externalPostUpdate({
							originalPostId: original.id,
							updatedFields: { title: 'update from second client' },
							version: 3,
						});

						await revPost(original.id, 'post title 2');
						await waitForEmptyOutbox();
						//endregion

						await graphqlServiceSettled({
							graphqlService,
							expectedNumberOfUpdates: numberOfUpdates,
							externalNumberOfUpdates: 1,
							modelName: 'Post',
						});

						expect(subscriptionLog).toEqual([
							['original title', 1],
							['post title 0', 1],
							['post title 0', 2],
							['post title 1', 2],
							['post title 1', 3],
							['update from second client', 4],
							['post title 2', 4],
							['post title 2', 5],
						]);

						expectFinalRecordsToMatch({
							postId: original.id,
							version: 5,
							title: 'post title 2',
						});
					});
				});
				describe('Updates to different fields', () => {
					/**
					 * All observed updates. Also includes "updates" from initial record creation,
					 * since we start the subscription in the `beforeEach` block.
					 */
					let subscriptionLog: SubscriptionLogMultiField[] = [];

					beforeEach(async () => {
						await DataStore.observe(Post).subscribe(({ opType, element }) => {
							const response: SubscriptionLogMultiField = [
								element.title,
								// @ts-ignore
								element.blogId,
								// @ts-ignore
								element._version,
							];
							subscriptionLog.push(response);
						});
					});

					afterEach(async () => {
						expectedNumberOfUpdates = 0;
						subscriptionLog = [];
					});

					/**
					 * NOTE: Even though the primary client is updating `title`,
					 * the second client's update to `blogId` "reverts" the primary
					 * client's changes. This is because the external update takes
					 * effect while the primary client's updates are still in flight.
					 * By the time the primary client's update reaches the service,
					 * the `_version` has changed. As a result, auto-merge chooses
					 * the existing server-side `title` over the proposed updated
					 * `title`. The following two tests demonstrate this behavior,
					 * with a difference in the timing of the external request,
					 * ultimately resulting in different final states.
					 */
					test('poor connection, initial create is not pending, external request is first received update', async () => {
						const original = await DataStore.save(
							new Post({
								title: 'original title',
							})
						);

						await waitForEmptyOutbox();

						graphqlService.setLatencies({
							request: latency,
							response: latency,
							subscriber: latency,
							jitter,
						});

						//region perform consecutive updates
						await revPost(original.id, 'post title 0');

						await revPost(original.id, 'post title 1');

						await externalPostUpdate({
							originalPostId: original.id,
							// External client performs a mutation against a different field:
							updatedFields: { blogId: 'update from second client' },
							version: 1,
						});

						await revPost(original.id, 'post title 2');
						//endregion

						await waitForEmptyOutbox();

						await graphqlServiceSettled({
							graphqlService,
							expectedNumberOfUpdates: expectedNumberOfUpdates - 1,
							externalNumberOfUpdates: 1,
							modelName: 'Post',
						});

						expect(subscriptionLog).toEqual([
							['original title', null, undefined],
							['original title', null, 1],
							['post title 0', null, 1],
							['post title 1', null, 1],
							['post title 2', null, 1],
							['original title', 'update from second client', 4],
						]);

						expectFinalRecordsToMatch({
							postId: original.id,
							version: 4,
							title: 'original title',
							blogId: 'update from second client',
						});
					});
					test('poor connection, initial create is not pending, external request is second received update', async () => {
						const original = await DataStore.save(
							new Post({
								title: 'original title',
							})
						);

						await waitForEmptyOutbox();

						graphqlService.setLatencies({
							request: latency,
							response: latency,
							subscriber: latency,
							jitter,
						});

						//region perform consecutive updates
						await revPost(original.id, 'post title 0');

						await revPost(original.id, 'post title 1');

						/**
						 * Ensure that the external update is received after the
						 * primary client's first update.
						 */
						await pause(3000);

						await externalPostUpdate({
							originalPostId: original.id,
							// External client performs a mutation against a different field:
							updatedFields: { blogId: 'update from second client' },
							version: 1,
						});

						await revPost(original.id, 'post title 2');
						//endregion

						await waitForEmptyOutbox();

						await graphqlServiceSettled({
							graphqlService,
							expectedNumberOfUpdates,
							externalNumberOfUpdates: 1,
							modelName: 'Post',
						});

						expect(subscriptionLog).toEqual([
							['original title', null, undefined],
							['original title', null, 1],
							['post title 0', null, 1],
							['post title 1', null, 1],
							['post title 2', null, 1],
							['post title 0', 'update from second client', 5],
						]);

						expectFinalRecordsToMatch({
							postId: original.id,
							version: 5,
							title: 'post title 0',
							blogId: 'update from second client',
						});
					});
					test('rapid mutations on fast connection when initial create is not pending (second field is `null`)', async () => {
						const original = await DataStore.save(
							new Post({
								title: 'original title',
							})
						);

						await waitForEmptyOutbox();

						//region perform consecutive updates
						await pause(200);
						await revPost(original.id, 'post title 0');

						await pause(200);
						await revPost(original.id, 'post title 1');

						await externalPostUpdate({
							originalPostId: original.id,
							// External client performs a mutation against a different field:
							updatedFields: { blogId: 'update from second client' },
							version: 1,
						});

						await pause(200);
						await revPost(original.id, 'post title 2');
						//endregion

						await waitForEmptyOutbox();

						await graphqlServiceSettled({
							graphqlService,
							expectedNumberOfUpdates: numberOfUpdates,
							externalNumberOfUpdates: 1,
							modelName: 'Post',
						});

						expect(subscriptionLog).toEqual([
							['original title', null, undefined],
							['original title', null, 1],
							['post title 0', null, 1],
							['post title 1', null, 1],
							['post title 2', null, 1],
							['post title 0', 'update from second client', 5],
						]);

						expectFinalRecordsToMatch({
							postId: original.id,
							version: 5,
							title: 'post title 0',
							blogId: 'update from second client',
						});
					});
					/**
					 * All other multi-client tests begin with a `null` value to the field that is being
					 * updated by the external client (`blogId`).
					 * This is the only scenario where providing an inital value to `blogId` will result
					 * in different behavior.
					 */
					test('rapid mutations on fast connection when initial create is not pending (second field has initial value)', async () => {
						const original = await DataStore.save(
							new Post({
								title: 'original title',
								blogId: 'original blogId',
							})
						);

						await waitForEmptyOutbox();

						//region perform consecutive updates
						await pause(200);
						await revPost(original.id, 'post title 0');

						await pause(200);
						await revPost(original.id, 'post title 1');

						await externalPostUpdate({
							originalPostId: original.id,
							// External client performs a mutation against a different field:
							updatedFields: { blogId: 'update from second client' },
							version: 1,
						});

						await pause(200);
						await revPost(original.id, 'post title 2');
						//endregion

						await waitForEmptyOutbox();

						await graphqlServiceSettled({
							graphqlService,
							expectedNumberOfUpdates: numberOfUpdates,
							externalNumberOfUpdates: 1,
							modelName: 'Post',
						});

						expect(subscriptionLog).toEqual([
							['original title', 'original blogId', undefined],
							['original title', 'original blogId', 1],
							['post title 0', 'original blogId', 1],
							['post title 1', 'original blogId', 1],
							['post title 2', 'original blogId', 1],
							['post title 0', 'original blogId', 5],
						]);

						expectFinalRecordsToMatch({
							postId: original.id,
							version: 5,
							title: 'post title 0',
							blogId: 'original blogId',
						});
					});
					test('observe on poor connection with awaited outbox', async () => {
						const original = await DataStore.save(
							new Post({
								title: 'original title',
							})
						);

						await waitForEmptyOutbox();

						graphqlService.setLatencies({
							request: latency,
							response: latency,
							subscriber: latency,
							jitter,
						});

						//region perform consecutive updates
						await revPost(original.id, 'post title 0');
						await waitForEmptyOutbox();

						await revPost(original.id, 'post title 1');
						await waitForEmptyOutbox();

						await externalPostUpdate({
							originalPostId: original.id,
							// External client performs a mutation against a different field:
							updatedFields: { blogId: 'update from second client' },
							version: undefined,
						});

						await revPost(original.id, 'post title 2');
						await waitForEmptyOutbox();
						//endregion

						await graphqlServiceSettled({
							graphqlService,
							expectedNumberOfUpdates: numberOfUpdates,
							externalNumberOfUpdates: 1,
							modelName: 'Post',
						});

						expect(subscriptionLog).toEqual([
							['original title', null, undefined],
							['original title', null, 1],
							['post title 0', null, 1],
							['post title 0', null, 2],
							['post title 1', null, 2],
							['post title 1', null, 3],
							['post title 1', 'update from second client', 4],
							['post title 2', 'update from second client', 4],
							['post title 2', 'update from second client', 5],
						]);

						expectFinalRecordsToMatch({
							postId: original.id,
							version: 5,
							title: 'post title 2',
							blogId: 'update from second client',
						});
					});
					test('observe on fast connection with awaited outbox', async () => {
						const original = await DataStore.save(
							new Post({
								title: 'original title',
							})
						);

						await waitForEmptyOutbox();

						//region perform consecutive updates
						await revPost(original.id, 'post title 0');
						await waitForEmptyOutbox();

						await revPost(original.id, 'post title 1');
						await waitForEmptyOutbox();

						await externalPostUpdate({
							originalPostId: original.id,
							// External client performs a mutation against a different field:
							updatedFields: { blogId: 'update from second client' },
							version: 3,
						});

						await revPost(original.id, 'post title 2');
						await waitForEmptyOutbox();
						//endregion

						await graphqlServiceSettled({
							graphqlService,
							expectedNumberOfUpdates: numberOfUpdates,
							externalNumberOfUpdates: 1,
							modelName: 'Post',
						});

						expect(subscriptionLog).toEqual([
							['original title', null, undefined],
							['original title', null, 1],
							['post title 0', null, 1],
							['post title 0', null, 2],
							['post title 1', null, 2],
							['post title 1', null, 3],
							['post title 1', 'update from second client', 4],
							['post title 2', 'update from second client', 4],
							['post title 2', 'update from second client', 5],
						]);

						expectFinalRecordsToMatch({
							postId: original.id,
							version: 5,
							title: 'post title 2',
							blogId: 'update from second client',
						});
					});
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
				syncExpression(
					LegacyJSONPost,
					p => p?.title.eq("whatever, it doesn't matter.")
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
			{
			  "or": [
			    {
			      "and": [
			        {
			          "field1": {
			            "eq": "field",
			          },
			        },
			        {
			          "createdAt": {
			            "gt": "1/1/2023",
			          },
			        },
			      ],
			    },
			    {
			      "and": [
			        {
			          "or": [
			            {
			              "optionalField1": {
			                "beginsWith": "a",
			              },
			            },
			            {
			              "optionalField1": {
			                "notContains": "z",
			              },
			            },
			          ],
			        },
			        {
			          "emails": {
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
