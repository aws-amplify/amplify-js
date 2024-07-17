// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6, StorageAccessLevel } from '@aws-amplify/core';

import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../../errors/types/validation';
import { resolvePrefix as defaultPrefixResolver } from '../../../utils/resolvePrefix';
import {
	LocationCredentialsProvider,
	ResolvedS3Config,
} from '../types/options';
import {
	StorageCopyInputWithPath,
	StorageOperationInputWithKey,
	StorageOperationInputWithPath,
	StorageOperationInputWithPrefix,
} from '../../../types/inputs';
import { StorageError } from '../../../errors/StorageError';
import { CopyInput } from '../types';
import { INVALID_STORAGE_INPUT } from '../../../errors/constants';

import { DEFAULT_ACCESS_LEVEL, LOCAL_TESTING_S3_ENDPOINT } from './constants';

interface S3ApiOptions {
	accessLevel?: StorageAccessLevel;
	targetIdentityId?: string;
	useAccelerateEndpoint?: boolean;
	locationCredentialsProvider?: LocationCredentialsProvider;
}

interface ResolvedS3ConfigAndInput {
	s3Config: ResolvedS3Config;
	bucket: string;
	keyPrefix: string;
	isObjectLockEnabled?: boolean;
	identityId?: string;
}
export type DeprecatedStorageInput =
	| StorageOperationInputWithKey
	| StorageOperationInputWithPrefix
	| CopyInput;

export type CallbackPathStorageInput =
	| StorageOperationInputWithPath
	| StorageCopyInputWithPath;

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
export const resolveS3ConfigAndInput = async (
	amplify: AmplifyClassV6,
	apiOptions?: S3ApiOptions,
	input?: DeprecatedStorageInput | CallbackPathStorageInput,
): Promise<ResolvedS3ConfigAndInput> => {
	/**
	 * IdentityId is always cached in memory so we can safely make calls here. It
	 * should be stable even for unauthenticated users, regardless of credentials.
	 */
	const { identityId } = await amplify.Auth.fetchAuthSession();

	/**
	 * A credentials provider function instead of a static credentials object is
	 * used because the long-running tasks like multipart upload may span over the
	 * credentials expiry. Auth.fetchAuthSession() automatically refreshes the
	 * credentials if they are expired.
	 */
	const credentialsProvider = async () => {
		if (isLocationCredentialsProvider(apiOptions)) {
			assertStorageInput(input);
		}

		const { credentials } = isLocationCredentialsProvider(apiOptions)
			? await apiOptions.locationCredentialsProvider()
			: await amplify.Auth.fetchAuthSession();
		assertValidationError(
			!!credentials,
			StorageValidationErrorCode.NoCredentials,
		);

		return credentials;
	};

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
		identityId,
		isObjectLockEnabled,
	};
};

const isLocationCredentialsProvider = (
	options?: S3ApiOptions,
): options is S3ApiOptions & {
	locationCredentialsProvider: LocationCredentialsProvider;
} => {
	return !!options?.locationCredentialsProvider;
};

const isInputWithCallbackPath = (input?: CallbackPathStorageInput) => {
	return (
		((input as StorageOperationInputWithPath)?.path &&
			typeof (input as StorageOperationInputWithPath).path === 'function') ||
		((input as StorageCopyInputWithPath)?.destination?.path &&
			typeof (input as StorageCopyInputWithPath).destination?.path ===
				'function') ||
		((input as StorageCopyInputWithPath)?.source?.path &&
			typeof (input as StorageCopyInputWithPath).source?.path === 'function')
	);
};
const isDeprecatedInput = (
	input?: DeprecatedStorageInput | CallbackPathStorageInput,
): input is DeprecatedStorageInput => {
	return !!(
		(input as StorageOperationInputWithKey)?.key ||
		(input as StorageOperationInputWithPrefix)?.prefix ||
		(input as CopyInput)?.destination?.key ||
		(input as CopyInput)?.source?.key ||
		(input as CopyInput)?.destination?.accessLevel ||
		(input as CopyInput)?.source?.accessLevel
	);
};
const assertStorageInput = (
	input?: DeprecatedStorageInput | CallbackPathStorageInput,
) => {
	if (isDeprecatedInput(input) || isInputWithCallbackPath(input)) {
		throw new StorageError({
			name: INVALID_STORAGE_INPUT,
			message: 'The storage input needs to pass a string path.',
		});
	}
};
