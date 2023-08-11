// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HeadObjectInput, headObject } from '../../../AwsClients/S3';
import { StorageOptions, StorageOperationRequest } from '../../../types';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../../errors/types/validation';
import { GetPropertiesException, S3GetPropertiesResult } from '../types';
import { resolveStorageConfig, getKeyWithPrefix } from '../utils';
import { resolveCredentials } from '../utils/resolveCredentials';

/**
 * Get Properties of the object
 *
 * @param {StorageOperationRequest} The request object
 * @return {Promise<S3GetPropertiesResult>} Properties of the object
 * @throws service: {@link GetPropertiesException}
 * - S3 Service errors thrown while getting properties
 * @throws validation: {@link StorageValidationErrorCode } - Validation errors thrown
 *
 */
export const getProperties = async function (
	req: StorageOperationRequest<StorageOptions>
): Promise<S3GetPropertiesResult> {
	const { defaultAccessLevel, bucket, region } = resolveStorageConfig();
	const { identityId, credentials } = await resolveCredentials();
	const {
		key,
		options: { accessLevel },
	} = req;
	let targetIdentityId;
	if (req?.options?.accessLevel === 'protected') {
		targetIdentityId = req.options?.targetIdentityId;
	}
	assertValidationError(!!key, StorageValidationErrorCode.NoKey);
	const finalKey = getKeyWithPrefix(
		accessLevel ?? defaultAccessLevel,
		targetIdentityId ?? identityId,
		key
	);
	const headObjectOptions = {
		accessLevel,
		targetIdentityId: identityId,
		region,
		credentials,
	};
	const headObjectParams: HeadObjectInput = {
		Bucket: bucket,
		Key: finalKey,
	};
	const response = await headObject(headObjectOptions, headObjectParams);
	return {
		key: finalKey,
		contentType: response.ContentType,
		contentLength: response.ContentLength,
		eTag: response.ETag,
		lastModified: response.LastModified,
		metadata: response.Metadata,
		versionId: response.VersionId,
	};
};
