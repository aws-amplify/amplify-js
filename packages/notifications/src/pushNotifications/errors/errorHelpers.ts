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
	InvalidEndpoint = 'InvalidEndpoint',
	NoAppId = 'NoAppId',
	NoCredentials = 'NoCredentials',
	NoEndpoint = 'NoEndpoint',
	NoRegion = 'NoRegion',
	NoToken = 'NoToken',
	NotInitialized = 'NotInitialized',
}

const pushNotificationValidationErrorMap: AmplifyErrorMap<PushNotificationValidationErrorCode> =
	{
		[PushNotificationValidationErrorCode.InvalidEndpoint]: {
			message: 'The configured Customer Profiles endpoint is invalid.',
			recoverySuggestion:
				'Ensure the endpoint in your Amplify configuration is a valid https:// URL.',
		},
		[PushNotificationValidationErrorCode.NoAppId]: {
			message: 'Missing application id.',
		},
		[PushNotificationValidationErrorCode.NoCredentials]: {
			message: 'Credentials should not be empty.',
		},
		[PushNotificationValidationErrorCode.NoEndpoint]: {
			message: 'Missing endpoint.',
		},
		[PushNotificationValidationErrorCode.NoRegion]: {
			message: 'Missing region.',
		},
		[PushNotificationValidationErrorCode.NoToken]: {
			message: 'No push notification token available.',
			recoverySuggestion:
				'Pass a token to `registerDevice`, or ensure a token has been received via `onTokenReceived` before registering the device.',
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
