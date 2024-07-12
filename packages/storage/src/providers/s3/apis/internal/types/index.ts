// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LibraryOptions, StorageConfig } from '@aws-amplify/core';
import { AWSCredentials } from '@aws-amplify/core/internals/utils';

/**
 * Internal S3 service options.
 *
 * @internal
 */
export type S3ServiceOptions = StorageConfig['S3'];

/**
 * Internal S3 library options.
 *
 * @internal
 */
type S3LibraryOptions = NonNullable<LibraryOptions['Storage']>['S3'];

/**
 * S3 storage config input
 *
 * @internal
 */
export interface S3InternalConfig {
	serviceOptions: S3ServiceOptions;
	libraryOptions: S3LibraryOptions;
	credentialsProvider(): Promise<AWSCredentials>;
	identityIdProvider(): Promise<string>;
}
