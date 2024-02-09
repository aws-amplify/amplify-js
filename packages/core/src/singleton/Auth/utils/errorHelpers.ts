// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createAssertionFunction } from '../../../errors';
import { AmplifyErrorMap, AssertionFunction } from '../../../types';

export enum AuthConfigurationErrorCode {
	AuthTokenConfigException = 'AuthTokenConfigException',
	AuthUserPoolAndIdentityPoolException = 'AuthUserPoolAndIdentityPoolException',
	AuthUserPoolException = 'AuthUserPoolException',
	InvalidIdentityPoolIdException = 'InvalidIdentityPoolIdException',
	OAuthNotConfigureException = 'OAuthNotConfigureException',
}

const authConfigurationErrorMap: AmplifyErrorMap<AuthConfigurationErrorCode> = {
	[AuthConfigurationErrorCode.AuthTokenConfigException]: {
		message: 'Auth Token Provider not configured.',
		recoverySuggestion: 'Make sure to call Amplify.configure in your app.',
	},
	[AuthConfigurationErrorCode.AuthUserPoolAndIdentityPoolException]: {
		message: 'Auth UserPool or IdentityPool not configured.',
		recoverySuggestion:
			'Make sure to call Amplify.configure in your app with UserPoolId and IdentityPoolId.',
	},
	[AuthConfigurationErrorCode.AuthUserPoolException]: {
		message: 'Auth UserPool not configured.',
		recoverySuggestion:
			'Make sure to call Amplify.configure in your app with userPoolId and userPoolClientId.',
	},
	[AuthConfigurationErrorCode.InvalidIdentityPoolIdException]: {
		message: 'Invalid identity pool id provided.',
		recoverySuggestion:
			'Make sure a valid identityPoolId is given in the config.',
	},
	[AuthConfigurationErrorCode.OAuthNotConfigureException]: {
		message: 'oauth param not configured.',
		recoverySuggestion:
			'Make sure to call Amplify.configure with oauth parameter in your app.',
	},
};

export const assert: AssertionFunction<AuthConfigurationErrorCode> =
	createAssertionFunction(authConfigurationErrorMap);
