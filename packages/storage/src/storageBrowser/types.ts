// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AWSCredentials } from '@aws-amplify/core/internals/utils';

import {
	LocationCredentialsProvider,
	Permission,
} from '../providers/s3/types/options';

/**
 * @internal
 */
export type CredentialsProvider = (options?: {
	forceRefresh?: boolean;
}) => Promise<{ credentials: AWSCredentials }>;

/**
 * @internal
 */
export type LocationType = 'BUCKET' | 'PREFIX' | 'OBJECT';

export interface CredentialsLocation {
	/**
	 * Scope of storage location. For S3 service, it's the S3 path of the data to
	 * which the access is granted. It can be in following formats:
	 *
	 * @example Bucket 's3://<bucket>/*'
	 * @example Prefix 's3://<bucket>/<prefix-with-path>*'
	 * @example Object 's3://<bucket>/<prefix-with-path>/<object>'
	 */
	readonly scope: string;
	/**
	 * The type of access granted to your Storage data. Can be either of READ,
	 * WRITE or READWRITE
	 */
	readonly permission: Permission;
}

/**
 * @internal
 */
export interface LocationAccess extends CredentialsLocation {
	/**
	 * Parse location type parsed from scope format:
	 * * BUCKET: `'s3://<bucket>/*'`
	 * * PREFIX: `'s3://<bucket>/<prefix-with-path>*'`
	 * * OBJECT: `'s3://<bucket>/<prefix-with-path>/<object>'`
	 */
	readonly type: LocationType;
}

export interface AccessGrant extends LocationAccess {
	/**
	 * The Amazon Resource Name (ARN) of an AWS IAM Identity Center application
	 * associated with your Identity Center instance. If the grant includes an
	 * application ARN, the grantee can only access the S3 data through this
	 * application.
	 */
	readonly applicationArn: string | undefined;
}

/**
 * @internal
 */
export interface ListLocationsOutput<T extends LocationAccess> {
	locations: T[];
	nextToken?: string;
}

/**
 * @internal
 */
export interface ListLocationsInput {
	pageSize?: number;
	nextToken?: string;
}

export type ListLocations = (
	input?: ListLocationsInput,
) => Promise<ListLocationsOutput<LocationAccess>>;

export type GetLocationCredentials = (
	input: CredentialsLocation,
) => Promise<{ credentials: AWSCredentials }>;

export interface LocationCredentialsStore {
	/**
	 * Get location-specific credentials. It uses a cache internally to optimize performance when
	 * getting credentials for the same location. It will refresh credentials if they expire or
	 * when forced to.
	 */
	getProvider(option: CredentialsLocation): LocationCredentialsProvider;
	/**
	 * Invalidate cached credentials and force subsequent calls to get location-specific
	 * credentials to throw. It also makes subsequent calls to `getCredentialsProviderForLocation`
	 * to throw.
	 */
	destroy(): void;
}

/**
 * Common interface for handlers to configure StorageBrowser behaviors
 *
 * @internal
 */
export interface StorageBrowserConfigAdapter {
	listLocations: ListLocations;
	getLocationCredentials: GetLocationCredentials;
	region: string;
}
