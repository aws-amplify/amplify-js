// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import { StorageAction } from '@aws-amplify/core/internals/utils';

import {
	CopyInput,
	CopyOutput,
	CopyWithPathInput,
	CopyWithPathOutput,
} from '../../types';
import { ResolvedS3Config, StorageBucket } from '../../types/options';
import {
	isInputWithPath,
	resolveS3ConfigAndInput,
	validateBucketOwnerID,
	validateStorageOperationInput,
} from '../../utils';
import { StorageValidationErrorCode } from '../../../../errors/types/validation';
import { assertValidationError } from '../../../../errors/utils/assertValidationError';
import { copyObject } from '../../utils/client/s3data';
import { getStorageUserAgentValue } from '../../utils/userAgent';
import { logger } from '../../../../utils';
// TODO: Remove this interface when we move to public advanced APIs.
import { CopyInput as CopyWithPathInputWithAdvancedOptions } from '../../../../internals';

const isCopyInputWithPath = (
	input: CopyInput | CopyWithPathInput,
): input is CopyWithPathInput => isInputWithPath(input.source);

const storageBucketAssertion = (
	sourceBucket?: StorageBucket,
	destBucket?: StorageBucket,
) => {
	/**  For multi-bucket, both source and destination bucket needs to be passed in
	 *   or both can be undefined and we fallback to singleton's default value
	 */
	assertValidationError(
		// Both src & dest bucket option is present is acceptable
		(sourceBucket !== undefined && destBucket !== undefined) ||
			// or both are undefined is also acceptable
			(!destBucket && !sourceBucket),
		StorageValidationErrorCode.InvalidCopyOperationStorageBucket,
	);
};

export const copy = async (
	amplify: AmplifyClassV6,
	input: CopyInput | CopyWithPathInputWithAdvancedOptions,
): Promise<CopyOutput | CopyWithPathOutput> => {
	return isCopyInputWithPath(input)
		? copyWithPath(amplify, input)
		: copyWithKey(amplify, input);
};

const copyWithPath = async (
	amplify: AmplifyClassV6,
	input: CopyWithPathInputWithAdvancedOptions,
): Promise<CopyWithPathOutput> => {
	const { source, destination } = input;

	storageBucketAssertion(source.bucket, destination.bucket);

	const { bucket: sourceBucket } = await resolveS3ConfigAndInput(amplify, {
		path: input.source.path,
		options: {
			locationCredentialsProvider: input.options?.locationCredentialsProvider,
			...input.source,
		},
	});

	// The bucket, region, credentials of s3 client are resolved from destination.
	// Whereas the source bucket and path are a input parameter of S3 copy operation.
	const {
		s3Config,
		bucket: destBucket,
		identityId,
	} = await resolveS3ConfigAndInput(amplify, {
		path: input.destination.path,
		options: {
			locationCredentialsProvider: input.options?.locationCredentialsProvider,
			customEndpoint: input.options?.customEndpoint,
			...input.destination,
		},
	}); // resolveS3ConfigAndInput does not make extra API calls or storage access if called repeatedly.

	assertValidationError(!!source.path, StorageValidationErrorCode.NoSourcePath);
	assertValidationError(
		!!destination.path,
		StorageValidationErrorCode.NoDestinationPath,
	);

	const { objectKey: sourcePath } = validateStorageOperationInput(
		source,
		identityId,
	);
	const { objectKey: destinationPath } = validateStorageOperationInput(
		destination,
		identityId,
	);
	validateBucketOwnerID(source.expectedBucketOwner);
	validateBucketOwnerID(destination.expectedBucketOwner);
	const finalCopySource = `${sourceBucket}/${sourcePath}`;
	const finalCopyDestination = destinationPath;
	logger.debug(`copying "${finalCopySource}" to "${finalCopyDestination}".`);

	await serviceCopy({
		source: finalCopySource,
		destination: finalCopyDestination,
		bucket: destBucket,
		s3Config,
		notModifiedSince: input.source.notModifiedSince,
		eTag: input.source.eTag,
		expectedSourceBucketOwner: input.source?.expectedBucketOwner,
		expectedBucketOwner: input.destination?.expectedBucketOwner,
	});

	return { path: finalCopyDestination };
};

/** @deprecated Use {@link copyWithPath} instead. */
export const copyWithKey = async (
	amplify: AmplifyClassV6,
	input: CopyInput,
): Promise<CopyOutput> => {
	const { source, destination } = input;

	storageBucketAssertion(source.bucket, destination.bucket);

	assertValidationError(!!source.key, StorageValidationErrorCode.NoSourceKey);
	assertValidationError(
		!!destination.key,
		StorageValidationErrorCode.NoDestinationKey,
	);
	validateBucketOwnerID(source.expectedBucketOwner);
	validateBucketOwnerID(destination.expectedBucketOwner);

	const { bucket: sourceBucket, keyPrefix: sourceKeyPrefix } =
		await resolveS3ConfigAndInput(amplify, {
			...input,
			options: {
				// @ts-expect-error: 'options' does not exist on type 'CopyInput'. In case of JS users set the location
				// credentials provider option, resolveS3ConfigAndInput will throw validation error.
				locationCredentialsProvider: input.options?.locationCredentialsProvider,
				...input.source,
			},
		});

	// The bucket, region, credentials of s3 client are resolved from destination.
	// Whereas the source bucket and path are a input parameter of S3 copy operation.
	const {
		s3Config,
		bucket: destBucket,
		keyPrefix: destinationKeyPrefix,
	} = await resolveS3ConfigAndInput(amplify, {
		...input,
		options: {
			// @ts-expect-error: 'options' does not exist on type 'CopyInput'. In case of JS users set the location
			// credentials provider option, resolveS3ConfigAndInput will throw validation error.
			locationCredentialsProvider: input.options?.locationCredentialsProvider,
			...input.destination,
		},
	}); // resolveS3ConfigAndInput does not make extra API calls or storage access if called repeatedly.

	// TODO(ashwinkumar6) V6-logger: warn `You may copy files from another user if the source level is "protected", currently it's ${srcLevel}`
	const finalCopySource = `${sourceBucket}/${sourceKeyPrefix}${source.key}`;
	const finalCopyDestination = `${destinationKeyPrefix}${destination.key}`;
	logger.debug(`copying "${finalCopySource}" to "${finalCopyDestination}".`);

	await serviceCopy({
		source: finalCopySource,
		destination: finalCopyDestination,
		bucket: destBucket,
		s3Config,
		notModifiedSince: input.source.notModifiedSince,
		eTag: input.source.eTag,
		expectedSourceBucketOwner: input.source?.expectedBucketOwner,
		expectedBucketOwner: input.destination?.expectedBucketOwner,
	});

	return {
		key: destination.key,
	};
};

const serviceCopy = async ({
	source,
	destination,
	bucket,
	s3Config,
	notModifiedSince,
	eTag,
	expectedSourceBucketOwner,
	expectedBucketOwner,
}: {
	source: string;
	destination: string;
	bucket: string;
	s3Config: ResolvedS3Config;
	notModifiedSince?: Date;
	eTag?: string;
	expectedSourceBucketOwner?: string;
	expectedBucketOwner?: string;
}) => {
	await copyObject(
		{
			...s3Config,
			userAgentValue: getStorageUserAgentValue(StorageAction.Copy),
		},
		{
			Bucket: bucket,
			CopySource: source,
			Key: destination,
			MetadataDirective: 'COPY', // Copies over metadata like contentType as well
			CopySourceIfMatch: eTag,
			CopySourceIfUnmodifiedSince: notModifiedSince,
			ExpectedSourceBucketOwner: expectedSourceBucketOwner,
			ExpectedBucketOwner: expectedBucketOwner,
		},
	);
};
