// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AWSTemporaryCredentials } from '../../providers/s3/types/options';
import {
	CredentialsLocation,
	GetLocationCredentials,
} from '../types/credentials';
import { assertValidationError } from '../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../errors/types/validation';

import {
	LruLocationCredentialsStore,
	fetchNewValue,
	getCacheValue,
	initStore,
} from './store';

interface StoreRegistrySymbol {
	readonly value: symbol;
}

/**
 * Keep all cache records for all instances of credentials store in a singleton
 * so we can reliably de-reference from the memory when we destroy a store
 * instance.
 */
const storeRegistry = new WeakMap<
	StoreRegistrySymbol,
	LruLocationCredentialsStore
>();

/**
 * @internal
 */
export const createStore = (
	refreshHandler: GetLocationCredentials,
	size?: number,
) => {
	const storeSymbol = { value: Symbol('LocationCredentialsStore') };
	storeRegistry.set(storeSymbol, initStore(refreshHandler, size));

	return storeSymbol;
};

const getLookUpLocations = (location: CredentialsLocation) => {
	const { scope, permission } = location;
	const locations = [{ scope, permission }];
	if (permission === 'READ' || permission === 'WRITE') {
		locations.push({ scope, permission: 'READWRITE' });
	}

	return locations;
};

const getCredentialsStore = (storeSymbol: StoreRegistrySymbol) => {
	assertValidationError(
		storeRegistry.has(storeSymbol),
		StorageValidationErrorCode.LocationCredentialsStoreDestroyed,
	);

	return storeRegistry.get(storeSymbol)!;
};

/**
 * @internal
 */
export const getValue = async (input: {
	storeSymbol: StoreRegistrySymbol;
	location: CredentialsLocation;
	forceRefresh: boolean;
}): Promise<{ credentials: AWSTemporaryCredentials }> => {
	const { storeSymbol: storeReference, location, forceRefresh } = input;
	const store = getCredentialsStore(storeReference);
	if (!forceRefresh) {
		const lookupLocations = getLookUpLocations(location);
		for (const lookupLocation of lookupLocations) {
			const credentials = getCacheValue(store, lookupLocation);
			if (credentials !== null) {
				return { credentials };
			}
		}
	}

	return fetchNewValue(store, location);
};

export const removeStore = (storeSymbol: StoreRegistrySymbol) => {
	storeRegistry.delete(storeSymbol);
};
