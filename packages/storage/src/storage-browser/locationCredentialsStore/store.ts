/* eslint-disable unused-imports/no-unused-vars */

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AWSCredentials } from '@aws-amplify/core/internals/utils';

import { Permission } from '../../providers/s3/types/options';
import { CredentialsLocation, LocationCredentialsHandler } from '../types';

const CREDENTIALS_STORE_DEFAULT_SIZE = 10;

export interface StoreValue extends CredentialsLocation {
	credentials?: AWSCredentials;
	inflightCredentials?: Promise<{ credentials: AWSCredentials }>;
}

type S3Url = string;

/**
 * @internal
 */
export type CacheKey = `${S3Url}_${Permission}`;

/**
 * @internal
 */
export const getCacheKey = (compositeKey: CredentialsLocation): CacheKey =>
	`${compositeKey.scope}_${compositeKey.permission}`;

/**
 * LRU implementation for Location Credentials Store
 * O(n) for get and set for simplicity.
 *
 * @internal
 */
export interface LocationCredentialsStore {
	capacity: number;
	refreshHandler: LocationCredentialsHandler;
	values: Map<CacheKey, StoreValue>;
}

/**
 * @internal
 */
export const initStore = (
	refreshHandler: LocationCredentialsHandler,
	size = CREDENTIALS_STORE_DEFAULT_SIZE,
): LocationCredentialsStore => {
	// TODO(@AllanZhengYP) create StorageError
	if (size <= 0) {
		throw new Error('Invalid Cache size');
	}

	return {
		capacity: size,
		refreshHandler,
		values: new Map<CacheKey, StoreValue>(),
	};
};

export const getCacheValue = (
	store: LocationCredentialsStore,
	key: CacheKey,
): AWSCredentials | null => {
	throw new Error('Not implemented');
};
