// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

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
	AmplifyV6.getConfig().Storage;
	const { awsCreds, awsCredsIdentityId } =
		await AmplifyV6.Auth.fetchAuthSession();
	assertValidationError(!!awsCreds, StorageValidationErrorCode.NoCredentials);
	const { bucket, defaultAccessLevel } = AmplifyV6.getConfig().Storage;
	// TODO: assert bucket and region;
	const { key, options: { level = defaultAccessLevel } = {} } = req;
	const { prefixResolver = defaultPrefixResolver } =
		AmplifyV6.libraryOptions?.Storage ?? {};
	try {
		assertValidationError(!!key, StorageValidationErrorCode.NoKey);
		const final_key =
			prefixResolver({
				level,
				identityId: awsCredsIdentityId,
			}) + key;
		const response = await headObject(options, {
			Bucket: bucket,
			Key: final_key,
		});
		const getPropertiesResponse: S3GetPropertiesResult = {
			key: final_key,
			contentType: response.ContentType,
			contentLength: response.ContentLength,
			eTag: response.ETag,
			lastModified: response.LastModified,
			metadata: response.Metadata,
		};
		return getPropertiesResponse;
	} catch {
		throw new StorageError({
			name: 'KeyNotFound',
			message: 'Error retrieving the key',
		});
	}
};
