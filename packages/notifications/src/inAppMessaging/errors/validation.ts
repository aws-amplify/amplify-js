// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorMap } from '@aws-amplify/core/internals/utils';

export enum InAppMessagingValidationErrorCode {
	NoAppId = 'NoAppId',
	NoCredentials = 'NoCredentials',
	NoRegion = 'NoRegion',
	NotInitialized = 'NotInitialized',
}

export const validationErrorMap: AmplifyErrorMap<InAppMessagingValidationErrorCode> =
	{
		[InAppMessagingValidationErrorCode.NoAppId]: {
			message: 'Missing application id.',
		},
		[InAppMessagingValidationErrorCode.NoCredentials]: {
			message: 'Credentials should not be empty.',
		},
		[InAppMessagingValidationErrorCode.NoRegion]: {
			message: 'Missing region.',
		},
		[InAppMessagingValidationErrorCode.NotInitialized]: {
			message: 'In-app messaging has not been initialized.',
			recoverySuggestion:
				'Please make sure to first call `initializeInAppMessaging`.',
		},
	};
