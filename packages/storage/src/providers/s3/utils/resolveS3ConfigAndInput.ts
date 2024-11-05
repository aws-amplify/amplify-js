// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6, StorageAccessLevel } from '@aws-amplify/core';
import { CredentialsProviderOptions } from '@aws-amplify/core/internals/aws-client-utils';

import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../../errors/types/validation';
import { resolvePrefix as defaultPrefixResolver } from '../../../utils/resolvePrefix';
import {
	StorageOperationInputWithKey,
	StorageOperationInputWithPath,
	StorageOperationInputWithPrefix,
} from '../../../types/inputs';
import { StorageError } from '../../../errors/StorageError';
import { CopyInput, CopyWithPathInput } from '../types';
import { INVALID_STORAGE_INPUT } from '../../../errors/constants';
import {
	BucketInfo,
	LocationCredentialsProvider,
	ResolvedS3Config,
	StorageBucket,
} from '../types/options';

import { DEFAULT_ACCESS_LEVEL, LOCAL_TESTING_S3_ENDPOINT } from './constants';

interface S3ApiOptions {
	accessLevel?: StorageAccessLevel;
	targetIdentityId?: string;
	useAccelerateEndpoint?: boolean;
	locationCredentialsProvider?: LocationCredentialsProvider;
	customEndpoint?: string;
	bucket?: StorageBucket;
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
	| CopyWithPathInput;

type StorageInput = DeprecatedStorageInput | CallbackPathStorageInput;

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
	apiInput?: StorageInput & { options?: S3ApiOptions },
): Promise<ResolvedS3ConfigAndInput> => {
	const { options: apiOptions } = apiInput ?? {};
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
	 *
	 * The optional forceRefresh option is set when the S3 service returns expired
	 * tokens error in the previous API call attempt.
	 */
	const credentialsProvider = async (options?: CredentialsProviderOptions) => {
		if (isLocationCredentialsProvider(apiOptions)) {
			assertStorageInput(apiInput);
		}

		// TODO: forceRefresh option of fetchAuthSession would refresh both tokens and
		// AWS credentials. So we do not support forceRefreshing from the Auth until
		// we support refreshing only the credentials.
		const { credentials } = isLocationCredentialsProvider(apiOptions)
			? await apiOptions.locationCredentialsProvider(options)
			: await amplify.Auth.fetchAuthSession();
		assertValidationError(
			!!credentials,
			StorageValidationErrorCode.NoCredentials,
		);

		return credentials;
	};

	const {
		bucket: defaultBucket,
		region: defaultRegion,
		dangerouslyConnectToHttpEndpointForTesting,
		buckets,
	} = amplify.getConfig()?.Storage?.S3 ?? {};

	const { bucket = defaultBucket, region = defaultRegion } =
		(apiOptions?.bucket && resolveBucketConfig(apiOptions, buckets)) || {};

	assertValidationError(!!bucket, StorageValidationErrorCode.NoBucket);
	assertValidationError(!!region, StorageValidationErrorCode.NoRegion);

	const {
		defaultAccessLevel,
		prefixResolver = defaultPrefixResolver,
		isObjectLockEnabled,
	} = amplify.libraryOptions?.Storage?.S3 ?? {};

	const accessLevel =
		apiOptions?.accessLevel ?? defaultAccessLevel ?? DEFAULT_ACCESS_LEVEL;
	const targetIdentityId =
		accessLevel === 'protected'
			? (apiOptions?.targetIdentityId ?? identityId)
			: identityId;

	const keyPrefix = await prefixResolver({ accessLevel, targetIdentityId });

	return {
		s3Config: {
			credentials: credentialsProvider,
			region,
			useAccelerateEndpoint: apiOptions?.useAccelerateEndpoint,
			...(apiOptions?.customEndpoint
				? { customEndpoint: apiOptions.customEndpoint }
				: {}),
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
		((input as CopyWithPathInput)?.destination?.path &&
			typeof (input as CopyWithPathInput).destination?.path === 'function') ||
		((input as CopyWithPathInput)?.source?.path &&
			typeof (input as CopyWithPathInput).source?.path === 'function')
	);
};

const isDeprecatedInput = (
	input?: StorageInput,
): input is DeprecatedStorageInput => {
	return (
		isInputWithKey(input) ||
		isInputWithPrefix(input) ||
		isInputWithCopySourceOrDestination(input)
	);
};
const assertStorageInput = (input?: StorageInput) => {
	if (isDeprecatedInput(input) || isInputWithCallbackPath(input)) {
		throw new StorageError({
			name: INVALID_STORAGE_INPUT,
			message: 'The input needs to have a path as a string value.',
			recoverySuggestion:
				'Please provide a valid path as a string value for the input.',
		});
	}
};

const isInputWithKey = (
	input?: StorageInput,
): input is StorageOperationInputWithKey => {
	return !!(typeof (input as StorageOperationInputWithKey).key === 'string');
};
const isInputWithPrefix = (
	input?: StorageInput,
): input is StorageOperationInputWithPrefix => {
	return !!(
		typeof (input as StorageOperationInputWithPrefix).prefix === 'string'
	);
};
const isInputWithCopySourceOrDestination = (
	input?: StorageInput,
): input is CopyInput => {
	return !!(
		typeof (input as CopyInput).source?.key === 'string' ||
		typeof (input as CopyInput).destination?.key === 'string'
	);
};
const resolveBucketConfig = (
	apiOptions: S3ApiOptions,
	buckets: Record<string, BucketInfo> | undefined,
): { bucket: string; region: string } | undefined => {
	if (typeof apiOptions.bucket === 'string') {
		const bucketConfig = buckets?.[apiOptions.bucket];
		assertValidationError(
			!!bucketConfig,
			StorageValidationErrorCode.InvalidStorageBucket,
		);

		return { bucket: bucketConfig.bucketName, region: bucketConfig.region };
	}

	if (typeof apiOptions.bucket === 'object') {
		return {
			bucket: apiOptions.bucket.bucketName,
			region: apiOptions.bucket.region,
		};
	}
};
