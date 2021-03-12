import 'fake-indexeddb/auto';
import {
	DataStore as DataStoreType,
	initSchema as initSchemaType,
} from '../src/datastore/datastore';
import { PersistentModelConstructor } from '../src/types';
import { Model, testSchema } from './helpers';

let initSchema: typeof initSchemaType;
let DataStore: typeof DataStoreType;

describe('Storage tests', () => {
	describe('Update', () => {
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

		test('Only include changed fields - scalar', async () => {
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

		test('Only include changed fields - list (destructured)', async () => {
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

		test('Only include changed fields - list (push)', async () => {
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

		test('Only include changed fields - custom type (destructured)', async () => {
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
			expect(modelUpdate.element.metadata).toMatchObject(expectedValueMetadata);
		});

		test('Only include changed fields - custom type (accessor)', async () => {
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
			expect(modelUpdate.element.metadata).toMatchObject(expectedValueMetadata);
		});
	});
});
