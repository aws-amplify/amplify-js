// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { asserts } from '../../../Util/errors/AssertError';
import {
	AuthConfig,
	IdentityPoolConfig,
	JWT,
	UserPoolConfig,
	UserPoolConfigAndIdentityPoolConfig,
	UserPoolWithOAuth,
} from '../types';

export function assertTokenProviderConfig(
	authConfig?: AuthConfig
): asserts authConfig is UserPoolConfigAndIdentityPoolConfig | UserPoolConfig {
	const validConfig =
		!!authConfig?.Cognito?.userPoolId &&
		!!authConfig?.Cognito?.userPoolClientId;
	return asserts(validConfig, {
		name: 'AuthTokenConfigException',
		message: 'Auth Token Provider not configured',
		recoverySuggestion: 'Make sure to call Amplify.configure in your app',
	});
}

export function assertOAuthConfig(
	authConfig?: AuthConfig
): asserts authConfig is UserPoolWithOAuth {
	assertTokenProviderConfig(authConfig);
	const validOAuthConfig =
		!!authConfig.Cognito.loginWith?.oauth?.domain &&
		!!authConfig.Cognito.loginWith?.oauth?.redirectSignOut &&
		!!authConfig.Cognito.loginWith?.oauth?.redirectSignIn &&
		!!authConfig.Cognito.loginWith?.oauth?.responseType;

	return asserts(validOAuthConfig, {
		name: 'OAuthNotConfigureException',
		message: 'oauth param not configured',
		recoverySuggestion:
			'Make sure to call Amplify.configure with oauth parameter in your app',
	});
}

export function assertIdentityPooIdConfig(
	authConfig: AuthConfig
): asserts authConfig is IdentityPoolConfig {
	const validConfig = !!authConfig?.Cognito.identityPoolId;
	return asserts(validConfig, {
		name: 'AuthIdentityPoolIdException',
		message: 'Auth IdentityPoolId not configured',
		recoverySuggestion:
			'Make sure to call Amplify.configure in your app with a valid IdentityPoolId',
	});
}

export function assertUserPoolAndIdentityPooConfig(
	authConfig: AuthConfig
): asserts authConfig is UserPoolConfigAndIdentityPoolConfig {
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
