// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type StorageAccessLevel = 'guest' | 'protected' | 'private';

export interface StorageConfig {
	bucket?: string;
	region?: string;
}

type StoragePrefixResolver = (params: {
	level: StorageAccessLevel;
	identityId?: string;
}) => Promise<string>;

// TODO[AllanZhengYP]: support isObjectLockEnabled config to S3 plugin config
// TODO[AllanZhengYP]: need to finalize the decision whether to move defaultAccessLevel to StorageConfig
export interface LibraryStorageOptions {
	prefixResolver?: StoragePrefixResolver;
	defaultAccessLevel?: StorageAccessLevel;
}
