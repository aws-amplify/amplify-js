// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import { StorageAction } from '@aws-amplify/core/internals/utils';

import { GetPropertiesInput, GetPropertiesOutput } from '../../types';
import {
	resolveS3ConfigAndInput,
	validateStorageOperationInput,
} from '../../utils';
import { headObject } from '../../utils/client';
import { getStorageUserAgentValue } from '../../utils/userAgent';
import { logger } from '../../../../utils';
import { STORAGE_INPUT_KEY } from '../../utils/constants';

export const getProperties = async (
	amplify: AmplifyClassV6,
	input: GetPropertiesInput,
	action?: StorageAction,
): Promise<GetPropertiesOutput> => {
	const { options: getPropertiesOptions } = input;
	const { s3Config, bucket, keyPrefix, identityId } =
		await resolveS3ConfigAndInput(amplify, getPropertiesOptions);
	const { inputType, objectKey } = validateStorageOperationInput(
		input,
		identityId,
	);
	const finalKey =
		inputType === STORAGE_INPUT_KEY ? keyPrefix + objectKey : objectKey;

	logger.debug(`get properties of ${objectKey} from ${finalKey}`);
	const response = await headObject(
		{
			...s3Config,
			userAgentValue: getStorageUserAgentValue(
				action ?? StorageAction.GetProperties,
			),
		},
		{
			Bucket: bucket,
			Key: finalKey,
		},
	);

	const result = {
		contentType: response.ContentType,
		size: response.ContentLength,
		eTag: response.ETag,
		lastModified: response.LastModified,
		metadata: response.Metadata,
		versionId: response.VersionId,
	};

	return inputType === STORAGE_INPUT_KEY
		? { key: objectKey, path: finalKey, ...result }
		: { path: finalKey, key: finalKey, ...result };
};
