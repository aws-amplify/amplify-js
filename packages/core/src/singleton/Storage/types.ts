// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AtLeastOne } from '../types';

export type StorageAccessLevel = 'guest' | 'protected' | 'private';

export type S3ProviderConfig = {
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
};

export type StorageConfig = AtLeastOne<S3ProviderConfig>;

type StoragePrefixResolver = (params: {
	accessLevel: StorageAccessLevel;
	targetIdentityId?: string;
}) => Promise<string>;

export interface LibraryStorageOptions {
	S3: {
		prefixResolver?: StoragePrefixResolver;
		defaultAccessLevel?: StorageAccessLevel;
		isObjectLockEnabled?: boolean;
	};
}
