// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorMap } from '@aws-amplify/core/internals/utils';

export enum StorageValidationErrorCode {
	NoCredentials = 'NoCredentials',
	NoIdentityId = 'NoIdentityId',
	NoKey = 'NoKey',
	NoSourceKey = 'NoSourceKey',
	NoDestinationKey = 'NoDestinationKey',
	NoSourcePath = 'NoSourcePath',
	NoDestinationPath = 'NoDestinationPath',
	NoBucket = 'NoBucket',
	NoRegion = 'NoRegion',
	InvalidStorageOperationPrefixInput = 'InvalidStorageOperationPrefixInput',
	InvalidStorageOperationInput = 'InvalidStorageOperationInput',
	InvalidStoragePathInput = 'InvalidStoragePathInput',
	InvalidUploadSource = 'InvalidUploadSource',
	ObjectIsTooLarge = 'ObjectIsTooLarge',
	UrlExpirationMaxLimitExceed = 'UrlExpirationMaxLimitExceed',
}

export const validationErrorMap: AmplifyErrorMap<StorageValidationErrorCode> = {
	[StorageValidationErrorCode.NoCredentials]: {
		message: 'Credentials should not be empty.',
	},
	[StorageValidationErrorCode.NoIdentityId]: {
		message:
			'Missing identity ID when accessing objects in protected or private access level.',
	},
	[StorageValidationErrorCode.NoKey]: {
		message: 'Missing key in api call.',
	},
	[StorageValidationErrorCode.NoSourceKey]: {
		message: 'Missing source key in copy api call.',
	},
	[StorageValidationErrorCode.NoDestinationKey]: {
		message: 'Missing destination key in copy api call.',
	},
	[StorageValidationErrorCode.NoSourcePath]: {
		message: 'Missing source path in copy api call.',
	},
	[StorageValidationErrorCode.NoDestinationPath]: {
		message: 'Missing destination path in copy api call.',
	},
	[StorageValidationErrorCode.NoBucket]: {
		message: 'Missing bucket name while accessing object.',
	},
	[StorageValidationErrorCode.NoRegion]: {
		message: 'Missing region while accessing object.',
	},
	[StorageValidationErrorCode.UrlExpirationMaxLimitExceed]: {
		message: 'Url Expiration can not be greater than 7 Days.',
	},
	[StorageValidationErrorCode.ObjectIsTooLarge]: {
		message: 'Object size cannot not be greater than 5TB.',
	},
	[StorageValidationErrorCode.InvalidUploadSource]: {
		message:
			'Upload source type can only be a `Blob`, `File`, `ArrayBuffer`, or `string`.',
	},
	[StorageValidationErrorCode.InvalidStorageOperationInput]: {
		message:
			'Path or key parameter must be specified in the input. Both can not be specified at the same time.',
	},
	[StorageValidationErrorCode.InvalidStorageOperationPrefixInput]: {
		message: 'Both path and prefix can not be specified at the same time.',
	},
	[StorageValidationErrorCode.InvalidStoragePathInput]: {
		message: 'Input `path` does not allow a leading slash (/).',
	},
};
