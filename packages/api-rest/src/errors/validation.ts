// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorMap } from '@aws-amplify/core/internals/utils';

export enum RestApiValidationErrorCode {
	InvalidApiName = 'InvalidApiName',
	InvalidPath = 'InvalidPath',
}

export const validationErrorMap: AmplifyErrorMap<RestApiValidationErrorCode> = {
	[RestApiValidationErrorCode.InvalidApiName]: {
		message: 'API name is invalid.',
		recoverySuggestion:
			'Check if the API name matches the one in your configuration or `aws-exports.js`',
	},
	[RestApiValidationErrorCode.InvalidPath]: {
		message:
			'API path resolves to a different origin than the configured endpoint.',
		recoverySuggestion:
			'Make sure the path starts with "/" so it resolves under the configured endpoint.',
	},
};
