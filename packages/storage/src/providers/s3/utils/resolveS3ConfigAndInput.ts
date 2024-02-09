// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6, StorageAccessLevel } from '@aws-amplify/core';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../../errors/types/validation';
import { StorageError } from '../../../errors/StorageError';
import { DEFAULT_ACCESS_LEVEL, LOCAL_TESTING_S3_ENDPOINT } from './constants';
import { resolvePrefix as defaultPrefixResolver } from '../../../utils/resolvePrefix';
import { ResolvedS3Config } from '../types/options';

type S3ApiOptions = {
	accessLevel?: StorageAccessLevel;
	targetIdentityId?: string;
	useAccelerateEndpoint?: boolean;
};

type ResolvedS3ConfigAndInput = {
	s3Config: ResolvedS3Config;
	bucket: string;
	keyPrefix: string;
	isObjectLockEnabled?: boolean;
};

/**
 * resolve the common input options for S3 API handlers from Amplify configuration and library options.
 *
 * @param {AmplifyClassV6} amplify The Amplify instance.
 * @param {S3ApiOptions} apiOptions The input options for S3 provider.
 * @returns {Promise<ResolvedS3ConfigAndInput>} The resolved common input options for S3 API handlers.
 * @throws A {@link StorageError} with `error.name` from {@link StorageValidationErrorCode} indicating invalid
 *   configurations or Amplify library options.
 *
 * @internal
 */
export const resolveS3ConfigAndInput = async (
	amplify: AmplifyClassV6,
	apiOptions?: S3ApiOptions
): Promise<ResolvedS3ConfigAndInput> => {
	// identityId is always cached in memory if forceRefresh is not set. So we can safely make calls here.
	const { credentials, identityId } = await amplify.Auth.fetchAuthSession({
		forceRefresh: false,
	});
	assertValidationError(
		!!credentials,
		StorageValidationErrorCode.NoCredentials
	);
	assertValidationError(!!identityId, StorageValidationErrorCode.NoIdentityId);

	const { bucket, region, dangerouslyConnectToHttpEndpointForTesting } =
		amplify.getConfig()?.Storage?.S3 ?? {};
	assertValidationError(!!bucket, StorageValidationErrorCode.NoBucket);
	assertValidationError(!!region, StorageValidationErrorCode.NoRegion);

	const {
		defaultAccessLevel,
		prefixResolver = defaultPrefixResolver,
		isObjectLockEnabled,
	} = amplify.libraryOptions?.Storage?.S3 ?? {};

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
			credentials,
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
	};
};
