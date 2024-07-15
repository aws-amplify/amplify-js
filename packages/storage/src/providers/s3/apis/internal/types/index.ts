// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LibraryOptions, StorageConfig } from '@aws-amplify/core';
import { AWSCredentials } from '@aws-amplify/core/internals/utils';

import { StorageOperationOptionsInput } from '../../../../../types/inputs';
import { CommonOptions } from '../../../types/options';

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
export interface S3InternalConfig extends S3ServiceOptions, S3LibraryOptions {
	credentialsProvider(): Promise<AWSCredentials>;
	identityIdProvider(): Promise<string>;
}

export type StorageCredentialsProvider = () => Promise<AWSCredentials>;
export type StorageIdentityIdProvider = () => Promise<string>;

/**
 * This interface is used to resolve the main options for the locationCredentialsProvider
 *
 * @internal
 */
export interface InternalStorageAPIConfig
	extends StorageOperationOptionsInput<
		CommonOptions & {
			bucket?: string;
			region?: string;
		}
	> {
	paths?: string[];
}
