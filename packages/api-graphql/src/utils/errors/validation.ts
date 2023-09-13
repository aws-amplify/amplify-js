// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorMap } from '@aws-amplify/core/internals/utils';

export enum APIValidationErrorCode {
	NoAppId = 'NoAppId',
	NoCredentials = 'NoCredentials',
	NoRegion = 'NoRegion',
	NoDefaultAuthMode = 'NoDefaultAuthMode',
}

export const validationErrorMap: AmplifyErrorMap<APIValidationErrorCode> = {
	[APIValidationErrorCode.NoAppId]: {
		message: 'Missing application id.',
	},
	[APIValidationErrorCode.NoCredentials]: {
		message: 'Credentials should not be empty.',
	},
	[APIValidationErrorCode.NoRegion]: {
		message: 'Missing region.',
	},
	[APIValidationErrorCode.NoDefaultAuthMode]: {
		message: 'Missing default auth mode',
	},
};
