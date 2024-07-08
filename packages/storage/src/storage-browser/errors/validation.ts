// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorMap } from '@aws-amplify/core/internals/utils';

export enum StorageBrowserValidationErrorCode {
	InvalidLocationCredentialsCacheSize = 'InvalidLocationCredentialsCacheSize',
	LocationCredentialsStoreDestroyed = 'LocationCredentialsStoreDestroyed',
	LocationCredentialsBucketMismatch = 'LocationCredentialsBucketMismatch',
	LocationCredentialsCrossBucket = 'LocationCredentialsCrossBucket',
	LocationCredentialsPathMismatch = 'LocationCredentialsPathMismatch',
	LocationCredentialsPermissionMismatch = 'LocationCredentialsPermissionMismatch',
	InvalidS3Uri = 'InvalidS3Uri',
}

export const validationErrorMap: AmplifyErrorMap<StorageBrowserValidationErrorCode> =
	{
		[StorageBrowserValidationErrorCode.InvalidLocationCredentialsCacheSize]: {
			message: 'locationCredentialsCacheSize must be a positive integer.',
		},
		[StorageBrowserValidationErrorCode.LocationCredentialsStoreDestroyed]: {
			message: 'The location-specific credentials store has been destroyed.',
		},
		[StorageBrowserValidationErrorCode.InvalidS3Uri]: {
			message: 'Invalid S3 URI.',
		},
		[StorageBrowserValidationErrorCode.LocationCredentialsCrossBucket]: {
			message: 'Location-specific credentials cannot be cross-bucket.',
		},
		[StorageBrowserValidationErrorCode.LocationCredentialsBucketMismatch]: {
			message:
				'Location-specific credentials bucket does not match the bucket of the API call.',
		},
		[StorageBrowserValidationErrorCode.LocationCredentialsPathMismatch]: {
			message:
				'Location-specific credentials path does not match the path of the API call.',
		},
		[StorageBrowserValidationErrorCode.LocationCredentialsPermissionMismatch]: {
			message:
				'Location-specific credentials permission does not match the permission required for the API call.',
		},
	};
