// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorMap } from '@aws-amplify/core/internals/utils';

export enum AnalyticsValidationErrorCode {
	NoAppId = 'NoAppId',
	NoCredentials = 'NoCredentials',
	NoEventName = 'NoEventName',
	NoRegion = 'NoRegion',
	InvalidTracker = 'InvalidTracker',
	UnsupportedPlatform = 'UnsupportedPlatform',
	NoTrackingId = 'NoTrackingId',
	InvalidFlushSize = 'InvalidFlushSize',
}

export const validationErrorMap: AmplifyErrorMap<AnalyticsValidationErrorCode> =
	{
		[AnalyticsValidationErrorCode.NoAppId]: {
			message: 'Missing application id.',
		},
		[AnalyticsValidationErrorCode.NoCredentials]: {
			message: 'Credentials should not be empty.',
		},
		[AnalyticsValidationErrorCode.NoEventName]: {
			message: 'Events must specify a name.',
		},
		[AnalyticsValidationErrorCode.NoRegion]: {
			message: 'Missing region.',
		},
		[AnalyticsValidationErrorCode.InvalidTracker]: {
			message: 'Invalid tracker type specified.',
		},
		[AnalyticsValidationErrorCode.UnsupportedPlatform]: {
			message: 'Only session tracking is supported on React Native.',
		},
		[AnalyticsValidationErrorCode.InvalidFlushSize]: {
			message: 'Invalid FlushSize, it should be smaller than BufferSize',
		},
		[AnalyticsValidationErrorCode.NoTrackingId]: {
			message: 'A trackingId is required to use Amazon Personalize',
		},
	};
