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
import { ResolvedS3Config } from '../../types/options';
import {
	isInputWithPath,
	resolveS3ConfigAndInput,
	validateStorageOperationInput,
} from '../../utils';
import { StorageValidationErrorCode } from '../../../../errors/types/validation';
import { assertValidationError } from '../../../../errors/utils/assertValidationError';
import { copyObject } from '../../utils/client';
import { getStorageUserAgentValue } from '../../utils/userAgent';
import { logger } from '../../../../utils';

const isCopyInputWithPath = (
	input: CopyInput | CopyWithPathInput,
): input is CopyWithPathInput => isInputWithPath(input.source);

export const copy = async (
	amplify: AmplifyClassV6,
	input: CopyInput | CopyWithPathInput,
): Promise<CopyOutput | CopyWithPathOutput> => {
	return isCopyInputWithPath(input)
		? copyWithPath(amplify, input)
		: copyWithKey(amplify, input);
};

const copyWithPath = async (
	amplify: AmplifyClassV6,
	input: CopyWithPathInput,
): Promise<CopyWithPathOutput> => {
	const { source, destination } = input;

	// Throw assertion error when either one of bucket options is empty
	assertValidationError(
		!!(source.options?.bucket && destination.options?.bucket) ||
			!!(!destination.options?.bucket && !source.options?.bucket),
		StorageValidationErrorCode.InvalidCopyOperationStorageBucket,
	);

	const { bucket: sourceBucket, identityId } = await resolveS3ConfigAndInput(
		amplify,
		input.source.options,
	);

	const { s3Config, bucket: destBucket } = await resolveS3ConfigAndInput(
		amplify,
		input.destination.options,
	);

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

	const finalCopySource = `${sourceBucket}/${sourcePath}`;
	const finalCopyDestination = destinationPath;
	logger.debug(`copying "${finalCopySource}" to "${finalCopyDestination}".`);

	await serviceCopy({
		source: finalCopySource,
		destination: finalCopyDestination,
		bucket: destBucket,
		s3Config,
	});

	return { path: finalCopyDestination };
};

/** @deprecated Use {@link copyWithPath} instead. */
export const copyWithKey = async (
	amplify: AmplifyClassV6,
	input: CopyInput,
): Promise<CopyOutput> => {
	const { source, destination } = input;

	// Throw assertion error when either one of bucket options is empty
	assertValidationError(
		!!(source.bucket && destination.bucket) ||
			!!(!destination.bucket && !source.bucket),
		StorageValidationErrorCode.InvalidCopyOperationStorageBucket,
	);

	assertValidationError(!!source.key, StorageValidationErrorCode.NoSourceKey);
	assertValidationError(
		!!destination.key,
		StorageValidationErrorCode.NoDestinationKey,
	);

	const { bucket: sourceBucket, keyPrefix: sourceKeyPrefix } =
		await resolveS3ConfigAndInput(amplify, input.source);

	const {
		s3Config,
		bucket: destBucket,
		keyPrefix: destinationKeyPrefix,
	} = await resolveS3ConfigAndInput(amplify, input.destination); // resolveS3ConfigAndInput does not make extra API calls or storage access if called repeatedly.

	// TODO(ashwinkumar6) V6-logger: warn `You may copy files from another user if the source level is "protected", currently it's ${srcLevel}`
	const finalCopySource = `${sourceBucket}/${sourceKeyPrefix}${source.key}`;
	const finalCopyDestination = `${destinationKeyPrefix}${destination.key}`;
	logger.debug(`copying "${finalCopySource}" to "${finalCopyDestination}".`);

	await serviceCopy({
		source: finalCopySource,
		destination: finalCopyDestination,
		bucket: destBucket,
		s3Config,
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
}: {
	source: string;
	destination: string;
	bucket: string;
	s3Config: ResolvedS3Config;
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
		},
	);
};
