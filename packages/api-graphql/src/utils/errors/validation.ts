// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorMap } from '@aws-amplify/core/internals/utils';

export enum APIValidationErrorCode {
	NoAuthSession = 'NoAuthSession',
	NoRegion = 'NoRegion',
	NoCustomEndpoint = 'NoCustomEndpoint',
}

export const validationErrorMap: AmplifyErrorMap<APIValidationErrorCode> = {
	[APIValidationErrorCode.NoAuthSession]: {
		message: 'Auth session should not be empty.',
	},
	// TODO: re-enable when working in all test environments:
	// [APIValidationErrorCode.NoEndpoint]: {
	// 	message: 'Missing endpoint',
	// },
	[APIValidationErrorCode.NoRegion]: {
		message: 'Missing region.',
	},
	[APIValidationErrorCode.NoCustomEndpoint]: {
		message: 'Custom endpoint region is present without custom endpoint.',
	},
};
