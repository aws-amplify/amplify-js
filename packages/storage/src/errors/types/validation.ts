// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorMap } from '@aws-amplify/core';

export enum StorageValidationErrorCode {
	NoCredentials = 'NoCredentials',
	NoIdentityId = 'NoIdentityId',
	NoKey = 'NoKey',
	NoBucket = 'NoBucket',
	NoRegion = 'NoRegion',
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
		message: 'Missing key in getProperties api call.',
	},
	[StorageValidationErrorCode.NoBucket]: {
		message: 'Missing bucket name while accessing object.',
	},
	[StorageValidationErrorCode.NoRegion]: {
		message: 'Missing region while accessing object.',
	},
	[StorageValidationErrorCode.NoKey]: {
		message: 'Missing key in getProperties api call',
	},
	[StorageValidationErrorCode.NoBucket]: {
		message: 'Missing bucket name while accessing object',
	},
	[StorageValidationErrorCode.NoRegion]: {
		message: 'Missing region while accessing object',
	},
};
