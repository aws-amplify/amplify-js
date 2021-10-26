export {
	DataStore,
	DataStoreClass,
	initSchema,
	ModelInstanceCreator,
} from './datastore/datastore';

export {
	Predicates,
	ModelPredicateCreator,
	ModelSortPredicateCreator,
} from './predicates';
export { Adapter as StorageAdapter } from './storage/adapter';

import {
	traverseModel,
	validatePredicate,
	USER,
	isNonModelConstructor,
	isModelConstructor,
} from './util';

export const utils = {
	USER,
	traverseModel,
	validatePredicate,
	isNonModelConstructor,
	isModelConstructor,
};

export * from './types';
