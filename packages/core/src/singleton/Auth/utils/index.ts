// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AuthConfigurationErrorCode, assert } from './errorHelpers';
import { base64Decoder } from '../../../utils/convert';
import {
	AuthConfig,
	JWT,
	AuthUserPoolAndIdentityPoolConfig,
	CognitoUserPoolConfig,
	CognitoUserPoolAndIdentityPoolConfig,
	CognitoIdentityPoolConfig,
	StrictUnion,
	OAuthConfig,
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
			!!cognitoConfig.userPoolId && !!cognitoConfig.userPoolClientId;
	}

	return assert(
		assertionValid,
		AuthConfigurationErrorCode.AuthUserPoolException
	);
}

export function assertOAuthConfig(
	cognitoConfig?: AuthConfig['Cognito']
): asserts cognitoConfig is AuthConfig['Cognito'] & {
	loginWith: {
		oauth: OAuthConfig;
	};
} {
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
	const tokenParts = token.split('.');

	if (tokenParts.length !== 3) {
		throw new Error('Invalid token');
	}

	try {
		const base64WithUrlSafe = tokenParts[1];
		const base64 = base64WithUrlSafe.replace(/-/g, '+').replace(/_/g, '/');
		const jsonStr = decodeURIComponent(
			base64Decoder
				.convert(base64)
				.split('')
				.map(char => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
				.join('')
		);
		const payload = JSON.parse(jsonStr);

		return {
			toString: () => token,
			payload,
		};
	} catch (err) {
		throw new Error('Invalid token payload');
	}
}
