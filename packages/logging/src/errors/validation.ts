// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorMap } from '@aws-amplify/core/internals/utils';

export enum LoggingValidationErrorCode {
	NoAppId = 'NoAppId',
	NoCredentials = 'NoCredentials',
}

export const validationErrorMap: AmplifyErrorMap<LoggingValidationErrorCode> = {
	[LoggingValidationErrorCode.NoAppId]: {
		message: 'Missing application id.',
	},
	[LoggingValidationErrorCode.NoCredentials]: {
		message: 'Credentials should not be empty.',
	},
};
