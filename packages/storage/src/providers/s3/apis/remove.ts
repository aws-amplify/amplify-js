// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6 } from '@aws-amplify/core';
import {
	StorageOperationRequest,
	StorageRemoveOptions,
	StorageRemoveResult,
} from '../../../types';
import {
	deleteObject,
	DeleteObjectInput,
	DeleteObjectCommandOutput,
} from '../../../AwsClients/S3';
import { ConsoleLogger as Logger } from '@aws-amplify/core';

// TODO are we using Logger in V6
const logger = new Logger('AWSS3Provider');

/**
 * List bucket objects
 * @param {StorageOperationRequest<StorageRemoveOptions>} req - The request object
 * @return {Promise<S3ProviderRemoveOutput>} - Promise resolves to list of keys and metadata for all objects in path
 * additionally the result will include a nextToken if there are more items to retrieve
 * @throws service: {@link RemoveException} - S3 service errors thrown while getting properties
 * @throws validation: {@link StorageValidationErrorCode } - Validation errors thrown
 */
export const remove = async (
	req: StorageOperationRequest<StorageRemoveOptions>
): Promise<StorageRemoveResult> => {
	const { awsCredsIdentityId, awsCreds, defaultAccessLevel, bucket, region } =
		await getStorageConfig();
	const {
		key,
		options: {
			accessLevel = defaultAccessLevel,
			targetIdentityId = awsCredsIdentityId,
		},
	} = req;
	const finalKey = getKeyWithPrefix(accessLevel, awsCredsIdentityId, key);
	logger.debug('remove ' + key + ' from ' + finalKey);
	const removeOptions = {
		accessLevel,
		targetIdentityId: awsCredsIdentityId,
		region,
		credentials: awsCreds,
	};
	const removeParams: DeleteObjectInput = {
		Bucket: bucket,
		Key: finalKey,
	};

	const response = await deleteObject(removeOptions, removeParams);
	return response;
};
