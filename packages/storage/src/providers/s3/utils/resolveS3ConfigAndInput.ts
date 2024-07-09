// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AWSCredentials } from '@aws-amplify/core/internals/utils';

import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../../errors/types/validation';
import { resolvePrefix as defaultPrefixResolver } from '../../../utils/resolvePrefix';
import {
	ResolvedS3Config,
	S3ApiOptions,
	S3LibraryOptions,
	S3ServiceOptions,
} from '../types/options';

import { DEFAULT_ACCESS_LEVEL, LOCAL_TESTING_S3_ENDPOINT } from './constants';

interface ResolvedS3ConfigAndInput {
	s3Config: ResolvedS3Config;
	bucket: string;
	keyPrefix: string;
	isObjectLockEnabled?: boolean;
	identityId?: string;
}

interface ResolveS3ConfigAndInputParams {
	credentialsProvider(): Promise<AWSCredentials>;
	identityIdProvider(): Promise<string>;
	serviceOptions?: S3ServiceOptions;
	libraryOptions?: S3LibraryOptions;
	apiOptions?: S3ApiOptions;
}
/**
 * resolve the common input options for S3 API handlers from Amplify configuration and library options.
 *
 * @param {AmplifyClassV6} amplify The Amplify instance.
 * @param {S3ApiOptions} apiOptions The input options for S3 provider.
 * @returns {Promise<ResolvedS3ConfigAndInput>} The resolved common input options for S3 API handlers.
 * @throws A `StorageError` with `error.name` from `StorageValidationErrorCode` indicating invalid
 *   configurations or Amplify library options.
 *
 * @internal
 */
export const resolveS3ConfigAndInput = async ({
	credentialsProvider,
	identityIdProvider,
	serviceOptions,
	libraryOptions,
	apiOptions,
}: ResolveS3ConfigAndInputParams): Promise<ResolvedS3ConfigAndInput> => {
	const { bucket, region, dangerouslyConnectToHttpEndpointForTesting } =
		serviceOptions ?? {};
	assertValidationError(!!bucket, StorageValidationErrorCode.NoBucket);
	assertValidationError(!!region, StorageValidationErrorCode.NoRegion);
	const identityId = await identityIdProvider();
	const {
		defaultAccessLevel,
		prefixResolver = defaultPrefixResolver,
		isObjectLockEnabled,
	} = libraryOptions ?? {};
	const keyPrefix = await prefixResolver({
		accessLevel:
			apiOptions?.accessLevel ?? defaultAccessLevel ?? DEFAULT_ACCESS_LEVEL,
		// use conditional assign to make tsc happy because StorageOptions is a union type that may not have targetIdentityId
		targetIdentityId:
			apiOptions?.accessLevel === 'protected'
				? apiOptions?.targetIdentityId ?? identityId
				: identityId,
	});

	return {
		s3Config: {
			credentials: credentialsProvider,
			region,
			useAccelerateEndpoint: apiOptions?.useAccelerateEndpoint,
			...(dangerouslyConnectToHttpEndpointForTesting
				? {
						customEndpoint: LOCAL_TESTING_S3_ENDPOINT,
						forcePathStyle: true,
					}
				: {}),
		},
		bucket,
		keyPrefix,
		isObjectLockEnabled,
		identityId,
	};
};
