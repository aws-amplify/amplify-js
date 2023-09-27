// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorMap } from '@aws-amplify/core/internals/utils';

export enum RestApiValidationErrorCode {
	NoCredentials = 'NoCredentials',
	NoApiKey = 'NoApiKey',
	NoAuthHeader = 'NoAuthHeader',
	NoAuthToken = 'NoAuthToken',
}

export const validationErrorMap: AmplifyErrorMap<RestApiValidationErrorCode> = {
	[RestApiValidationErrorCode.NoCredentials]: {
		message: 'Credentials should not be empty.',
	},
	[RestApiValidationErrorCode.NoApiKey]: {
		message: 'API Key should not be empty.',
		recoverySuggestion:
			'Check if `apiKey` is configured for your API with `defaultAuthMode` of value `apiKey`.',
	},
	[RestApiValidationErrorCode.NoAuthHeader]: {
		message: 'Authorization header should not be empty.',
		recoverySuggestion:
			'The specified API has default authorization type of `lambda`, you have to pass in a valid ' +
			'`Authorization`header, \ne.g. `get({ apiName, path: { headers: { Authorization: token } } })` ',
	},
	[RestApiValidationErrorCode.NoAuthToken]: {
		message: 'Auth token should not be empty.',
		recoverySuggestion: 'Check if Auth token provider is configured correctly.',
	},
};
