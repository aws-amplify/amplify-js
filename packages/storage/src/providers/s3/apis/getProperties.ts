// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { headObject } from '../../../AwsClients/S3';
import { StorageOptions, StorageOperationRequest } from '../../../types';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../../errors/types/validation';
import { S3Exception, S3GetPropertiesResult } from '../types';
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
 * @throws A {@link GetPropertiesException} when the underlying S3 service returned error.
 * @throws A {@link StorageValidationErrorCode} when API call parameters are invalid.
 */
export const getProperties = async function (
	req: StorageOperationRequest<StorageOptions>
): Promise<S3GetPropertiesResult> {
	const { defaultAccessLevel, bucket, region } = resolveStorageConfig();
	const { identityId, credentials } = await resolveCredentials();
	const { key, options = {} } = req;
	const { accessLevel } = options;

	assertValidationError(!!key, StorageValidationErrorCode.NoKey);
	// TODO[AllanZhengYP]: refactor this to reduce duplication
	const finalKey = getKeyWithPrefix({
		accessLevel: accessLevel ?? defaultAccessLevel,
		targetIdentityId:
			accessLevel === 'protected' ? options.targetIdentityId : identityId,
		key,
	});

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
