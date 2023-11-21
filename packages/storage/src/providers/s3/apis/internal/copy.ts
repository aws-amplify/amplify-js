// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import { StorageAction } from '@aws-amplify/core/internals/utils';
import { CopyInput, CopyOutput } from '~/src/providers/s3/types';
import { resolveS3ConfigAndInput } from '~/src/providers/s3/utils';
import { StorageValidationErrorCode } from '~/src/errors/types/validation';
import { assertValidationError } from '~/src/errors/utils/assertValidationError';
import { copyObject } from '~/src/providers/s3/utils/client';
import { getStorageUserAgentValue } from '~/src/providers/s3/utils/userAgent';
import { logger } from '~/src/utils';

export const copy = async (
	amplify: AmplifyClassV6,
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
	} = await resolveS3ConfigAndInput(amplify, input.source);
	const { keyPrefix: destinationKeyPrefix } = await resolveS3ConfigAndInput(
		amplify,
		input.destination,
	); // resolveS3ConfigAndInput does not make extra API calls or storage access if called repeatedly.

	// TODO(ashwinkumar6) V6-logger: warn `You may copy files from another user if the source level is "protected", currently it's ${srcLevel}`
	const finalCopySource = `${bucket}/${sourceKeyPrefix}${sourceKey}`;
	const finalCopyDestination = `${destinationKeyPrefix}${destinationKey}`;
	logger.debug(`copying "${finalCopySource}" to "${finalCopyDestination}".`);
	await copyObject(
		{
			...s3Config,
			userAgentValue: getStorageUserAgentValue(StorageAction.Copy),
		},
		{
			Bucket: bucket,
			CopySource: finalCopySource,
			Key: finalCopyDestination,
			MetadataDirective: 'COPY', // Copies over metadata like contentType as well
		},
	);

	return {
		key: destinationKey,
	};
};
