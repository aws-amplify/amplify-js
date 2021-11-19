import 'fake-indexeddb/auto';
import {
	initSchema as initSchemaType,
	syncClasses,
	ModelInstanceCreator,
} from '../src/datastore/datastore';
import { ExclusiveStorage as StorageType } from '../src/storage/storage';
import { MutationEventOutbox } from '../src/sync/outbox';
import { ModelMerger } from '../src/sync/merger';
import { Model as ModelType, testSchema, internalTestSchema } from './helpers';
import {
	TransformerMutationType,
	createMutationInstanceFromModelOperation,
} from '../src/sync/utils';
import {
	PersistentModelConstructor,
	InternalSchema,
	SchemaModel,
} from '../src/types';
import { MutationEvent } from '../src/sync/';

let initSchema: typeof initSchemaType;
// using <any> to access private members
let DataStore: any;
let Storage: StorageType;
let anyStorage: any;
let outbox: MutationEventOutbox;
let merger: ModelMerger;
let modelInstanceCreator: ModelInstanceCreator;
let Model: PersistentModelConstructor<ModelType>;

const schema: InternalSchema = internalTestSchema();

describe('Outbox tests', () => {
	let modelId: string;

	beforeAll(async () => {
		jest.resetAllMocks();

		await instantiateOutbox();

		const newModel = new Model({
			field1: 'Some value',
			dateCreated: new Date().toISOString(),
		});

		const mutationEvent = await createMutationEvent(newModel);
		({ modelId } = mutationEvent);

		await outbox.enqueue(Storage, mutationEvent);
	});

	it('Should return the create mutation from Outbox.peek', async () => {
		await Storage.runExclusive(async (s) => {
			let head;

			while (!head) {
				head = await outbox.peek(s);
			}

			const modelData: ModelType = JSON.parse(head.data);

			expect(head.modelId).toEqual(modelId);
			expect(head.operation).toEqual(TransformerMutationType.CREATE);
			expect(modelData.field1).toEqual('Some value');

			const response = {
				...modelData,
				_version: 1,
				_lastChangedAt: Date.now(),
				_deleted: false,
			};

			await processMutationResponse(
				s,
				response,
				TransformerMutationType.CREATE
			);

			head = await outbox.peek(s);
			expect(head).toBeFalsy();
		});
	});

	it('Should sync the _version from a mutation response to other items with the same `id` in the queue', async () => {
		const last = await DataStore.query(Model, modelId);

		const updatedModel1 = Model.copyOf(last, (updated) => {
			updated.field1 = 'another value';
			updated.dateCreated = new Date().toISOString();
		});

		const mutationEvent = await createMutationEvent(updatedModel1);
		await outbox.enqueue(Storage, mutationEvent);

		await Storage.runExclusive(async (s) => {
			// this mutation is now "in progress"
			let head;

			while (!head) {
				head = await outbox.peek(s);
			}
			const modelData: ModelType = JSON.parse(head.data);

			expect(head.modelId).toEqual(modelId);
			expect(head.operation).toEqual(TransformerMutationType.UPDATE);
			expect(modelData.field1).toEqual('another value');

			const mutationsForModel = await outbox.getForModel(s, last);
			expect(mutationsForModel.length).toEqual(1);
		});

		// add 2 update mutations to the queue:
		const updatedModel2 = Model.copyOf(last, (updated) => {
			updated.field1 = 'another value2';
			updated.dateCreated = new Date().toISOString();
		});

		await outbox.enqueue(Storage, await createMutationEvent(updatedModel2));

		const updatedModel3 = Model.copyOf(last, (updated) => {
			updated.field1 = 'another value3';
			updated.dateCreated = new Date().toISOString();
		});

		await outbox.enqueue(Storage, await createMutationEvent(updatedModel3));

		// model2 should get deleted when model3 is enqueued, so we're expecting to see
		// 2 items in the queue for this Model total (including the in progress record - updatedModel1)
		const mutationsForModel = await outbox.getForModel(Storage, last);
		expect(mutationsForModel.length).toEqual(2);

		const [_inProgress, nextMutation] = mutationsForModel;
		const modelData: ModelType = JSON.parse(nextMutation.data);

		// and the next item in the queue should be updatedModel3
		expect(modelData.field1).toEqual('another value3');

		// response from AppSync for the first update mutation - updatedModel1:
		const response = {
			...updatedModel1,
			_version: (updatedModel1 as any)._version + 1, // increment version like we would expect coming back from AppSync
			_lastChangedAt: Date.now(),
			_deleted: false,
			createdAt: '2021-11-30T20:51:00.250Z',
			updatedAt: '2021-11-30T20:52:00.250Z',
		};

		await Storage.runExclusive(async (s) => {
			// process mutation response, which dequeues updatedModel1
			// and syncs its version to the remaining item in the mutation queue
			await processMutationResponse(
				s,
				response,
				TransformerMutationType.UPDATE
			);

			const inProgress = await outbox.peek(s);
			const inProgressData = JSON.parse(inProgress.data);
			// updatedModel3 should now be in progress with the _version from the mutation response

			expect(inProgressData.field1).toEqual('another value3');
			expect(inProgressData._version).toEqual(2);

			// response from AppSync for the second update mutation - updatedModel3:
			const response2 = {
				...updatedModel3,
				_version: inProgressData._version + 1, // increment version like we would expect coming back from AppSync
				_lastChangedAt: Date.now(),
				_deleted: false,
				createdAt: '2021-11-30T20:51:00.250Z',
				updatedAt: '2021-11-30T20:52:00.250Z',
			};

			await processMutationResponse(
				s,
				response2,
				TransformerMutationType.UPDATE
			);

			const head = await outbox.peek(s);
			expect(head).toBeFalsy();
		});
	});

	it('Should NOT sync the _version from a handled conflict mutation response', async () => {
		const last = await DataStore.query(Model, modelId);

		const updatedModel1 = Model.copyOf(last, (updated) => {
			updated.field1 = 'another value';
			updated.dateCreated = new Date().toISOString();
		});

		const mutationEvent = await createMutationEvent(updatedModel1);
		await outbox.enqueue(Storage, mutationEvent);

		await Storage.runExclusive(async (s) => {
			// this mutation is now "in progress"
			let head;

			while (!head) {
				head = await outbox.peek(s);
			}
			const modelData: ModelType = JSON.parse(head.data);

			expect(head.modelId).toEqual(modelId);
			expect(head.operation).toEqual(TransformerMutationType.UPDATE);
			expect(modelData.field1).toEqual('another value');

			const mutationsForModel = await outbox.getForModel(s, last);
			expect(mutationsForModel.length).toEqual(1);
		});

		// add an update mutations to the queue:
		const updatedModel2 = Model.copyOf(last, (updated) => {
			updated.field1 = 'another value2';
			updated.dateCreated = new Date().toISOString();
		});

		await outbox.enqueue(Storage, await createMutationEvent(updatedModel2));

		// 2 items in the queue for this Model total (including the in progress record - updatedModel1)
		const mutationsForModel = await outbox.getForModel(Storage, last);
		expect(mutationsForModel.length).toEqual(2);

		const [_inProgress, nextMutation] = mutationsForModel;
		const modelData: ModelType = JSON.parse(nextMutation.data);

		// and the next item in the queue should be updatedModel2
		expect(modelData.field1).toEqual('another value2');

		// response from AppSync with a handled conflict:
		const response = {
			...updatedModel1,
			field1: 'a different value set by another client',
			_version: (updatedModel1 as any)._version + 1, // increment version like we would expect coming back from AppSync
			_lastChangedAt: Date.now(),
			_deleted: false,
		};

		await Storage.runExclusive(async (s) => {
			// process mutation response, which dequeues updatedModel1
			// but SHOULD NOT sync the _version, since the data in the response is different
			await processMutationResponse(
				s,
				response,
				TransformerMutationType.UPDATE
			);

			const inProgress = await outbox.peek(s);
			const inProgressData = JSON.parse(inProgress.data);

			// updatedModel2 should now be in progress with the _version from the mutation response
			expect(inProgressData.field1).toEqual('another value2');

			const oldVersion = (modelData as any)._version;

			expect(inProgressData._version).toEqual(oldVersion);

			// same response as above,
			await processMutationResponse(
				s,
				response,
				TransformerMutationType.UPDATE
			);

			const head = await outbox.peek(s);
			expect(head).toBeFalsy();
		});
	});

	// https://github.com/aws-amplify/amplify-js/issues/7888
	it('Should retain the fields from the create mutation in the queue when it gets merged with an enqueued update mutation', async () => {
		const field1 = 'Some value';
		const currentTimestamp = new Date().toISOString();
		const optionalField1 = 'Optional value';

		const newModel = new Model({
			field1,
			dateCreated: currentTimestamp,
		});

		const mutationEvent = await createMutationEvent(newModel);
		({ modelId } = mutationEvent);

		await outbox.enqueue(Storage, mutationEvent);

		const updatedModel = Model.copyOf(newModel, (updated) => {
			updated.optionalField1 = optionalField1;
		});

		const updateMutationEvent = await createMutationEvent(updatedModel);

		await outbox.enqueue(Storage, updateMutationEvent);

		await Storage.runExclusive(async (s) => {
			const head = await outbox.peek(s);
			const headData = JSON.parse(head.data);

			expect(headData.field1).toEqual(field1);
			expect(headData.dateCreated).toEqual(currentTimestamp);
			expect(headData.optionalField1).toEqual(optionalField1);
		});
	});
});

// performs all the required dependency injection
// in order to have a functional Outbox without the Sync Engine
async function instantiateOutbox(): Promise<void> {
	({ initSchema, DataStore } = require('../src/datastore/datastore'));
	const classes = initSchema(testSchema());
	const ownSymbol = Symbol('sync');

	({ Model } = classes as {
		Model: PersistentModelConstructor<ModelType>;
	});

	const MutationEvent = syncClasses[
		'MutationEvent'
	] as PersistentModelConstructor<MutationEvent>;

	await DataStore.start();

	Storage = <StorageType>DataStore.storage;
	anyStorage = Storage;

	const namespaceResolver =
		anyStorage.storage.namespaceResolver.bind(anyStorage);

	({ modelInstanceCreator } = anyStorage.storage);

	const getModelDefinition = (
		modelConstructor: PersistentModelConstructor<any>
	): SchemaModel => {
		const namespaceName = namespaceResolver(modelConstructor);

		const modelDefinition =
			schema.namespaces[namespaceName].models[modelConstructor.name];

		return modelDefinition;
	};

	const userClasses = {};
	userClasses['Model'] = Model;

	outbox = new MutationEventOutbox(
		schema,
		MutationEvent,
		modelInstanceCreator,
		ownSymbol
	);
	merger = new ModelMerger(outbox, ownSymbol);
}

async function createMutationEvent(model): Promise<MutationEvent> {
	const [[originalElement, opType]] = await anyStorage.storage.save(model);

	const MutationEventConstructor = syncClasses[
		'MutationEvent'
	] as PersistentModelConstructor<MutationEvent>;

	const modelConstructor = (Object.getPrototypeOf(originalElement) as Object)
		.constructor as PersistentModelConstructor<any>;

	return createMutationInstanceFromModelOperation(
		undefined,
		undefined,
		opType,
		modelConstructor,
		originalElement,
		{},
		MutationEventConstructor,
		modelInstanceCreator
	);
}

async function processMutationResponse(
	storage,
	record,
	recordOp
): Promise<void> {
	await outbox.dequeue(storage, record, recordOp);

	const modelConstructor = Model as unknown as PersistentModelConstructor<any>;
	const model = modelInstanceCreator(modelConstructor, record);

	await merger.merge(storage, model);
}
