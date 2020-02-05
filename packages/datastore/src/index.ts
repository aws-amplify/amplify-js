import Amplify from '@aws-amplify/core';
import { DataStore, initSchema } from './datastore/datastore';
import { Predicates } from './predicates';

export * from './types';
export { DataStore, initSchema, Predicates };

Amplify.register(DataStore);
