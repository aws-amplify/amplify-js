import 'fake-indexeddb/auto';
import {
	DataStore as DataStoreType,
	initSchema as initSchemaType,
} from '../src/datastore/datastore';
import { PersistentModelConstructor } from '../src/types';
import { Model, Post, Comment, PostComposite, testSchema } from './helpers';

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

			test('scalar - unchanged', async () => {
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
						draft.field1 = 'Some value';
					})
				);

				const [[_modelSave], modelUpdate] = zenNext.mock.calls;

				expect(modelUpdate).toBeUndefined();
				expect(modelUpdate).toBeUndefined();

				expect(true).toBeTruthy();
			});

			test('update by nulling previous value', async () => {
				const classes = initSchema(testSchema());

				const { Model } = classes as {
					Model: PersistentModelConstructor<Model>;
				};

				const model = await DataStore.save(
					new Model({
						field1: 'Some value',
						optionalField1: 'Some optional value',
						dateCreated: new Date().toISOString(),
					})
				);

				await DataStore.save(
					Model.copyOf(model, draft => {
						draft.optionalField1 = null;
					})
				);

				const [[_modelSave], [modelUpdate]] = zenNext.mock.calls;

				expect(modelUpdate.element.optionalField1).toBeNull();
			});

			test('updating value with undefined gets saved as null', async () => {
				const classes = initSchema(testSchema());

				const { Model } = classes as {
					Model: PersistentModelConstructor<Model>;
				};

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

				const [[_modelSave], [modelUpdate]] = zenNext.mock.calls;

				expect(modelUpdate.element.optionalField1).toBeNull();
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

				const [[_modelSave], [modelUpdate]] = zenNext.mock.calls;

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

				const [[_modelSave], [modelUpdate]] = zenNext.mock.calls;

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

				const [[_modelSave], [modelUpdate]] = zenNext.mock.calls;

				expect(modelUpdate.element.dateCreated).toBeUndefined();
				expect(modelUpdate.element.field1).toEqual('Updated value');
				expect(modelUpdate.element.emails).toBeUndefined();
			});

			test('update with list unchanged', async () => {
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
						// same as above. should not result in mutation event
						draft.emails = ['john@doe.com', 'jane@doe.com'];
					})
				);

				const [[_modelSave], modelUpdate] = zenNext.mock.calls;

				expect(modelUpdate).toBeUndefined();
			});

			test('update by nulling list', async () => {
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
						draft.emails = null;
					})
				);

				const [[_modelSave], [modelUpdate]] = zenNext.mock.calls;

				expect(modelUpdate.element.emails).toBeNull();
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

				const [[_modelSave], [modelUpdate]] = zenNext.mock.calls;

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

				const [[_modelSave], [modelUpdate]] = zenNext.mock.calls;

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

				const [[_modelSave], [modelUpdate]] = zenNext.mock.calls;

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

			test('composite key', async () => {
				const classes = initSchema(testSchema());

				// model has 2 composite keys defined
				// @key(name: "titleSort", fields: ["title", "created", "sort"])
				// @key(name: "descSort", fields: ["description", "created", "sort"])

				// updating any of the fields that comprise the composite key should
				// include all of the other fields in that key

				// if a field is in multiple composite keys (e.g., sort above)
				// we should include all of the fields from all of the keys that
				// fields is part of (sort updated => sort, title, created, description are included)
				const { PostComposite } = classes as {
					PostComposite: PersistentModelConstructor<PostComposite>;
				};

				const createdTimestamp = String(Date.now());

				const post = await DataStore.save(
					new PostComposite({
						title: 'New Post',
						description: 'Desc',
						created: createdTimestamp,
						sort: 100,
					})
				);

				const updated1 = await DataStore.save(
					PostComposite.copyOf(post, updated => {
						updated.title = 'Updated';
					})
				);

				const updated2 = await DataStore.save(
					PostComposite.copyOf(updated1, updated => {
						updated.description = 'Updated Desc';
					})
				);

				await DataStore.save(
					PostComposite.copyOf(updated2, updated => {
						updated.sort = 101;
					})
				);

				const [
					[_post1Save],
					[postUpdate],
					[postUpdate2],
					[postUpdate3],
				] = zenNext.mock.calls;

				expect(postUpdate.element.title).toEqual('Updated');
				expect(postUpdate.element.created).toEqual(createdTimestamp);
				expect(postUpdate.element.sort).toEqual(100);
				expect(postUpdate.element.description).toBeUndefined();

				expect(postUpdate2.element.description).toEqual('Updated Desc');
				expect(postUpdate2.element.created).toEqual(createdTimestamp);
				expect(postUpdate2.element.sort).toEqual(100);
				expect(postUpdate2.element.title).toBeUndefined();

				expect(postUpdate3.element.created).toEqual(createdTimestamp);
				expect(postUpdate3.element.sort).toEqual(101);
				expect(postUpdate3.element.title).toEqual('Updated');
				expect(postUpdate3.element.description).toEqual('Updated Desc');
			});
		});
	});
});
