// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
export {
	DataStore,
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

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export const utils = {
	USER,
	traverseModel,
	validatePredicate,
	isNonModelConstructor,
	isModelConstructor,
};

export * from './types';

// chore: trigger v5-stable LTS release to complete partial publish (uuid-v11 RN fix, datastore). No functional change.
