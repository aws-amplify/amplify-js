// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AuthConfigurationErrorCode, assert } from './errorHelpers';

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

	return assert(
		assertionValid,
		AuthConfigurationErrorCode.AuthTokenConfigException
	);
}

export function assertOAuthConfig(
	cognitoConfig?: CognitoUserPoolConfig | CognitoUserPoolAndIdentityPoolConfig
): asserts cognitoConfig is CognitoUserPoolWithOAuthConfig {
	const validOAuthConfig =
		!!cognitoConfig?.loginWith?.oauth?.domain &&
		!!cognitoConfig?.loginWith?.oauth?.redirectSignOut &&
		!!cognitoConfig?.loginWith?.oauth?.redirectSignIn &&
		!!cognitoConfig?.loginWith?.oauth?.responseType;

	return assert(
		validOAuthConfig,
		AuthConfigurationErrorCode.OAuthNotConfigureException
	);
}

export function assertIdentityPoolIdConfig(
	cognitoConfig?: StrictUnion<
		| CognitoUserPoolConfig
		| CognitoUserPoolAndIdentityPoolConfig
		| CognitoIdentityPoolConfig
	>
): asserts cognitoConfig is CognitoIdentityPoolConfig {
	const validConfig = !!cognitoConfig?.identityPoolId;
	return assert(
		validConfig,
		AuthConfigurationErrorCode.InvalidIdentityPoolIdException
	);
}

function assertUserPoolAndIdentityPoolConfig(
	authConfig: AuthConfig
): asserts authConfig is AuthUserPoolAndIdentityPoolConfig {
	const validConfig =
		!!authConfig?.Cognito.identityPoolId && !!authConfig?.Cognito.userPoolId;
	return assert(
		validConfig,
		AuthConfigurationErrorCode.AuthUserPoolAndIdentityPoolException
	);
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
