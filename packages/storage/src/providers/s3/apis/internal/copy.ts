// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import { S3CopyResult } from '../../types';
import { CopyRequest } from '../../../../types';
import {
	resolveStorageConfig,
	getKeyWithPrefix,
	resolveCredentials,
} from '../../utils';
import { StorageValidationErrorCode } from '../../../../errors/types/validation';
import { assertValidationError } from '../../../../errors/utils/assertValidationError';
import { copyObject } from '../../utils/client';

export const copy = async (
	amplify: AmplifyClassV6,
	copyRequest: CopyRequest
): Promise<S3CopyResult> => {
	const { identityId: defaultIdentityId, credentials } =
		await resolveCredentials(amplify);
	const { defaultAccessLevel, bucket, region } = resolveStorageConfig(amplify);
	const {
		source: {
			key: sourceKey,
			accessLevel: sourceAccessLevel = defaultAccessLevel,
		},
		destination: {
			key: destinationKey,
			accessLevel: destinationAccessLevel = defaultAccessLevel,
		},
	} = copyRequest;

	assertValidationError(!!sourceKey, StorageValidationErrorCode.NoSourceKey);
	assertValidationError(
		!!destinationKey,
		StorageValidationErrorCode.NoDestinationKey
	);

	const sourceFinalKey = `${bucket}/${getKeyWithPrefix(amplify, {
		accessLevel: sourceAccessLevel,
		targetIdentityId:
			copyRequest.source.accessLevel === 'protected'
				? copyRequest.source.targetIdentityId
				: defaultIdentityId,
		key: sourceKey,
	})}`;

	const destinationFinalKey = getKeyWithPrefix(amplify, {
		accessLevel: destinationAccessLevel,
		targetIdentityId: defaultIdentityId,
		key: destinationKey,
	});

	// TODO(ashwinkumar6) V6-logger: warn `You may copy files from another user if the source level is "protected", currently it's ${srcLevel}`
	// TODO(ashwinkumar6) V6-logger: debug `copying ${finalSrcKey} to ${finalDestKey}`
	await copyObject(
		{
			region,
			credentials,
		},
		{
			Bucket: bucket,
			CopySource: sourceFinalKey,
			Key: destinationFinalKey,
			MetadataDirective: 'COPY', // Copies over metadata like contentType as well
		}
	);

	return {
		key: destinationKey,
	};
};
