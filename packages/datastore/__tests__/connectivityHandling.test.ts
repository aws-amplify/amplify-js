import { Observable } from 'rxjs';
import {
	pause,
	getDataStore,
	waitForEmptyOutbox,
	waitForDataStoreReady,
	waitForSyncQueriesReady,
	warpTime,
	unwarpTime,
} from './helpers';
import { Predicates } from '../src/predicates';
import { syncExpression } from '../src/types';
import { isNode } from '../src/util';

/**
 * When DataStore starts, DataStore will send Control Messages based on the
 * environment that tell it what to do. In this testing environment, both
 * `isNode` and `isBrowser` incorrectly evaluate to `true`. Here we set `isNode`
 * to `false`, without mocking the other utils.
 */
jest.mock('../src/util', () => {
	const originalModule = jest.requireActual('../src/util');

	// Mock the named export 'isNode'
	return {
		__esModule: true,
		...originalModule,
		isNode: () => false,
	};
});

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
