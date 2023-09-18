// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { asserts } from '../../../Util/errors/AssertError';

import {
	AuthConfig,
	JWT,
	AuthUserPoolAndIdentityPoolConfig,
	CognitoUserPoolWithOAuthConfig,
	CognitoUserPoolConfig,
	CognitoUserPoolAndIdentityPoolConfig,
	CognitoIdentityPoolConfig,
	StrictUnion,
} from '../types';

export function assertTokenProviderConfig(
	cognitoConfig?: StrictUnion<
		| CognitoUserPoolConfig
		| CognitoUserPoolAndIdentityPoolConfig
		| CognitoIdentityPoolConfig
	>
): asserts cognitoConfig is
	| CognitoUserPoolAndIdentityPoolConfig
	| CognitoUserPoolConfig {
	let assertionValid = true; // assume valid until otherwise proveed
	if (!cognitoConfig) {
		assertionValid = false;
	} else {
		assertionValid =
			!!cognitoConfig.userPoolClientId && !!cognitoConfig.userPoolClientId;
	}

	return asserts(assertionValid, {
		name: 'AuthTokenConfigException',
		message: 'Auth Token Provider not configured',
		recoverySuggestion: 'Make sure to call Amplify.configure in your app',
	});
}

export function assertOAuthConfig(
	cognitoConfig?: CognitoUserPoolConfig | CognitoUserPoolAndIdentityPoolConfig
): asserts cognitoConfig is CognitoUserPoolWithOAuthConfig {
	const validOAuthConfig =
		!!cognitoConfig?.loginWith?.oauth?.domain &&
		!!cognitoConfig?.loginWith?.oauth?.redirectSignOut &&
		!!cognitoConfig?.loginWith?.oauth?.redirectSignIn &&
		!!cognitoConfig?.loginWith?.oauth?.responseType;

	return asserts(validOAuthConfig, {
		name: 'OAuthNotConfigureException',
		message: 'oauth param not configured',
		recoverySuggestion:
			'Make sure to call Amplify.configure with oauth parameter in your app',
	});
}

export function assertIdentityPooIdConfig(
	cognitoConfig?: StrictUnion<
		| CognitoUserPoolConfig
		| CognitoUserPoolAndIdentityPoolConfig
		| CognitoIdentityPoolConfig
	>
): asserts cognitoConfig is CognitoIdentityPoolConfig {
	const validConfig = !!cognitoConfig?.identityPoolId;
	return asserts(validConfig, {
		name: 'InvalidIdentityPoolIdException',
		message: 'Invalid identity pool id provided.',
		recoverySuggestion:
			'Make sure a valid identityPoolId is given in the config.',
	});
}

function assertUserPoolAndIdentityPooConfig(
	authConfig: AuthConfig
): asserts authConfig is AuthUserPoolAndIdentityPoolConfig {
	const validConfig =
		!!authConfig?.Cognito.identityPoolId && !!authConfig?.Cognito.userPoolId;
	return asserts(validConfig, {
		name: 'AuthUserPoolAndIdentityPoolException',
		message: 'Auth UserPool and IdentityPool not configured',
		recoverySuggestion:
			'Make sure to call Amplify.configure in your app with UserPoolId and IdentityPoolId',
	});
}

export function decodeJWT(token: string): JWT {
	const tokenSplitted = token.split('.');
	if (tokenSplitted.length !== 3) {
		throw new Error('Invalid token');
	}
	try {
		const payloadStringb64 = tokenSplitted[1];
		const payloadArrayBuffer = base64ToBytes(payloadStringb64);
		const decodeString = new TextDecoder().decode(payloadArrayBuffer);
		const payload = JSON.parse(decodeString);

		return {
			toString: () => token,
			payload,
		};
	} catch (err) {
		throw new Error('Invalid token payload');
	}
}

function base64ToBytes(base64: string): Uint8Array {
	const binString = atob(base64);
	return Uint8Array.from(binString, m => m.codePointAt(0) || 0);
}
