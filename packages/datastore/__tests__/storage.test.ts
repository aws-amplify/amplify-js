import 'fake-indexeddb/auto';
import {
	DataStore as DataStoreType,
	initSchema as initSchemaType,
} from '../src/datastore/datastore';
import { PersistentModelConstructor } from '../src/types';
import { Model, Post, Comment, testSchema } from './helpers';

let initSchema: typeof initSchemaType;
let DataStore: typeof DataStoreType;

describe('Storage tests', () => {
	describe('Update', () => {
		describe('Only include changed fields', () => {
			let zenNext;

			beforeEach(() => {
				jest.resetModules();
				jest.resetAllMocks();

				zenNext = jest.fn();

				jest.doMock('zen-push', () => {
					class zenPush {
						constructor() {}
						next = zenNext;
					}

					return zenPush;
				});

				({ initSchema, DataStore } = require('../src/datastore/datastore'));
			});

			test('scalar', async () => {
				const classes = initSchema(testSchema());

				const { Model } = classes as {
					Model: PersistentModelConstructor<Model>;
				};

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

				const [_settingsSave, [modelSave], [modelUpdate]] = zenNext.mock.calls;

				// Save should include
				expect(modelSave.element.dateCreated).toEqual(dateCreated);

				// Update mutation should only include updated fields
				// => dateCreated should be undefined
				expect(modelUpdate.element.dateCreated).toBeUndefined();
				expect(modelUpdate.element.field1).toEqual('edited');
			});

			test('list (destructured)', async () => {
				const classes = initSchema(testSchema());

				const { Model } = classes as {
					Model: PersistentModelConstructor<Model>;
				};

				const model = await DataStore.save(
					new Model({
						field1: 'Some value',
						dateCreated: new Date().toISOString(),
						emails: ['john@doe.com', 'jane@doe.com'],
					})
				);

				await DataStore.save(
					Model.copyOf(model, draft => {
						draft.emails = [...draft.emails, 'joe@doe.com'];
					})
				);

				const [[modelSave], [modelUpdate]] = zenNext.mock.calls;

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
				const classes = initSchema(testSchema());

				const { Model } = classes as {
					Model: PersistentModelConstructor<Model>;
				};

				const model = await DataStore.save(
					new Model({
						field1: 'Some value',
						dateCreated: new Date().toISOString(),
						emails: ['john@doe.com', 'jane@doe.com'],
					})
				);

				await DataStore.save(
					Model.copyOf(model, draft => {
						draft.emails.push('joe@doe.com');
					})
				);

				const [[modelSave], [modelUpdate]] = zenNext.mock.calls;

				const expectedValueEmails = [
					'john@doe.com',
					'jane@doe.com',
					'joe@doe.com',
				];

				expect(modelUpdate.element.dateCreated).toBeUndefined();
				expect(modelUpdate.element.field1).toBeUndefined();
				expect(modelUpdate.element.emails).toMatchObject(expectedValueEmails);
			});

			test('list unchanged', async () => {
				const classes = initSchema(testSchema());

				const { Model } = classes as {
					Model: PersistentModelConstructor<Model>;
				};

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

				const [[modelSave], [modelUpdate]] = zenNext.mock.calls;

				expect(modelUpdate.element.dateCreated).toBeUndefined();
				expect(modelUpdate.element.field1).toEqual('Updated value');
				expect(modelUpdate.element.emails).toBeUndefined();
			});

			test('custom type (destructured)', async () => {
				const classes = initSchema(testSchema());

				const { Model } = classes as {
					Model: PersistentModelConstructor<Model>;
				};

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
						};
					})
				);

				const [[modelSave], [modelUpdate]] = zenNext.mock.calls;

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
				const classes = initSchema(testSchema());

				const { Model } = classes as {
					Model: PersistentModelConstructor<Model>;
				};

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
						draft.metadata.penNames = ['bob'];
					})
				);

				const [[modelSave], [modelUpdate]] = zenNext.mock.calls;

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

			test('custom type unchanged', async () => {
				const classes = initSchema(testSchema());

				const { Model } = classes as {
					Model: PersistentModelConstructor<Model>;
				};

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

				const [[modelSave], [modelUpdate]] = zenNext.mock.calls;

				expect(modelUpdate.element.dateCreated).toBeUndefined();
				expect(modelUpdate.element.field1).toEqual('Updated value');
				expect(modelUpdate.element.metadata).toBeUndefined();
			});

			test('relation', async () => {
				const classes = initSchema(testSchema());

				const { Post, Comment } = classes as {
					Post: PersistentModelConstructor<Post>;
					Comment: PersistentModelConstructor<Comment>;
				};

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

				const [
					[_post1Save],
					[commentSave],
					[_post2Save],
					[commentUpdate],
				] = zenNext.mock.calls;

				expect(commentSave.element.postId).toEqual(post.id);
				expect(commentUpdate.element.postId).toEqual(anotherPost.id);
			});
		});
	});
});
