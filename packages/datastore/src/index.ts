// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	USER,
	isModelConstructor,
	isNonModelConstructor,
	traverseModel,
	validatePredicate,
} from './util';

export {
	DataStore,
	DataStoreClass,
	initSchema,
	ModelInstanceCreator,
	// eslint-disable-next-line import/export
	AsyncCollection,
	AsyncItem,
} from './datastore/datastore';

export {
	Predicates,
	ModelPredicateCreator,
	ModelSortPredicateCreator,
} from './predicates';
export { Adapter as StorageAdapter } from './storage/adapter';

export { NAMESPACES } from './util';

export const utils = {
	USER,
	traverseModel,
	validatePredicate,
	isNonModelConstructor,
	isModelConstructor,
};

// eslint-disable-next-line import/export
export * from './types';
