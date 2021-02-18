import 'fake-indexeddb/auto';
import {
	DataStore as DataStoreType,
	initSchema as initSchemaType,
} from '../src/datastore/datastore';
import { ExclusiveStorage as StorageType } from '../src/storage/storage';

import { MutationEventOutbox } from '../src/sync/outbox';

import { Model, testSchema, internalTestSchema } from './helpers';

let initSchema: typeof initSchemaType;
// any in order to access private properties
let DataStore: any;
let Storage: typeof StorageType;
// let anyStorage: any;

let outbox: MutationEventOutbox;

import { PersistentModelConstructor } from '../src/types';

const ownSymbol = Symbol('sync');

const MutationEvent = {}['MutationEvent'] as PersistentModelConstructor<any>;

outbox = new MutationEventOutbox(
	internalTestSchema(),
	null,
	MutationEvent,
	ownSymbol
);

describe('Outbox tests', () => {
	beforeAll(async () => {
		({ initSchema, DataStore } = require('../src/datastore/datastore'));
		const classes = initSchema(testSchema());

		const { Model } = classes as {
			Model: PersistentModelConstructor<Model>;
		};

		await DataStore.start();

		Storage = <any>DataStore.storage;

		outbox = new MutationEventOutbox(
			internalTestSchema(),
			null,
			MutationEvent,
			ownSymbol
		);
	});

	test('blagh', () => {
		// outbox.enqueue(Storage, )
		expect(true).toBeTruthy();
	});
});

const data = {
	name: 'Title F - 16:22:17',
	id: 'c4e457de-cfa6-49e9-84c4-48e3338ace26',
	_version: 727,
	_lastChangedAt: 1613596937293,
	_deleted: null,
};

const mutationEvent = {
	condition: '{}',
	data: JSON.stringify(data),
	id: '01EYRTP6B2R7AKMS5BJ6BRJPJS',
	model: 'Todo',
	modelId: 'c4e457de-cfa6-49e9-84c4-48e3338ace26',
	operation: 'Update',
};

const response = {
	id: 'c4e457de-cfa6-49e9-84c4-48e3338ace26',
	name: 'Title Z - 16:29:51',
	_version: 747,
	_lastChangedAt: 1613597392344,
	_deleted: null,
};
