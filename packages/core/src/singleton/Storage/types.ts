// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AtLeastOne } from '../types';

/** @deprecated This may be removed in the next major version. */
export type StorageAccessLevel = 'guest' | 'protected' | 'private';

/** Information on bucket used to store files/objects */
export interface BucketInfo {
	/** Actual bucket name */
	bucketName: string;
	/** Region of the bucket */
	region: string;
	/** Paths to object with access permissions */
	paths?: Record<string, Record<string, string[] | undefined>>;
}
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
		/**
		 * Custom endpoint provider for S3-compatible services (e.g. MinIO, LocalStack).
		 * Called with bucket and region to resolve the endpoint URL.
		 */
		endpointProvider?(params: {
			bucket?: string;
			region?: string;
		}): string | Promise<string>;
		/**
		 * When true, uses path-style URLs (e.g. http://host/bucket/key)
		 * instead of virtual-hosted-style (e.g. http://bucket.host/key).
		 * Required for most S3-compatible services.
		 */
		forcePathStyle?: boolean;
		/** Map of friendly name for bucket to its information  */
		buckets?: Record<string, BucketInfo>;
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
