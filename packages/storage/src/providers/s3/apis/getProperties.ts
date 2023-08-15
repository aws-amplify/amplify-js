// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { headObject } from '../../../AwsClients/S3';
import { StorageOptions, StorageOperationRequest } from '../../../types';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../../errors/types/validation';
import { StorageException, S3GetPropertiesResult } from '../types';
import {
	resolveStorageConfig,
	getKeyWithPrefix,
	resolveCredentials,
} from '../utils';

/**
 * Gets the properties of a file. The properties include S3 system metadata and
 * the user metadata that was provided when uploading the file.
 *
 * @param {StorageOperationRequest} req The request to make an API call.
 * @returns {Promise<S3GetPropertiesResult>} A promise that resolves the properties.
 * @throws A {@link StorageException} when the underlying S3 service returned error.
 * @throws A {@link StorageValidationErrorCode} when API call parameters are invalid.
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
		targetIdentityId = req.options?.targetIdentityId ?? identityId;
	}
	assertValidationError(!!key, StorageValidationErrorCode.NoKey);
	const finalKey = getKeyWithPrefix(
		accessLevel ?? defaultAccessLevel,
		targetIdentityId,
		key
	);

	const response = await headObject(
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
		key: finalKey,
		contentType: response.ContentType,
		size: response.ContentLength,
		eTag: response.ETag,
		lastModified: response.LastModified,
		metadata: response.Metadata,
		versionId: response.VersionId,
	};
};
