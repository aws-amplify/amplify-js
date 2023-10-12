// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorMap } from '@aws-amplify/core/internals/utils';

export enum InAppMessagingValidationErrorCode {
	NoAppId = 'NoAppId',
	NoCredentials = 'NoCredentials',
	NoRegion = 'NoRegion',
	NoEndpointId = 'NoEndpointId',
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
		[InAppMessagingValidationErrorCode.NoEndpointId]: {
			message: 'Could not find or create EndpointId.',
		},
		[InAppMessagingValidationErrorCode.NotInitialized]: {
			message: 'InAppMessaging not initialized.',
			recoverySuggestion: 'Call initializeInAppMessaging API first.',
		},
	};
