/* eslint-disable unused-imports/no-unused-vars */

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AWSCredentials } from '@aws-amplify/core/internals/utils';

import { CredentialsLocation, LocationCredentialsHandler } from '../types';
import { assertValidationError } from '../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../errors/types/validation';

import {
	CacheKey,
	StoreInstance,
	createCacheKey,
	fetchNewValue,
	getCacheValue,
	initStore,
} from './store';

/**
 * Keep all cache records for all instances of credentials store in a singleton
 * so we can reliably de-reference from the memory when we destroy a store
 * instance.
 */
const storeRegistry = new Map<symbol, StoreInstance>();

export const createStore = (
	refreshHandler: LocationCredentialsHandler,
	size?: number,
) => {
	const storeInstanceSymbol = Symbol('LocationCredentialsStore');
	storeRegistry.set(storeInstanceSymbol, initStore(refreshHandler, size));

	return storeInstanceSymbol;
};

const getEquivalentCacheKeys = (key: CredentialsLocation): CacheKey[] => {
	const { scope, permission } = key;
	const cacheKeys = [createCacheKey(key)];
	if (permission !== 'READWRITE') {
		cacheKeys.push(createCacheKey({ scope, permission: 'READWRITE' }));
	}

	return cacheKeys;
};

const getCredentialsStore = (reference: symbol) => {
	assertValidationError(
		storeRegistry.has(reference),
		StorageValidationErrorCode.LocationCredentialsStoreDestroyed,
	);

	return storeRegistry.get(reference)!;
};

export const getValue = async (input: {
	storeReference: symbol;
	location: CredentialsLocation;
	forceRefresh: boolean;
}): Promise<{ credentials: AWSCredentials }> => {
	const { storeReference, location, forceRefresh } = input;
	const store = getCredentialsStore(storeReference);
	const equivalentCacheKeys = getEquivalentCacheKeys(location);
	if (!forceRefresh) {
		for (const cacheKey of equivalentCacheKeys) {
			const credentials = getCacheValue(store, cacheKey);
			if (credentials !== null) {
				return { credentials };
			}
		}
	}

	return fetchNewValue(store, createCacheKey(location));
};

export const removeStore = (storeReference: symbol) => {
	storeRegistry.delete(storeReference);
};
