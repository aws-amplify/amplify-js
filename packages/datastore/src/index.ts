export {
	// DataStore,
	DataStoreConstructor,
	DataStoreClass,
	initSchema,
	ModelInstanceCreator,
	AsyncCollection,
	AsyncItem,
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

export { NAMESPACES } from './util';

export const utils = {
	USER,
	traverseModel,
	validatePredicate,
	isNonModelConstructor,
	isModelConstructor,
};

export { createSubscriptionProcessor as subscriptionsProcessor } from './sync/processors/subscription';

export * from './types';
