// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { base64Decoder } from '../../../utils/convert';
import { StrictUnion } from '../../../types';
import {
	AuthConfig,
	CognitoIdentityPoolConfig,
	CognitoUserPoolAndIdentityPoolConfig,
	CognitoUserPoolConfig,
	JWT,
	OAuthConfig,
} from '../types';

import { AuthConfigurationErrorCode, assert } from './errorHelpers';

export function assertTokenProviderConfig(
	cognitoConfig?: StrictUnion<
		| CognitoUserPoolConfig
		| CognitoUserPoolAndIdentityPoolConfig
		| CognitoIdentityPoolConfig
	>,
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

	assert(assertionValid, AuthConfigurationErrorCode.AuthUserPoolException);
}

export function assertOAuthConfig(
	cognitoConfig?: AuthConfig['Cognito'],
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

	assert(
		validOAuthConfig,
		AuthConfigurationErrorCode.OAuthNotConfigureException,
	);
}
export function assertIdentityPoolIdConfig(
	cognitoConfig?: StrictUnion<
		| CognitoUserPoolConfig
		| CognitoUserPoolAndIdentityPoolConfig
		| CognitoIdentityPoolConfig
	>,
): asserts cognitoConfig is CognitoIdentityPoolConfig {
	const validConfig = !!cognitoConfig?.identityPoolId;

	assert(
		validConfig,
		AuthConfigurationErrorCode.InvalidIdentityPoolIdException,
	);
}

/**
 * Decodes payload of JWT token
 *
 * @param {String} token A string representing a token to be decoded
 * @throws {@link Error} - Throws error when token is invalid or payload malformed.
 */
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
				.join(''),
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
