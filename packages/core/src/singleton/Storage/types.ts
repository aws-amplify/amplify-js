// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type StorageAccessLevel = 'guest' | 'protected' | 'private';

export interface StorageConfig {
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
