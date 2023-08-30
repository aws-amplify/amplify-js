// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AuthConfig,
	AuthTokens,
	UserPoolConfig,
	CognitoUserPoolConfig,
} from '@aws-amplify/core';
import { AuthError } from '../../../errors/AuthError';
import { CognitoAuthTokens } from '../tokenProvider/types';

export function isTypeUserPoolConfig(
	authConfig?: AuthConfig
): authConfig is UserPoolConfig {
	if (
		authConfig &&
		authConfig.Cognito.userPoolId &&
		authConfig.Cognito.userPoolClientId
	) {
		return true;
	}

	return false;
}

export function assertAuthTokens(
	tokens?: AuthTokens | null
): asserts tokens is AuthTokens {
	if (!tokens || !tokens.accessToken) {
		throw new AuthError({
			name: 'Invalid Auth Tokens',
			message: 'No Auth Tokens were found',
		});
	}
}

export function assertAuthTokensWithRefreshToken(
	tokens?: CognitoAuthTokens | null
): asserts tokens is CognitoAuthTokens & { refreshToken: string } {
	if (!tokens || !tokens.accessToken || !tokens.refreshToken) {
		throw new AuthError({
			name: 'Invalid Cognito Auth Tokens',
			message: 'No Cognito Auth Tokens were found',
		});
	}
}

export const OAuthStorageKeys = {
	inflightOAuth: 'inflightOAuth',
	oauthSignIn: 'oauthSignIn',
	oauthPKCE: 'oauthPKCE',
	oauthState: 'oauthState',
};

export interface OAuthStore {
	setAuthConfig(authConfigParam: CognitoUserPoolConfig): void;
	loadOAuthInFlight(): Promise<boolean>;
	storeOAuthInFlight(inflight: boolean): Promise<void>;
	loadOAuthSignIn(): Promise<boolean>;
	storeOAuthSignIn(oauthSignIn: boolean): Promise<void>;
	loadOAuthState(): Promise<string | null>;
	storeOAuthState(state: string): Promise<void>;
	loadPKCE(): Promise<string | null>;
	storePKCE(pkce: string): Promise<void>;
	clearOAuthInflightData(): Promise<void>;
	clearOAuthData(): Promise<void>;
}
