// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6, fetchAuthSession } from '@aws-amplify/core';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../../errors/types/validation';
import { StorageError } from '../../../errors/StorageError';
import { DEFAULT_ACCESS_LEVEL, LOCAL_TESTING_S3_ENDPOINT } from './constants';
import { resolvePrefix as defaultPrefixResolver } from '../../../utils/resolvePrefix';
import { S3Options } from '../types';
import { ResolvedS3Config } from '../types/options';

type ResolvedS3ConfigAndInput = {
	s3Config: ResolvedS3Config;
	bucket: string;
	keyPrefix: string;
	isObjectLockEnabled?: boolean;
};

/**
 * resolve the common input options for S3 API handlers from Amplify configuration and library options.
 *
 * @param {S3Options} s3Options The input options for S3 provider.
 * @returns {Promise<ResolvedS3ConfigAndInput>} The resolved common input options for S3 API handlers.
 * @throws A {@link StorageError} with `error.name` from {@link StorageValidationErrorCode} indicating invalid
 *   configurations or Amplify library options.
 *
 * TODO: add config errors
 *
 * @internal
 */
export const resolveS3ConfigAndInput = async (
	s3Options?: S3Options
): Promise<ResolvedS3ConfigAndInput> => {
	// identityId is always cached in memory if forceRefresh is not set. So we can safely make calls here.
	const { credentials, identityId } = await fetchAuthSession({
		forceRefresh: false,
	});
	assertValidationError(
		!!credentials,
		StorageValidationErrorCode.NoCredentials
	);
	assertValidationError(!!identityId, StorageValidationErrorCode.NoIdentityId);

	const { bucket, region, dangerouslyConnectToHttpEndpointForTesting } =
		AmplifyV6.getConfig()?.Storage ?? {};
	assertValidationError(!!bucket, StorageValidationErrorCode.NoBucket);
	assertValidationError(!!region, StorageValidationErrorCode.NoRegion);

	const {
		defaultAccessLevel,
		prefixResolver = defaultPrefixResolver,
		isObjectLockEnabled,
	} = AmplifyV6.libraryOptions?.Storage?.AWSS3 ?? {};

	const keyPrefix = await prefixResolver({
		accessLevel:
			s3Options?.accessLevel ?? defaultAccessLevel ?? DEFAULT_ACCESS_LEVEL,
		// use conditional assign to make tsc happy because StorageOptions is a union type that may not have targetIdentityId
		targetIdentityId:
			s3Options?.accessLevel === 'protected'
				? s3Options?.targetIdentityId ?? identityId
				: identityId,
	});

	return {
		s3Config: {
			credentials,
			region,
			useAccelerateEndpoint: s3Options?.useAccelerateEndpoint,
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
	};
};
