// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { headObject } from '../../../AwsClients/S3';
import { StorageOperationRequest } from '../../../types';
import { AmplifyV6 } from '@aws-amplify/core';
import { StorageOptions } from '../../../types/params';
import { assertValidationError } from '../../../errors/assertValidationErrors';
import { StorageValidationErrorCode } from '../../../errors/types/validation';
import { prefixResolver as defaultPrefixResolver } from '../../../utils/prefixResolver';
import { S3GetPropertiesResult } from '../types/results';
import { StorageError } from '../../../errors/StorageError';
import { NETWORK_ERROR_CODE } from '../../../AwsClients/S3/runtime/constants';

/**
 * Get Properties of the object
 *
 * @param {StorageOperationRequest} req
 * @return {Promise<S3GetPropertiesResult>}
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
	try {
		const finalKey =
			prefixResolver({
				level,
				identityId: awsCredsIdentityId,
			}) + key;
		const response = await headObject(options, {
			Bucket: bucket,
			Key: finalKey,
		});
		const getPropertiesResponse: S3GetPropertiesResult = {
			key: finalKey,
			contentType: response.ContentType,
			contentLength: response.ContentLength,
			eTag: response.ETag,
			lastModified: response.LastModified,
			metadata: response.Metadata,
		};
		return getPropertiesResponse;
	} catch (error) {
		throw error;
	}
};
