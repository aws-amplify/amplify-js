// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AWSCredentials } from '@aws-amplify/core/internals/utils';

import {
  SubLocation,
  LocationCredentialsProvider,
  Permission,
} from '../providers/s3/types/options';

/**
 * @internal
 */
export type CredentialsProvider = (options?: {
  forceRefresh?: boolean;
}) => Promise<{ credentials: AWSCredentials }>;

interface BucketLocation {
	type: 'BUCKET';
	bucket: string;
}

type Locations = BucketLocation | SubLocation;

/**
 * @internal
 */
export type LocationAccess = Locations & {
  /**
   * The type of access granted to your Storage data. Can be either of READ,
   * WRITE or READWRITE
   */
  readonly permission: Permission;
}

export type AccessGrant = LocationAccess & {
  /**
   * The Amazon Resource Name (ARN) of an AWS IAM Identity Center application
   * associated with your Identity Center instance. If the grant includes an
   * application ARN, the grantee can only access the S3 data through this
   * application.
   */
  readonly applicationArn?: string;
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
export type LocationCredentialsHandler = (
  input: LocationAccess,
) => Promise<{ credentials: AWSCredentials }>;

export interface LocationCredentialsStore {
  /**
   * Get location-specific credentials. It uses a cache internally to optimize performance when
   * getting credentials for the same location. It will refresh credentials if they expire or
   * when forced to.
   */
  getProvider(option: LocationAccess): LocationCredentialsProvider;
  /**
   * Invalidate cached credentials and force subsequent calls to get location-specific
   * credentials to throw. It also makes subsequent calls to `getCredentialsProviderForLocation`
   * to throw.
   */
  destroy(): void;
}

const listLocations: ListLocations = async () => ({
  locations: [
    {
      permission: 'READ',
      bucket: 'bucket',
      path: 'path',
      type: 'PREFIX',
    },
    {
      permission: 'READ',
      bucket: 'bucket',
      path: 'file',
      type: 'OBJECT',
    },
  ],
});

const getLocationCredentials: LocationCredentialsHandler = async input => {
  if (
		input.type === 'PREFIX' &&
    input.bucket === 'bucket' &&
    input.path === 'path' &&
    input.permission === 'READ'
  ) {
    return {
      credentials:
        'Temp credentials to read `s3://bucket/path*`' as any as AWSCredentials,
    };
  } else if (
		input.type === 'OBJECT' &&
    input.bucket === 'bucket' &&
    input.path === 'file' &&
    input.permission === 'READ'
  ) {
    return {
      credentials:
        'Temp credentials to read `s3://bucket/file`' as any as AWSCredentials,
    };
  } else throw new Error('');
};
