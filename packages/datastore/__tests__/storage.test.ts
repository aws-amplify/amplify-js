import 'fake-indexeddb/auto';
import {
	DataStore as DataStoreType,
	initSchema as initSchemaType,
} from '../src/datastore/datastore';
import { PersistentModelConstructor } from '../src/types';
import {
	Model,
	Post,
	Comment,
	PostComposite,
	PostCustomPK as PostCustomPKType,
	PostCustomPKSort as PostCustomPKSortType,
	PostCustomPKComposite as PostCustomPKCompositeType,
	testSchema,
} from './helpers';

function getDataStore() {
	const {
		initSchema,
		DataStore,
	}: {
		initSchema: typeof initSchemaType;
		DataStore: typeof DataStoreType;
	} = require('../src/datastore/datastore');

	const classes = initSchema(testSchema());
	const {
		Model,
		Post,
		Comment,
		PostComposite,
		PostCustomPK,
		PostCustomPKSort,
		PostCustomPKComposite,
	} = classes as {
		Model: PersistentModelConstructor<Model>;
		Post: PersistentModelConstructor<Post>;
		Comment: PersistentModelConstructor<Comment>;
		PostComposite: PersistentModelConstructor<PostComposite>;
		PostCustomPK: PersistentModelConstructor<PostCustomPKType>;
		PostCustomPKSort: PersistentModelConstructor<PostCustomPKSortType>;
		PostCustomPKComposite: PersistentModelConstructor<PostCustomPKCompositeType>;
	};

	return {
		DataStore,
		Model,
		Post,
		Comment,
		PostComposite,
		PostCustomPK,
		PostCustomPKSort,
		PostCustomPKComposite,
	};
}

/**
 * Strip out schemaVersion save call that DS performs when starting.
 * Allows us to run any of the tests in isolation (i.e., .only on any test will work)
 *
 * @returns A flattened array of mock function calls
 */
function processZenPushCalls(zenNext): Array<any> {
	const {
		mock: { calls },
	} = zenNext;

	if (!Array.isArray(calls)) {
		return [];
	}

	if (calls.length) {
		const [[first]] = calls;

		if (first?.element?.key === 'schemaVersion') {
			return calls.slice(1).flat();
		}
	}

	return calls.flat();
}

describe('Storage tests', () => {
	describe('Update', () => {
		describe('Only include changed fields', () => {
			let zenNext;

			beforeEach(() => {
				zenNext = jest.fn();

				jest.doMock('zen-push', () => {
					class zenPush {
						constructor() {}
						next = zenNext;
					}

					return zenPush;
				});
			});

			afterEach(() => {
				jest.resetModules();
				jest.resetAllMocks();
			});

			test('scalar', async () => {
				const { DataStore, Model } = getDataStore();
				const dateCreated = new Date().toISOString();

				const model = await DataStore.save(
					new Model({
						field1: 'Some value',
						dateCreated,
					})
				);

				await DataStore.save(
					Model.copyOf(model, draft => {
						draft.field1 = 'edited';
					})
				);

				const [modelSave, modelUpdate] = processZenPushCalls(zenNext);

				// Save should include
				expect(modelSave.element.dateCreated).toEqual(dateCreated);

				// Update mutation should only include updated fields
				// => dateCreated should be undefined
				expect(modelUpdate.element.dateCreated).toBeUndefined();
				expect(modelUpdate.element.field1).toEqual('edited');
			});

			test('scalar - unchanged', async () => {
				const { DataStore, Model } = getDataStore();
				const dateCreated = new Date().toISOString();

				const model = await DataStore.save(
					new Model({
						field1: 'Some value',
						dateCreated,
					})
				);

				await DataStore.save(
					Model.copyOf(model, draft => {
						draft.field1 = 'Some value';
					})
				);

				const [_modelSave, modelUpdate] = processZenPushCalls(zenNext);

				expect(modelUpdate).toBeUndefined();

				expect(true).toBeTruthy();
			});

			test('update by nulling previous value', async () => {
				const { DataStore, Model } = getDataStore();

				const model = await DataStore.save(
					new Model({
						field1: 'Some value',
						optionalField1: 'Some optional value',
						dateCreated: new Date().toISOString(),
					})
				);

				await DataStore.save(
					Model.copyOf(model, draft => {
						draft.optionalField1 = null!;
					})
				);

				const [_modelSave, modelUpdate] = processZenPushCalls(zenNext);

				expect(modelUpdate.element.optionalField1).toBeNull();
			});

			test('updating value with undefined gets saved as null', async () => {
				const { DataStore, Model } = getDataStore();
				const model = await DataStore.save(
					new Model({
						field1: 'Some value',
						optionalField1: 'Some optional value',
						dateCreated: new Date().toISOString(),
					})
				);

				await DataStore.save(
					Model.copyOf(model, draft => {
						draft.optionalField1 = undefined;
					})
				);

				const [_modelSave, modelUpdate] = processZenPushCalls(zenNext);

				expect(modelUpdate.element.optionalField1).toBeNull();
			});

			test('list (destructured)', async () => {
				const { DataStore, Model } = getDataStore();

				const model = await DataStore.save(
					new Model({
						field1: 'Some value',
						dateCreated: new Date().toISOString(),
						emails: ['john@doe.com', 'jane@doe.com'],
					})
				);

				await DataStore.save(
					Model.copyOf(model, draft => {
						draft.emails = [...draft.emails!, 'joe@doe.com'];
					})
				);

				const [_modelSave, modelUpdate] = processZenPushCalls(zenNext);

				const expectedValueEmails = [
					'john@doe.com',
					'jane@doe.com',
					'joe@doe.com',
				];

				expect(modelUpdate.element.dateCreated).toBeUndefined();
				expect(modelUpdate.element.field1).toBeUndefined();
				expect(modelUpdate.element.emails).toMatchObject(expectedValueEmails);
			});

			test('list (push)', async () => {
				const { DataStore, Model } = getDataStore();

				const model = await DataStore.save(
					new Model({
						field1: 'Some value',
						dateCreated: new Date().toISOString(),
						emails: ['john@doe.com', 'jane@doe.com'],
					})
				);

				await DataStore.save(
					Model.copyOf(model, draft => {
						draft.emails!.push('joe@doe.com');
					})
				);

				const [_modelSave, modelUpdate] = processZenPushCalls(zenNext);

				const expectedValueEmails = [
					'john@doe.com',
					'jane@doe.com',
					'joe@doe.com',
				];

				expect(modelUpdate.element.dateCreated).toBeUndefined();
				expect(modelUpdate.element.field1).toBeUndefined();
				expect(modelUpdate.element.emails).toMatchObject(expectedValueEmails);
			});

			test('update with changed field and list unchanged', async () => {
				const { DataStore, Model } = getDataStore();

				const model = await DataStore.save(
					new Model({
						field1: 'Some value',
						dateCreated: new Date().toISOString(),
						emails: ['john@doe.com', 'jane@doe.com'],
					})
				);

				await DataStore.save(
					Model.copyOf(model, draft => {
						draft.field1 = 'Updated value';
						// same as above. should not be included in mutation input
						draft.emails = ['john@doe.com', 'jane@doe.com'];
					})
				);

				const [_modelSave, modelUpdate] = processZenPushCalls(zenNext);

				expect(modelUpdate.element.dateCreated).toBeUndefined();
				expect(modelUpdate.element.field1).toEqual('Updated value');
				expect(modelUpdate.element.emails).toBeUndefined();
			});

			test('update with list unchanged', async () => {
				expect.assertions(1);
				const { DataStore, Model } = getDataStore();

				const model = await DataStore.save(
					new Model({
						field1: 'Some value',
						dateCreated: new Date().toISOString(),
						emails: ['john@doe.com', 'jane@doe.com'],
					})
				);

				await DataStore.save(
					Model.copyOf(model, draft => {
						// same as above. should not result in mutation event
						draft.emails = ['john@doe.com', 'jane@doe.com'];
					})
				);

				const [_modelSave, modelUpdate] = processZenPushCalls(zenNext);

				expect(modelUpdate).toBeUndefined();
			});

			test('update by nulling list', async () => {
				const { DataStore, Model } = getDataStore();

				const model = await DataStore.save(
					new Model({
						field1: 'Some value',
						dateCreated: new Date().toISOString(),
						emails: ['john@doe.com', 'jane@doe.com'],
					})
				);

				await DataStore.save(
					Model.copyOf(model, draft => {
						draft.emails = null!;
					})
				);

				const [_modelSave, modelUpdate] = processZenPushCalls(zenNext);

				expect(modelUpdate.element.emails).toBeNull();
			});

			test('custom type (destructured)', async () => {
				const { DataStore, Model } = getDataStore();

				const model = await DataStore.save(
					new Model({
						field1: 'Some value',
						dateCreated: new Date().toISOString(),
						metadata: {
							author: 'some author',
							rewards: [],
							penNames: [],
						},
					})
				);

				await DataStore.save(
					Model.copyOf(model, draft => {
						draft.metadata = {
							...draft.metadata,
							penNames: ['bob'],
						} as any;
					})
				);

				const [_modelSave, modelUpdate] = processZenPushCalls(zenNext);

				const expectedValueMetadata = {
					author: 'some author',
					rewards: [],
					penNames: ['bob'],
				};

				expect(modelUpdate.element.dateCreated).toBeUndefined();
				expect(modelUpdate.element.field1).toBeUndefined();
				expect(modelUpdate.element.metadata).toMatchObject(
					expectedValueMetadata
				);
			});

			test('custom type (accessor)', async () => {
				const { DataStore, Model } = getDataStore();

				const model = await DataStore.save(
					new Model({
						field1: 'Some value',
						dateCreated: new Date().toISOString(),
						metadata: {
							author: 'some author',
							rewards: [],
							penNames: [],
						},
					})
				);

				await DataStore.save(
					Model.copyOf(model, draft => {
						draft.metadata!.penNames = ['bob'];
					})
				);

				const [_modelSave, modelUpdate] = processZenPushCalls(zenNext);

				const expectedValueMetadata = {
					author: 'some author',
					rewards: [],
					penNames: ['bob'],
				};

				expect(modelUpdate.element.dateCreated).toBeUndefined();
				expect(modelUpdate.element.field1).toBeUndefined();
				expect(modelUpdate.element.metadata).toMatchObject(
					expectedValueMetadata
				);
			});

			test('allowing nested BELONGS_TO to be set', async () => {
				const { DataStore, Post, Comment } = getDataStore();

				const originalPost = await DataStore.save(
					new Post({
						title: 'my best post ever',
					})
				);

				const newPost = await DataStore.save(
					new Post({
						title: 'oops. i mean this is my best post',
					})
				);

				const comment = await DataStore.save(
					new Comment({
						content: 'your post is not that great, actually ....',
						post: originalPost,
					})
				);

				await DataStore.save(
					Comment.copyOf(comment, draft => {
						draft.post = newPost;
					})
				);

				const updatedComment = await DataStore.query(Comment, comment.id);

				expect((await updatedComment!.post).title).toEqual(
					'oops. i mean this is my best post'
				);
			});

			// TODO.
			// Uncomment this test when implementing cascading saves
			test.skip('allowing nested HAS_MANY to be set', async () => {
				const { DataStore, Post, Comment } = getDataStore();

				const post = await DataStore.save(
					new Post({
						title: 'my best post ever',
					})
				);

				const comment = await DataStore.save(
					new Comment({
						content: 'comment 1',
						post,
					})
				);

				new Comment({
					content: 'comment 1',
					post,
				});

				await DataStore.save(
					Post.copyOf(post, updated => {
						updated.comments = [
							comment,
							new Comment({
								content: 'comment 2',
							} as any),
						];
					})
				);

				const test = await DataStore.query(Post, post.id);

				// might have to sort
				expect((await test!.comments.toArray()).map(c => c.content)).toEqual([
					'comment 1',
					'comment 2',
				]);
			});

			test('custom type unchanged', async () => {
				const { DataStore, Model } = getDataStore();

				const model = await DataStore.save(
					new Model({
						field1: 'Some value',
						dateCreated: new Date().toISOString(),
						metadata: {
							author: 'some author',
							rewards: [],
							penNames: [],
						},
					})
				);

				await DataStore.save(
					Model.copyOf(model, draft => {
						draft.field1 = 'Updated value';
						draft.metadata = {
							author: 'some author',
							rewards: [],
							penNames: [],
						};
					})
				);

				const [_modelSave, modelUpdate] = processZenPushCalls(zenNext);

				expect(modelUpdate.element.dateCreated).toBeUndefined();
				expect(modelUpdate.element.field1).toEqual('Updated value');
				expect(modelUpdate.element.metadata).toBeUndefined();
			});

			test('relation', async () => {
				const { DataStore, Post, Comment } = getDataStore();

				const post = await DataStore.save(
					new Post({
						title: 'New Post',
					})
				);

				const comment = await DataStore.save(
					new Comment({
						content: 'Hello world',
						post,
					})
				);

				const anotherPost = await DataStore.save(
					new Post({
						title: 'Another Post',
					})
				);

				await DataStore.save(
					Comment.copyOf(comment, updated => {
						updated.post = anotherPost;
					})
				);

				const [_postSave, commentSave, _anotherPostSave, commentUpdate] =
					processZenPushCalls(zenNext);

				expect(commentSave.element.postId).toEqual(post.id);
				expect(commentUpdate.element.postId).toEqual(anotherPost.id);
			});

			test('composite key', async () => {
				// model has a GSI with a composite key defined:
				// @key(name: "titleSort", fields: ["title", "created", "sort"])

				// updating any of the fields that comprise the sort portion of the composite key [1..n]
				// should include all of the other fields in that key

				// updating the hash key [0] should NOT include the other fields in that key

				const { DataStore, PostComposite } = getDataStore();

				const createdTimestamp = String(Date.now());

				const post = await DataStore.save(
					new PostComposite({
						title: 'New Post',
						description: 'Desc',
						created: createdTimestamp,
						sort: 100,
					})
				);

				// `sort` is part of the key's composite sort key.
				// `created` should also be included in the mutation input
				const updated1 = await DataStore.save(
					PostComposite.copyOf(post, updated => {
						updated.sort = 101;
					})
				);

				// `title` is the HK, so `sort` and `created` should NOT be included in the input
				const updated2 = await DataStore.save(
					PostComposite.copyOf(updated1, updated => {
						updated.title = 'Updated Title';
					})
				);

				// `description` does not belong to a key. No other fields should be included
				await DataStore.save(
					PostComposite.copyOf(updated2, updated => {
						updated.description = 'Updated Desc';
					})
				);

				const [_postSave, postUpdate1, postUpdate2, postUpdate3] =
					processZenPushCalls(zenNext);

				expect(postUpdate1.element.title).toBeUndefined();
				expect(postUpdate1.element.created).toEqual(createdTimestamp);
				expect(postUpdate1.element.sort).toEqual(101);
				expect(postUpdate1.element.description).toBeUndefined();

				expect(postUpdate2.element.title).toEqual('Updated Title');
				expect(postUpdate2.element.created).toBeUndefined();
				expect(postUpdate2.element.sort).toBeUndefined();
				expect(postUpdate2.element.description).toBeUndefined();

				expect(postUpdate3.element.title).toBeUndefined();
				expect(postUpdate3.element.created).toBeUndefined();
				expect(postUpdate3.element.sort).toBeUndefined();
				expect(postUpdate3.element.description).toEqual('Updated Desc');
			});

			test('custom pk', async () => {
				// model has a custom pk defined via @key(fields: ["postId"])
				// the PK should always be included in the mutation input
				const { DataStore, PostCustomPK } = getDataStore();

				const post = await DataStore.save(
					new PostCustomPK({
						postId: '100',
						title: 'New Post',
						description: 'Desc',
						dateCreated: new Date().toISOString(),
					})
				);

				await DataStore.save(
					PostCustomPK.copyOf(post, updated => {
						updated.title = 'Updated';
					})
				);

				const [_postSave, postUpdate] = processZenPushCalls(zenNext);

				expect(postUpdate.element.postId).toEqual('100');
				expect(postUpdate.element.title).toEqual('Updated');
				expect(postUpdate.element.description).toBeUndefined();
			});

			test('custom pk - with sort', async () => {
				// model has a custom pk (hk + sort key) defined via @key(fields: ["id", "postId"])
				// all of the fields in the PK should always be included in the mutation input
				const { DataStore, PostCustomPKSort } = getDataStore();

				const post = await DataStore.save(
					new PostCustomPKSort({
						id: 'abcdef',
						postId: '100',
						title: 'New Post',
					})
				);

				await DataStore.save(
					PostCustomPKSort.copyOf(post, updated => {
						updated.title = 'Updated';
					})
				);

				const [_postSave, postUpdate] = processZenPushCalls(zenNext);

				expect(postUpdate.element.id).toEqual('abcdef');
				expect(postUpdate.element.postId).toEqual('100');
				expect(postUpdate.element.title).toEqual('Updated');
				expect(postUpdate.element.description).toBeUndefined();
			});

			test('custom pk - with composite', async () => {
				// model has a custom pk (hk + composite key) defined via @key(fields: ["id", "postId", "sort"])
				// all of the fields in the PK should always be included in the mutation input
				const { DataStore, PostCustomPKComposite } = getDataStore();

				const post = await DataStore.save(
					new PostCustomPKComposite({
						id: 'abcdef',
						postId: '100',
						title: 'New Post',
						description: 'Desc',
						sort: 1,
					})
				);

				await DataStore.save(
					PostCustomPKComposite.copyOf(post, updated => {
						updated.title = 'Updated';
					})
				);

				const [_postSave, postUpdate] = processZenPushCalls(zenNext);

				expect(postUpdate.element.id).toEqual('abcdef');
				expect(postUpdate.element.postId).toEqual('100');
				expect(postUpdate.element.sort).toEqual(1);
				expect(postUpdate.element.title).toEqual('Updated');
				expect(postUpdate.element.description).toBeUndefined();
			});
		});
	});
});
