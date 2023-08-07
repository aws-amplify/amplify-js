// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { headObject } from '../../../AwsClients/S3';
import { StorageOperationRequest } from '../../../types';
import { AmplifyV6 } from '@aws-amplify/core';
import { StorageOptions } from '../../../types/params';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../../errors/types/validation';
import { prefixResolver as defaultPrefixResolver } from '../../../utils/prefixResolver';
import { S3GetPropertiesResult } from '../types/results';
import { assertServiceError } from '../../../errors/utils/assertServiceError';

/**
 * Get Properties of the object
 *
 * @param {StorageOperationRequest} The request object
 * @return {Promise<S3GetPropertiesResult>} Properties of the object
 * @throws service: {@link NotFoundException} - thrown when there is no given object in bucket
 * @throws validation: {@link StorageValidationErrorCode } - Validation errors thrown either username or key are not defined.
 *
 * TODO: add config errors
 */
export const getProperties = async function (
	req: StorageOperationRequest<StorageOptions>
): Promise<S3GetPropertiesResult> {
	const options = req?.options;
	const { awsCreds, awsCredsIdentityId } =
		await AmplifyV6.Auth.fetchAuthSession();
	assertValidationError(!!awsCreds, StorageValidationErrorCode.NoCredentials);
	const { bucket, defaultAccessLevel } = AmplifyV6.getConfig().Storage;
	// TODO: assert bucket and region;
	const { key, options: { level = defaultAccessLevel } = {} } = req;
	const { prefixResolver = defaultPrefixResolver } =
		AmplifyV6.libraryOptions?.Storage ?? {};
	assertValidationError(!!key, StorageValidationErrorCode.NoKey);
	const finalKey =
		prefixResolver({
			level,
			identityId: awsCredsIdentityId,
		}) + key;
	const response = await headObject(options, {
		Bucket: bucket,
		Key: finalKey,
	});
	return {
		key: finalKey,
		contentType: response.ContentType,
		contentLength: response.ContentLength,
		eTag: response.ETag,
		lastModified: response.LastModified,
		metadata: response.Metadata,
	};
};
