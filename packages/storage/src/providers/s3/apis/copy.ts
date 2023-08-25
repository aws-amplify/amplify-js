// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { S3Exception, S3CopyResult } from '../types';
import { CopyRequest } from '../../../types';
import {
	resolveStorageConfig,
	getKeyWithPrefix,
	resolveCredentials,
} from '../utils';
import { copyObject, CopyObjectOutput } from '../../../AwsClients/S3';
import { StorageValidationErrorCode } from '../../../errors/types/validation';
import { assertValidationError } from '../../../errors/utils/assertValidationError';

// TODO(ashwinkumar6) add unit test for copy API
/**
 * Copy an object from a source object to a new object within the same bucket. Can optionally copy files across
 * different level or identityId (if source object's level is 'protected').
 *
 * @async
 * @param {CopyRequest} copyRequest - The request object.
 * @return {Promise<S3CopyResult>} Promise resolves upon successful copy of the object.
 * @throws service: {@link S3Exception} - Thrown when checking for existence of the object
 * @throws validation: {@link StorageValidationErrorCode } - Thrown when
 * source or destination key are not defined.
 */
export const copy = async (copyRequest: CopyRequest): Promise<S3CopyResult> => {
	const { identityId: defaultIdentityId, credentials } =
		await resolveCredentials(Amplify);
	const { defaultAccessLevel, bucket, region } =
		resolveStorageConfig(Amplify);
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

	const sourceFinalKey = `${bucket}/${getKeyWithPrefix(Amplify, {
		accessLevel: sourceAccessLevel,
		targetIdentityId:
			copyRequest.source.accessLevel === 'protected'
				? copyRequest.source.targetIdentityId
				: defaultIdentityId,
		key: sourceKey,
	})}`;

	const destinationFinalKey = getKeyWithPrefix(Amplify, {
		accessLevel: destinationAccessLevel,
		targetIdentityId: defaultIdentityId,
		key: destinationKey,
	});

	// TODO(ashwinkumar6) V6-logger: warn `You may copy files from another user if the source level is "protected", currently it's ${srcLevel}`
	// TODO(ashwinkumar6) V6-logger: debug `copying ${finalSrcKey} to ${finalDestKey}`
	const response: CopyObjectOutput = await copyObject(
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
