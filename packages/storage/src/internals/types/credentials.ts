// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AWSTemporaryCredentials,
	LocationCredentialsProvider,
} from '../../providers/s3/types/options';

import { LocationType, Permission, StorageAccess } from './common';

/**
 * @internal
 */
export type CredentialsProvider = LocationCredentialsProvider;

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

/**
 * @internal
 */
export type ListLocations = (
	input?: ListLocationsInput,
) => Promise<ListLocationsOutput>;

/**
 * @internal
 */
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

/**
 * @internal
 */
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

/**
 * @internal
 */
export interface PathAccess {
	/** The Amplify backend mandates that all paths conclude with '/*',
	 * which means the only applicable type in this context is 'PREFIX'. */
	type: 'PREFIX';
	permission: StorageAccess[];
	bucket: string;
	prefix: string;
}

/**
 * @internal
 */
export interface ListPathsOutput {
	locations: PathAccess[];
}
