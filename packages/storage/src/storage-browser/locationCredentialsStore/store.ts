/* eslint-disable unused-imports/no-unused-vars */

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AWSCredentials } from '@aws-amplify/core/internals/utils';

import { Permission } from '../../providers/s3/types/options';
import { CredentialsLocation, LocationCredentialsHandler } from '../types';
import { assertValidationError } from '../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../errors/types/validation';

const CREDENTIALS_STORE_DEFAULT_SIZE = 10;
const CREDENTIALS_REFRESH_WINDOW_MS = 30_000;

export interface StoreValue extends CredentialsLocation {
	credentials?: AWSCredentials;
	inflightCredentials?: Promise<{ credentials: AWSCredentials }>;
}

type S3Url = string;

/**
 * @internal
 */
export interface CacheKey extends CredentialsLocation {
	hash: `${S3Url}_${Permission}`;
}

/**
 * @internal
 */
export const createCacheKey = (location: CredentialsLocation): CacheKey => ({
	...location,
	hash: `${location.scope}_${location.permission}`,
});

/**
 * LRU implementation for Location Credentials Store
 * O(n) for get and set for simplicity.
 *
 * @internal
 */
export interface StoreInstance {
	capacity: number;
	refreshHandler: LocationCredentialsHandler;
	values: Map<CacheKey['hash'], StoreValue>;
}

/**
 * @internal
 */
export const initStore = (
	refreshHandler: LocationCredentialsHandler,
	size = CREDENTIALS_STORE_DEFAULT_SIZE,
): StoreInstance => {
	assertValidationError(
		size > 0,
		StorageValidationErrorCode.InvalidLocationCredentialsCacheSize,
	);

	return {
		capacity: size,
		refreshHandler,
		values: new Map<CacheKey['hash'], StoreValue>(),
	};
};

export const getCacheValue = (
	store: StoreInstance,
	key: CacheKey,
): AWSCredentials | null => {
	const cachedValue = store.values.get(key.hash);
	const cachedCredentials = cachedValue?.credentials;
	if (!cachedCredentials) {
		return null;
	}

	// Delete and re-insert to key to map to indicate a latest reference in LRU.
	store.values.delete(key.hash);
	if (!pastTTL(cachedCredentials)) {
		// TODO(@AllanZhengYP): If the credential is still valid but will expire
		// soon, we should return credentials AND dispatch a refresh.
		store.values.set(key.hash, cachedValue);

		return cachedCredentials;
	}

	return null;
};

const pastTTL = (credentials: AWSCredentials) => {
	const { expiration } = credentials;

	return (
		expiration &&
		expiration.getTime() - CREDENTIALS_REFRESH_WINDOW_MS <= Date.now()
	);
};

/**
 * Fetch new credentials value with refresh handler and cache the result in
 * LRU cache.
 * @internal
 */
export const fetchNewValue = async (
	store: StoreInstance,
	key: CacheKey,
): Promise<{ credentials: AWSCredentials }> => {
	const storeValues = store.values;
	if (!storeValues.has(key.hash)) {
		const newStoreValue: StoreValue = {
			scope: key.scope,
			permission: key.permission,
		};
		setCacheRecord(store, key, newStoreValue);
	}
	const storeValue = storeValues.get(key.hash)!;

	return dispatchRefresh(store.refreshHandler, storeValue, () => {
		store.values.delete(key.hash);
	});
};

const dispatchRefresh = (
	refreshHandler: LocationCredentialsHandler,
	value: StoreValue,
	onRefreshFailure: () => void,
) => {
	if (value.inflightCredentials) {
		return value.inflightCredentials;
	}

	value.inflightCredentials = (async () => {
		try {
			const { credentials } = await refreshHandler({
				scope: value.scope,
				permission: value.permission,
			});
			value.credentials = credentials;

			return { credentials };
		} catch (e) {
			onRefreshFailure();
			throw e;
		} finally {
			value.inflightCredentials = undefined;
		}
	})();

	return value.inflightCredentials;
};

const setCacheRecord = (
	store: StoreInstance,
	key: CacheKey,
	value: StoreValue,
): void => {
	if (store.capacity === store.values.size) {
		// Pop least used entry. The Map's key are in insertion order.
		// So first key is the last recently inserted.
		const [oldestKey] = store.values.keys();
		store.values.delete(oldestKey);
	}
	// Add latest used value to the cache.
	store.values.set(key.hash, value);
};
