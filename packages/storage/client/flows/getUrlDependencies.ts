// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import { StorageAction } from '@aws-amplify/core/internals/utils';

import { GetUrlInput, GetUrlWithPathInput } from '../../src/providers/s3/types';
import {
	GetUrlDependencies,
	IdentityProvider,
	S3ConfigProvider,
	S3ServiceClient,
	ValidationProvider,
} from '../../foundation/flows/getUrl';
// Import pure functions from foundation layer
import {
	validateBucketOwnerID,
	validateStorageOperationInput,
} from '../../foundation';
import { resolveS3ConfigAndInput } from '../../src/providers/s3/utils';
import { getPresignedGetObjectUrl } from '../../src/providers/s3/utils/client/s3data';
import { getProperties } from '../../src/providers/s3/apis/internal/getProperties';
import { assertValidationError } from '../../src/errors/utils/assertValidationError';

/**
 * Resolve all dependencies needed by the foundation layer from Amplify singleton
 */
export const resolveGetUrlDependencies = async (
	amplify: AmplifyClassV6,
	input: GetUrlInput | GetUrlWithPathInput,
): Promise<GetUrlDependencies> => {
	// Resolve S3 config and input from Amplify
	const { s3Config, keyPrefix, bucket, identityId } =
		await resolveS3ConfigAndInput(amplify, input);

	// Create S3 config provider
	const s3ConfigProvider: S3ConfigProvider = {
		bucket,
		region: s3Config.region,
		credentials: s3Config.credentials,
		customEndpoint: s3Config.customEndpoint,
		forcePathStyle: s3Config.forcePathStyle,
	};

	// Create identity provider
	const identityProvider: IdentityProvider = {
		identityId,
		keyPrefix,
	};

	// Create validation provider
	const validationProvider: ValidationProvider = {
		validateStorageInput: (inputData: any, userIdentityId?: string) =>
			validateStorageOperationInput(inputData, userIdentityId),
		validateBucketOwner: (bucketOwner?: string) => {
			validateBucketOwnerID(bucketOwner);
		},
		assertValidation: (condition: boolean, errorCode: string) => {
			assertValidationError(condition, errorCode as any);
		},
	};

	// Create S3 service client
	const s3ServiceClient: S3ServiceClient = {
		getPresignedGetObjectUrl: async (config: any, params: any) => {
			const url = await getPresignedGetObjectUrl(config, params);

			return url.toString();
		},
		headObject: async () => {
			// Use existing getProperties for object existence validation
			await getProperties(amplify, input, StorageAction.GetUrl);
		},
	};

	return {
		s3Config: s3ConfigProvider,
		identity: identityProvider,
		validator: validationProvider,
		s3Client: s3ServiceClient,
	};
};
