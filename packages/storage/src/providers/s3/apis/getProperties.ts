// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HeadObjectInput, headObject } from '../../../AwsClients/S3';
import { StorageOptions, StorageOperationRequest } from '../../../types';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../../errors/types/validation';
import { GetPropertiesException, S3GetPropertiesResult } from '../types';
import { getStorageConfig, getFinalKey } from '../utils/apiHelper';

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
	const { awsCredsIdentityId, awsCreds, defaultAccessLevel, bucket, region } =
		await getStorageConfig();
	const { key, options: { accessLevel = defaultAccessLevel } = {} } = req;
	assertValidationError(!!key, StorageValidationErrorCode.NoKey);
	const finalKey = getFinalKey(accessLevel, awsCredsIdentityId, key);
	const headObjectOptions = {
		accessLevel,
		awsCredsIdentityId,
		region,
		awsCreds,
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
	};
};
