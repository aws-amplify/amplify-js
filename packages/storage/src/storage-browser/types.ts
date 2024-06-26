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

type LocationAccessType = 'BUCKET' | 'PREFIX' | 'OBJECT';

/**
 * @internal
 */
export interface LocationAccess {
	/**
	 * Scope of storage location. For S3 service, it's the S3 path of the data to
	 * which the access is granted.
	 *
	 * @example 's3://MY-BUCKET-NAME/prefix/*'
	 */
	readonly scope: string;
	/**
	 * The type of access granted to your Storage data. Can be either of READ,
	 * WRITE or READWRITE
	 */
	readonly permission: Permission;
	/**
	 * parse location type parsed from scope format:
	 * * bucket: `'s3://<bucket>/*'`
	 * * prefix: `'s3://<bucket>/<prefix-with-path>*'`
	 * * object: `'s3://<bucket>/<prefix-with-path>/<object>'`
	 */
	readonly type: LocationAccessType;
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

// Interface for listLocations() handler
export type ListLocations = () => Promise<ListLocationsOutput<LocationAccess>>;

// Interface for getLocationCredentials() handler.
export type LocationCredentialsHandler = (input: {
	scope: string;
	permission: Permission;
}) => Promise<{ credentials: AWSCredentials; scope?: string }>;

export interface LocationCredentialsStore {
	/**
	 * Get location-specific credentials. It uses a cache internally to optimize performance when
	 * getting credentials for the same location. It will refresh credentials if they expire or
	 * when forced to.
	 *
	 * If specific credentials scope `option` is omitted, the store will attempt to resolve
	 * locations-specific credentials from the input bucket and full path.
	 */
	getProvider(option?: {
		scope: string;
		permission: Permission;
	}): LocationCredentialsProvider;
	/**
	 * Invalidate cached credentials and force subsequent calls to get location-specific
	 * credentials to throw. It also makes subsequent calls to `getCredentialsProviderForLocation`
	 * to throw.
	 */
	destroy(): void;
}
