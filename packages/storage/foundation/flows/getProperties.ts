// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageAction } from '@aws-amplify/core/internals/utils';

import {
	GetPropertiesInput,
	GetPropertiesOutput,
	GetPropertiesWithPathOutput,
} from '../../src/providers/s3/types';
import { STORAGE_INPUT_KEY } from '../../src/providers/s3/utils/constants';
import { GetPropertiesDependencies } from '../types/dependencies';

/**
 * Pure business logic for getting object properties
 */
export const getPropertiesFlow = async (
	input: GetPropertiesInput | any,
	dependencies: GetPropertiesDependencies,
	action?: StorageAction,
): Promise<GetPropertiesOutput | GetPropertiesWithPathOutput> => {
	const { s3Config, identity, validator, s3Client } = dependencies;

	const { inputType, objectKey } = validator.validateStorageInput(
		input,
		identity.identityId,
	);
	validator.validateBucketOwner?.(input.options?.expectedBucketOwner);

	const finalKey =
		inputType === STORAGE_INPUT_KEY
			? identity.keyPrefix + objectKey
			: objectKey;

	const response = await s3Client.headObject?.(
		{
			...s3Config,
			userAgentValue: `aws-amplify/storage/${action ?? StorageAction.GetProperties}`,
		},
		{
			Bucket: s3Config.bucket,
			Key: finalKey,
			ExpectedBucketOwner: input.options?.expectedBucketOwner,
		},
	);

	const result = {
		contentType: response?.ContentType,
		size: response?.ContentLength,
		eTag: response?.ETag,
		lastModified: response?.LastModified,
		metadata: response?.Metadata,
		versionId: response?.VersionId,
	};

	return inputType === STORAGE_INPUT_KEY
		? { key: objectKey, ...result }
		: { path: objectKey, ...result };
};
