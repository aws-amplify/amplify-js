// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import { StorageAction } from '@aws-amplify/core/internals/utils';

import { GetPropertiesInput } from '../../src/providers/s3/types';
import {
	validateBucketOwnerID,
	validateStorageOperationInput,
} from '../assertions';
import { headObject } from '../serviceClients/headObject';
import { getStorageUserAgentValue } from '../utils/userAgent';
import {
	GetPropertiesDependencies,
	IdentityProvider,
	S3ConfigProvider,
	S3ServiceClient,
	ValidationProvider,
} from '../types/dependencies';
import { resolveS3ConfigAndInput } from '../utils/resolveS3ConfigAndInput';

export const resolveGetPropertiesDependencies = async (
	amplify: AmplifyClassV6,
	input: GetPropertiesInput | any,
	action?: StorageAction,
): Promise<GetPropertiesDependencies> => {
	const { s3Config, keyPrefix, bucket, identityId } =
		await resolveS3ConfigAndInput(amplify, input);

	const s3ConfigProvider: S3ConfigProvider = {
		bucket,
		region: s3Config.region,
		credentials: s3Config.credentials,
		customEndpoint: s3Config.customEndpoint,
		forcePathStyle: s3Config.forcePathStyle,
	};

	const identityProvider: IdentityProvider = {
		identityId,
		keyPrefix,
	};

	const validationProvider: ValidationProvider = {
		validateStorageInput: (inputData: any, userIdentityId?: string) =>
			validateStorageOperationInput(inputData, userIdentityId),
		validateBucketOwner: (bucketOwner?: string) => {
			validateBucketOwnerID(bucketOwner);
		},
	};

	const s3ServiceClient: S3ServiceClient = {
		headObject: async (config: any, params: any) => {
			return headObject(
				{
					...config,
					userAgentValue: getStorageUserAgentValue(
						action ?? StorageAction.GetProperties,
					),
				},
				params,
			);
		},
	};

	return {
		s3Config: s3ConfigProvider,
		identity: identityProvider,
		validator: validationProvider,
		s3Client: s3ServiceClient,
	};
};
