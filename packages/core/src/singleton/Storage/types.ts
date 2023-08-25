// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type StorageAccessLevel = 'guest' | 'protected' | 'private';

export interface StorageConfig {
	bucket?: string;
	region?: string;
	dangerouslyConnectToHttpEndpointForTesting?: string;
}

type StoragePrefixResolver = (params: {
	accessLevel: StorageAccessLevel;
	targetIdentityId?: string;
}) => Promise<string>;

// TODO[AllanZhengYP]: need to finalize the decision whether to move defaultAccessLevel to StorageConfig
export interface LibraryStorageOptions {
	AWSS3: {
		prefixResolver?: StoragePrefixResolver;
		defaultAccessLevel?: StorageAccessLevel;
		isObjectLockEnabled?: boolean;
	};
}
