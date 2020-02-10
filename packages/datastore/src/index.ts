import { Amplify } from '@aws-amplify/core';
import { dataStore as DataStore, initSchema } from './datastore/datastore';
import { Predicates } from './predicates';

export * from './types';
export { DataStore, initSchema, Predicates };

const datastore = { configure: DataStore.configure, getModuleName };

function getModuleName() {
	return 'DataStore';
}

Amplify.register(datastore);
