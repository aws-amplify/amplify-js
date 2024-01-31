// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorMap } from '@aws-amplify/core/internals/utils';

export enum LoggingValidationErrorCode {
	NoCredentials = 'NoCredentials',
	NoRegion = 'NoRegion',
}

export const validationErrorMap: AmplifyErrorMap<LoggingValidationErrorCode> = {
	[LoggingValidationErrorCode.NoCredentials]: {
		message: 'Credentials should not be empty.',
	},
	[LoggingValidationErrorCode.NoRegion]: {
		message: 'Missing region.',
	},
};
