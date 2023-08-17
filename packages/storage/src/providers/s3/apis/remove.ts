// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { S3Exception } from '../types';
import {
	StorageOperationRequest,
	StorageRemoveOptions,
	StorageRemoveResult,
} from '../../../types';
import {
	resolveStorageConfig,
	getKeyWithPrefix,
	resolveCredentials,
} from '../utils';
import { deleteObject, DeleteObjectInput } from '../../../AwsClients/S3';
import { StorageValidationErrorCode } from '../../../errors/types/validation';
import { assertValidationError } from '../../../errors/utils/assertValidationError';

// TODO(ashwinkumar6) add unit test for remove API

/**
 * Remove the object that is specified by the `req`.
 * @param {StorageOperationRequest<StorageRemoveOptions>} req - The request object
 * @return {Promise<StorageRemoveResult>} - Promise resolves upon successful removal of the object
 * @throws service: {@link S3Exception} - S3 service errors thrown while getting properties
 * @throws validation: {@link StorageValidationErrorCode } - Validation errors thrown
 */
export const remove = async (
	req: StorageOperationRequest<StorageRemoveOptions>
): Promise<StorageRemoveResult> => {
	const { identityId, credentials } = await resolveCredentials();
	const { defaultAccessLevel, bucket, region } = resolveStorageConfig();
	const { key, options = {} } = req;
	const { accessLevel = defaultAccessLevel } = options;

	assertValidationError(!!key, StorageValidationErrorCode.NoKey);
	// TODO(ashwinkumar6) can we refactor getKeyWithPrefix to avoid duplication
	const finalKey = getKeyWithPrefix({
		accessLevel,
		targetIdentityId:
			options.accessLevel === 'protected'
				? options.targetIdentityId
				: identityId,
		key,
	});

	// TODO(ashwinkumar6) V6-logger: debug `remove ${key} from ${finalKey}`
	await deleteObject(
		{
			region,
			credentials,
		},
		{
			Bucket: bucket,
			Key: finalKey,
		}
	);
	return {
		key,
	};
};
