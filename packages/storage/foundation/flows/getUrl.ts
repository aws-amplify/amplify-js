/* eslint-disable no-console */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageAction } from '@aws-amplify/core/internals/utils';

import {
	GetUrlInput,
	GetUrlOutput,
	GetUrlWithPathInput,
	GetUrlWithPathOutput,
} from '../../src/providers/s3/types';
import { GetUrlDependencies } from '../types/dependencies';
import { STORAGE_INPUT_KEY } from '../utils';

/**
 * Pure business logic for getting presigned URL
 */
export const getUrlFlow = async (
	input: GetUrlInput | GetUrlWithPathInput,
	dependencies: GetUrlDependencies,
): Promise<GetUrlOutput | GetUrlWithPathOutput> => {
	console.log('🔍 Foundation getUrlFlow - Input:', input);
	console.log('🔍 Foundation getUrlFlow - Dependencies:', dependencies);

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

	if (input.options?.validateObjectExistence) {
		await s3Client.headObject?.(s3Config, {
			Bucket: s3Config.bucket,
			Key: finalKey,
			ExpectedBucketOwner: input.options?.expectedBucketOwner,
		});
	}

	const url = await s3Client.getPresignedGetObjectUrl?.(
		{
			...s3Config,
			userAgentValue: `aws-amplify/storage/${StorageAction.GetUrl}`,
		},
		{
			Bucket: s3Config.bucket,
			Key: finalKey,
			ResponseContentDisposition: input.options?.contentDisposition,
			ResponseContentType: input.options?.contentType,
			ExpectedBucketOwner: input.options?.expectedBucketOwner,
		},
	);

	const result = {
		url: url!,
		expiresAt: new Date(Date.now() + (input.options?.expiresIn ?? 900) * 1000),
	};

	return result as any;
};
