// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorMap } from '@aws-amplify/core/internals/utils';

export enum APIValidationErrorCode {
	NoAuthSession = 'NoAuthSession',
	NoDefaultAuthMode = 'NoDefaultAuthMode',
	NoEndpoint = 'NoEndpoint',
	NoRegion = 'NoRegion',
}

export const validationErrorMap: AmplifyErrorMap<APIValidationErrorCode> = {
	[APIValidationErrorCode.NoAuthSession]: {
		message: 'Auth session should not be empty.',
	},
	[APIValidationErrorCode.NoDefaultAuthMode]: {
		message: 'Missing default auth mode',
	},
	[APIValidationErrorCode.NoEndpoint]: {
		message: 'Missing endpoint',
	},
	[APIValidationErrorCode.NoRegion]: {
		message: 'Missing region.',
	},
};
