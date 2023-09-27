// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyErrorMap,
	AssertionFunction,
	createAssertionFunction,
} from '@aws-amplify/core/internals/utils';

export enum TokenProviderErrorCode {
	InvalidAuthTokens = 'InvalidAuthTokens',
}

const tokenValidationErrorMap: AmplifyErrorMap<TokenProviderErrorCode> = {
	[TokenProviderErrorCode.InvalidAuthTokens]: {
		message: 'Invalid tokens.',
		recoverySuggestion: 'Make sure the tokens are valid.',
	},
};

export const assert: AssertionFunction<TokenProviderErrorCode> =
	createAssertionFunction(tokenValidationErrorMap);
