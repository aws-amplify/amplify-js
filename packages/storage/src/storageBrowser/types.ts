// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AWSTemporaryCredentials,
	LocationCredentialsProvider,
} from '../providers/s3/types/options';

/**
 * @internal
 */
export type Permission = 'READ' | 'READWRITE' | 'WRITE';

/**
 * @internal
 */
export type CredentialsProvider = LocationCredentialsProvider;

/**
 * @internal
 */
export type LocationType = 'BUCKET' | 'PREFIX' | 'OBJECT';

/**
 * @internal
 */
export type Privilege = 'Default' | 'Minimal';

/**
 * @internal
 */
export type PrefixType = 'Object';

export interface LocationScope {
	/**
	 * Scope of storage location. For S3 service, it's the S3 path of the data to
	 * which the access is granted. It can be in following formats:
	 *
	 * @example Bucket 's3://<bucket>/*'
	 * @example Prefix 's3://<bucket>/<prefix-with-path>*'
	 * @example Object 's3://<bucket>/<prefix-with-path>/<object>'
	 */
	readonly scope: string;
}

export interface CredentialsLocation extends LocationScope {
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

export interface LocationCredentials extends Partial<LocationScope> {
	/**
	 * AWS credentials which can be used to access the specified location.
	 */
	readonly credentials: AWSTemporaryCredentials;
}

/**
 * @internal
 */
export interface ListLocationsInput {
	pageSize?: number;
	nextToken?: string;
}
/**
 * @internal
 */
export interface ListLocationsOutput {
	locations: LocationAccess[];
	nextToken?: string;
}

export type ListLocations = (
	input?: ListLocationsInput,
) => Promise<ListLocationsOutput>;

export type GetLocationCredentialsInput = CredentialsLocation;
export type GetLocationCredentialsOutput = LocationCredentials;

export type GetLocationCredentials = (
	input: GetLocationCredentialsInput,
) => Promise<GetLocationCredentialsOutput>;

export interface CreateLocationCredentialsStoreInput {
	handler: GetLocationCredentials;
}

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
