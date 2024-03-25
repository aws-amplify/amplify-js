// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyErrorMap,
	AssertionFunction,
	createAssertionFunction,
} from '@aws-amplify/core/internals/utils';

import { isInitialized } from '../utils/initializationManager';

import { PushNotificationError } from './PushNotificationError';

export enum PushNotificationValidationErrorCode {
	NoAppId = 'NoAppId',
	NoCredentials = 'NoCredentials',
	NoRegion = 'NoRegion',
	NotInitialized = 'NotInitialized',
}

const pushNotificationValidationErrorMap: AmplifyErrorMap<PushNotificationValidationErrorCode> =
	{
		[PushNotificationValidationErrorCode.NoAppId]: {
			message: 'Missing application id.',
		},
		[PushNotificationValidationErrorCode.NoCredentials]: {
			message: 'Credentials should not be empty.',
		},
		[PushNotificationValidationErrorCode.NoRegion]: {
			message: 'Missing region.',
		},
		[PushNotificationValidationErrorCode.NotInitialized]: {
			message: 'Push notification has not been initialized.',
			recoverySuggestion:
				'Please make sure to first call `initializePushNotifications`.',
		},
	};

export const assert: AssertionFunction<PushNotificationValidationErrorCode> =
	createAssertionFunction(
		pushNotificationValidationErrorMap,
		PushNotificationError,
	);

export const assertIsInitialized = () => {
	assert(isInitialized(), PushNotificationValidationErrorCode.NotInitialized);
};
