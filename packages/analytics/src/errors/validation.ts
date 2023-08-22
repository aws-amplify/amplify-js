// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorMap } from '@aws-amplify/core';

export enum AnalyticsValidationErrorCode {
	NoAppId = 'NoAppId',
	NoCredentials = 'NoCredentials',
	NoRegion = 'NoRegion',
}

export const validationErrorMap: AmplifyErrorMap<AnalyticsValidationErrorCode> =
	{
		[AnalyticsValidationErrorCode.NoAppId]: {
			message: 'Missing application id.',
		},
		[AnalyticsValidationErrorCode.NoCredentials]: {
			message: 'Credentials should not be empty.',
		},
		[AnalyticsValidationErrorCode.NoRegion]: {
			message: 'Missing region.',
		},
	};
