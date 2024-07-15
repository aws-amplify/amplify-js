// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

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
import { copyObject } from '../../utils/client/s3data';
import { getStorageUserAgentValue } from '../../utils/userAgent';
import { logger } from '../../../../utils';

import { S3InternalConfig } from './types';

const isCopyInputWithPath = (
	input: CopyInput | CopyWithPathInput,
): input is CopyWithPathInput => isInputWithPath(input.source);

export const copy = async (
	config: S3InternalConfig,
	input: CopyInput | CopyWithPathInput,
): Promise<CopyOutput | CopyWithPathOutput> => {
	return isCopyInputWithPath(input)
		? copyWithPath(config, input)
		: copyWithKey(config, input);
};

export const copyV2 = async (
	config: S3InternalConfig,
	input: CopyInput | CopyWithPathInput,
): Promise<CopyOutput | CopyWithPathOutput> => {
	return isCopyInputWithPath(input)
		? copyWithPath(config, input)
		: copyWithKey(config, input);
};

const copyWithPath = async (
	config: S3InternalConfig,
	input: CopyWithPathInput,
): Promise<CopyWithPathOutput> => {
	const { source, destination } = input;

	const { s3Config, bucket, identityId } = await resolveS3ConfigAndInput({
		config,
	});

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

	const finalCopySource = `${bucket}/${sourcePath}`;
	const finalCopyDestination = destinationPath;
	logger.debug(`copying "${finalCopySource}" to "${finalCopyDestination}".`);

	await serviceCopy({
		source: finalCopySource,
		destination: finalCopyDestination,
		bucket,
		s3Config,
	});

	return { path: finalCopyDestination };
};

/** @deprecated Use {@link copyWithPath} instead. */
export const copyWithKey = async (
	config: S3InternalConfig,
	input: CopyInput,
): Promise<CopyOutput> => {
	const {
		source: { key: sourceKey },
		destination: { key: destinationKey },
	} = input;

	assertValidationError(!!sourceKey, StorageValidationErrorCode.NoSourceKey);
	assertValidationError(
		!!destinationKey,
		StorageValidationErrorCode.NoDestinationKey,
	);
	const {
		s3Config,
		bucket,
		keyPrefix: sourceKeyPrefix,
	} = await resolveS3ConfigAndInput({
		config,
		apiOptions: input.source,
	});
	const { keyPrefix: destinationKeyPrefix } = await resolveS3ConfigAndInput({
		config,
		apiOptions: input.destination,
	}); // resolveS3ConfigAndInput does not make extra API calls or storage access if called repeatedly.

	// TODO(ashwinkumar6) V6-logger: warn `You may copy files from another user if the source level is "protected", currently it's ${srcLevel}`
	const finalCopySource = `${bucket}/${sourceKeyPrefix}${sourceKey}`;
	const finalCopyDestination = `${destinationKeyPrefix}${destinationKey}`;
	logger.debug(`copying "${finalCopySource}" to "${finalCopyDestination}".`);

	await serviceCopy({
		source: finalCopySource,
		destination: finalCopyDestination,
		bucket,
		s3Config,
	});

	return {
		key: destinationKey,
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
