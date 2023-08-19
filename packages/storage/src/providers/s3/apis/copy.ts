// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { S3Exception, S3CopyResult } from '../types';
import { StorageCopyRequest, StorageCopyItem } from '../../../types';
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
 * @param {StorageCopyRequest} req - key of the object
 * @return {Promise<S3CopyResult>} The key of the copied object.
 * @throws service: {@link S3Exception} - S3 service errors thrown while getting properties
 * @throws validation: {@link StorageValidationErrorCode } - Validation errors thrown
 */
export const copy = async (
	req: StorageCopyRequest<StorageCopyItem>
): Promise<S3CopyResult> => {
	const { identityId: defaultIdentityId, credentials } =
		await resolveCredentials();
	const { defaultAccessLevel, bucket, region } = resolveStorageConfig();
	const {
		source: {
			key: sourceKey,
			accessLevel: sourceAccessLevel = defaultAccessLevel,
		},
		destination: {
			key: destinationKey,
			accessLevel: destinationAccessLevel = defaultAccessLevel,
		},
	} = req;

	assertValidationError(!!sourceKey, StorageValidationErrorCode.NoKey);
	assertValidationError(!!destinationKey, StorageValidationErrorCode.NoKey);

	const sourceFinalKey = getKeyWithPrefix({
		accessLevel: sourceAccessLevel,
		targetIdentityId: defaultIdentityId,
		key: sourceKey,
	});

	const destinationFinalKey = getKeyWithPrefix({
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
			CacheControl: 'no-store',
			MetadataDirective: 'COPY', // Copies over metadata like contentType as well
		}
	);

	return {
		key: destinationKey,
		eTag: response!.CopyObjectResult!.ETag!,
		lastModified: response!.CopyObjectResult!.LastModified!,
	};
};
