// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorMap } from '@aws-amplify/core/internals/utils';

export enum PredictionsValidationErrorCode {
	NoCredentials = 'NoCredentials',
	NoIdentityId = 'NoIdentityId',
	NoKey = 'NoKey',
	NoSourceKey = 'NoSourceKey',
	NoDestinationKey = 'NoDestinationKey',
	NoBucket = 'NoBucket',
	NoRegion = 'NoRegion',
	UrlExpirationMaxLimitExceed = 'UrlExpirationMaxLimitExceed',
	ObjectIsTooLarge = 'ObjectIsTooLarge',
	InvalidUploadSource = 'InvalidUploadSource',
}

export const validationErrorMap: AmplifyErrorMap<PredictionsValidationErrorCode> =
	{
		[PredictionsValidationErrorCode.NoCredentials]: {
			message: 'Credentials should not be empty.',
		},
		[PredictionsValidationErrorCode.NoIdentityId]: {
			message:
				'Missing identity ID when accessing objects in protected or private access level.',
		},
		[PredictionsValidationErrorCode.NoKey]: {
			message: 'Missing key in api call.',
		},
		[PredictionsValidationErrorCode.NoSourceKey]: {
			message: 'Missing source key in copy api call.',
		},
		[PredictionsValidationErrorCode.NoDestinationKey]: {
			message: 'Missing destination key in copy api call.',
		},
		[PredictionsValidationErrorCode.NoBucket]: {
			message: 'Missing bucket name while accessing object.',
		},
		[PredictionsValidationErrorCode.NoRegion]: {
			message: 'Missing region while accessing object.',
		},
		[PredictionsValidationErrorCode.UrlExpirationMaxLimitExceed]: {
			message: 'Url Expiration can not be greater than 7 Days.',
		},
		[PredictionsValidationErrorCode.ObjectIsTooLarge]: {
			message: 'Object size cannot not be greater than 5TB.',
		},
		[PredictionsValidationErrorCode.InvalidUploadSource]: {
			message:
				'Upload source type can only be a `Blob`, `File`, `ArrayBuffer`, or `string`.',
		},
	};
