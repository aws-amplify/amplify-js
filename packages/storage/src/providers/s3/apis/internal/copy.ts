// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import { CopyInput, CopyOutput } from '../../types';
import { resolveS3ConfigAndInput } from '../../utils';
import { StorageValidationErrorCode } from '../../../../errors/types/validation';
import { assertValidationError } from '../../../../errors/utils/assertValidationError';
import { copyObject } from '../../utils/client';

export const copy = async (
	amplify: AmplifyClassV6,
	input: CopyInput
): Promise<CopyOutput> => {
	const {
		source: { key: sourceKey },
		destination: { key: destinationKey },
	} = input;

	assertValidationError(!!sourceKey, StorageValidationErrorCode.NoSourceKey);
	assertValidationError(
		!!destinationKey,
		StorageValidationErrorCode.NoDestinationKey
	);

	const {
		s3Config,
		bucket,
		keyPrefix: sourceKeyPrefix,
	} = await resolveS3ConfigAndInput(amplify, input.source);
	const { keyPrefix: destinationKeyPrefix } = await resolveS3ConfigAndInput(
		amplify,
		input.destination
	); // resolveS3ConfigAndInput does not make extra API calls or storage access if called repeatedly.

	// TODO(ashwinkumar6) V6-logger: warn `You may copy files from another user if the source level is "protected", currently it's ${srcLevel}`
	// TODO(ashwinkumar6) V6-logger: debug `copying ${finalSrcKey} to ${finalDestKey}`
	await copyObject(s3Config, {
		Bucket: bucket,
		CopySource: `${bucket}/${sourceKeyPrefix}${sourceKey}`,
		Key: `${destinationKeyPrefix}${destinationKey}`,
		MetadataDirective: 'COPY', // Copies over metadata like contentType as well
	});

	return {
		key: destinationKey,
	};
};
