// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HeadObjectInput, headObject } from '../../../AwsClients/S3';
import { AmplifyV6 } from '@aws-amplify/core';
import { StorageOptions, StorageOperationRequest } from '../../../types';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../../errors/types/validation';
import { prefixResolver as defaultPrefixResolver } from '../../../utils/prefixResolver';
import { S3GetPropertiesResult } from '../types/results';
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
	const { awsCredsIdentityId } = await AmplifyV6.Auth.fetchAuthSession();
	const { bucket, defaultAccessLevel } = AmplifyV6.getConfig().Storage;
	assertValidationError(!!bucket, StorageValidationErrorCode.NoBucket);
	const { prefixResolver = defaultPrefixResolver } =
		AmplifyV6.libraryOptions?.Storage ?? {};
	const { key, options: { accessLevel = defaultAccessLevel } = {} } = req;
	assertValidationError(!!key, StorageValidationErrorCode.NoKey);
	const finalKey =
		prefixResolver({
			accessLevel,
			targetIdentityId: awsCredsIdentityId,
		}) + key;
	const params: HeadObjectInput = {
		Bucket: bucket,
		Key: finalKey,
	};
	const response = await headObject(options, params);
	return {
		key: finalKey,
		contentType: response.ContentType,
		contentLength: response.ContentLength,
		eTag: response.ETag,
		lastModified: response.LastModified,
		metadata: response.Metadata,
	};
};
