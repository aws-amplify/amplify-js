// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AtLeastOne } from '../types';

/** @deprecated This may be removed in the next major version. */
export type StorageAccessLevel = 'guest' | 'protected' | 'private';

export interface S3ProviderConfig {
	S3: {
		bucket?: string;
		region?: string;
		/**
		 * Internal-only configuration for testing purpose. You should not use this.
		 *
		 * @internal
		 */
		dangerouslyConnectToHttpEndpointForTesting?: string;
	};
}

export type StorageConfig = AtLeastOne<S3ProviderConfig>;

/** @deprecated This may be removed in the next major version. */
type StoragePrefixResolver = (params: {
	accessLevel: StorageAccessLevel;
	targetIdentityId?: string;
}) => Promise<string>;

export interface LibraryStorageOptions {
	S3: {
		/**
		 * @deprecated This may be removed in the next major version.
		 * This is currently used for Storage API signature using key as input parameter.
		 * */
		prefixResolver?: StoragePrefixResolver;
		/**
		 * @deprecated This may be removed in the next major version.
		 * This is currently used for Storage API signature using key as input parameter.
		 * */
		defaultAccessLevel?: StorageAccessLevel;
		isObjectLockEnabled?: boolean;
	};
}
