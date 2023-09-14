// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createAssertionFunction } from '../../../errors';
import { AmplifyErrorMap, AssertionFunction } from '../../../types';

export enum AuthConfigurationErrorCode {
	AuthConfigException = 'AuthConfigException',
	AuthIdentityPoolIdException = 'AuthIdentityPoolIdException',
	AuthTokenConfigException = 'AuthTokenConfigException',
	AuthUserPoolAndIdentityPoolException = 'AuthUserPoolAndIdentityPoolException',
	OAuthNotConfigureException = 'OAuthNotConfigureException',
}

const authConfigurationErrorMap: AmplifyErrorMap<AuthConfigurationErrorCode> = {
	[AuthConfigurationErrorCode.AuthConfigException]: {
		message: 'AuthConfig is required.',
		recoverySuggestion:
			'Make sure to call Amplify.configure in your app with a valid AuthConfig.',
	},
	[AuthConfigurationErrorCode.AuthIdentityPoolIdException]: {
		message: 'Auth IdentityPoolId not configured.',
		recoverySuggestion:
			'Make sure to call Amplify.configure in your app with a valid IdentityPoolId.',
	},
	[AuthConfigurationErrorCode.AuthTokenConfigException]: {
		message: 'Auth Token Provider not configured.',
		recoverySuggestion: 'Make sure to call Amplify.configure in your app.',
	},
	[AuthConfigurationErrorCode.AuthUserPoolAndIdentityPoolException]: {
		message: 'Auth UserPool or IdentityPool not configured.',
		recoverySuggestion:
			'Make sure to call Amplify.configure in your app with UserPoolId and IdentityPoolId.',
	},
	[AuthConfigurationErrorCode.OAuthNotConfigureException]: {
		message: 'oauth param not configured.',
		recoverySuggestion:
			'Make sure to call Amplify.configure with oauth parameter in your app.',
	},
};

export const assert: AssertionFunction<AuthConfigurationErrorCode> =
	createAssertionFunction(authConfigurationErrorMap);
