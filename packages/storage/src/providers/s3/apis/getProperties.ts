// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HeadObjectInput, headObject } from '../../../AwsClients/S3';
import { StorageOperationRequest } from '../../../types';
import { AmplifyV6 } from '@aws-amplify/core';
import { StorageOptions } from '../../../types/params';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../../errors/types/validation';
import { prefixResolver as defaultPrefixResolver } from '../../../utils/prefixResolver';
import { S3GetPropertiesResult } from '../types/results';
import { assertServiceError } from '../../../errors/utils/assertServiceError';
import { GetPropertiesException } from '../types/errors';

/**
 * Get Properties of the object
 *
 * @param {StorageOperationRequest} The request object
 * @return {Promise<S3GetPropertiesResult>} Properties of the object
 * @throws service: {@link GetPropertiesException}
 * - S3 service errors thrown while getting properties
 * @throws validation: {@link StorageValidationErrorCode } - Validation errors thrown
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
	assertValidationError(!!bucket, StorageValidationErrorCode.NoBucket);
	const { prefixResolver = defaultPrefixResolver } =
		AmplifyV6.libraryOptions?.Storage ?? {};
	const { key, options: { level = defaultAccessLevel } = {} } = req;
	assertValidationError(!!key, StorageValidationErrorCode.NoKey);
	const finalKey =
		prefixResolver({
			level,
			identityId: awsCredsIdentityId,
		}) + key;
	const params: HeadObjectInput = {
		Bucket: bucket,
		Key: finalKey,
	};
	try {
		const response = await headObject(options, params);
		return {
			key: finalKey,
			contentType: response.ContentType,
			contentLength: response.ContentLength,
			eTag: response.ETag,
			lastModified: response.LastModified,
			metadata: response.Metadata,
		};
	} catch (error) {
		assertServiceError(error);
		throw error;
	}
};
