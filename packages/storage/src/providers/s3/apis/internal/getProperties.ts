// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import { StorageAction } from '@aws-amplify/core/internals/utils';

import {
	GetPropertiesInput,
	GetPropertiesOutput,
	GetPropertiesWithPathOutput,
} from '../../types';
import {
	resolveS3ConfigAndInput,
	validateBucketOwnerID,
	validateStorageOperationInput,
} from '../../utils';
import { headObject } from '../../utils/client/s3data';
import { getStorageUserAgentValue } from '../../utils/userAgent';
import { logger } from '../../../../utils';
import { STORAGE_INPUT_KEY } from '../../utils/constants';
// TODO: Remove this interface when we move to public advanced APIs.
import { GetPropertiesInput as GetPropertiesWithPathInputWithAdvancedOptions } from '../../../../internals';

export const getProperties = async (
	amplify: AmplifyClassV6,
	input: GetPropertiesInput | GetPropertiesWithPathInputWithAdvancedOptions,
	action?: StorageAction,
): Promise<GetPropertiesOutput | GetPropertiesWithPathOutput> => {
	const { s3Config, bucket, keyPrefix, identityId } =
		await resolveS3ConfigAndInput(amplify, input);
	const { inputType, objectKey } = validateStorageOperationInput(
		input,
		identityId,
	);

	validateBucketOwnerID(input.options?.expectedBucketOwner);

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
			ExpectedBucketOwner: input.options?.expectedBucketOwner,
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
		? { key: objectKey, ...result }
		: { path: objectKey, ...result };
};
