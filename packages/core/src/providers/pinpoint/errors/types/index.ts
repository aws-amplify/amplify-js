// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorMap } from '../../../../types';

export enum AnalyticsValidationErrorCode {
	InvalidAnalyticsConfiguration = 'InvalidAnalyticsConfiguration',
	NoCredentials = 'NoCredentials'
}

export const validationErrorMap: AmplifyErrorMap<AnalyticsValidationErrorCode> = {
	[AnalyticsValidationErrorCode.NoCredentials]: {
		message: 'Credentials should not be empty'
	},
	[AnalyticsValidationErrorCode.InvalidAnalyticsConfiguration]: {
		message: 'Invalid Analytics configuration (appId & region are required)'
	},
};
