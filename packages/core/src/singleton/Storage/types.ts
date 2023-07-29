// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type StorageAccessLevel = 'guest' | 'protected' | 'private';

export interface StorageConfig {
	bucket?: string;
	region?: string;
	defaultAccessLevel?: StorageAccessLevel;
}

export type StoragePrefixResolver = (params: {
	level: StorageAccessLevel;
	identityId?: string;
}) => Promise<string>;

export interface LibraryStorageOptions {
	prefixResolver?: StoragePrefixResolver;
}
