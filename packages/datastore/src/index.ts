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
export { Adapter } from './storage/adapter';

import * as util from './util';
export { util };

export * from './types';
