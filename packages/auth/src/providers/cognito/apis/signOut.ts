// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Amplify,
	CognitoUserPoolConfig,
	Hub,
	clearCredentials,
	defaultStorage,
} from '@aws-amplify/core';
import { getAuthUserAgentValue, openAuthSession } from '../../../utils';
import { SignOutInput } from '../types';
import { DefaultOAuthStore } from '../utils/signInWithRedirectStore';
import { tokenOrchestrator } from '../tokenProvider';
import {
	AuthAction,
	AMPLIFY_SYMBOL,
	assertOAuthConfig,
	assertTokenProviderConfig,
	JWT,
} from '@aws-amplify/core/internals/utils';
import {
	globalSignOut as globalSignOutClient,
	revokeToken,
} from '../utils/clients/CognitoIdentityProvider';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';
import {
	assertAuthTokens,
	assertAuthTokensWithRefreshToken,
} from '../utils/types';

/**
 * Signs a user out
 *
 * @param input - The SignOutInput object
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function signOut(input?: SignOutInput): Promise<void> {
	const cognitoConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(cognitoConfig);

	if (input?.global) {
		await globalSignOut(cognitoConfig);
	} else {
		await clientSignOut(cognitoConfig);
	}

	Hub.dispatch('auth', { event: 'signedOut' }, 'Auth', AMPLIFY_SYMBOL);
}

async function clientSignOut(cognitoConfig: CognitoUserPoolConfig) {
	try {
		const authTokens = await tokenOrchestrator.getTokenStore().loadTokens();
		assertAuthTokensWithRefreshToken(authTokens);
		if (isSessionRevocable(authTokens.accessToken)) {
			await revokeToken(
				{
					region: getRegion(cognitoConfig.userPoolId),
					userAgentValue: getAuthUserAgentValue(AuthAction.SignOut),
				},
				{
					ClientId: cognitoConfig.userPoolClientId,
					Token: authTokens.refreshToken,
				}
			);
		}

		await handleOAuthSignOut(cognitoConfig);
	} catch (err) {
		// this shouldn't throw
		// TODO(v6): add logger message
	} finally {
		tokenOrchestrator.clearTokens();
		await clearCredentials();
	}
}

async function globalSignOut(cognitoConfig: CognitoUserPoolConfig) {
	try {
		const tokens = await tokenOrchestrator.getTokenStore().loadTokens();
		assertAuthTokens(tokens);
		await globalSignOutClient(
			{
				region: getRegion(cognitoConfig.userPoolId),
				userAgentValue: getAuthUserAgentValue(AuthAction.SignOut),
			},
			{
				AccessToken: tokens.accessToken.toString(),
			}
		);

		await handleOAuthSignOut(cognitoConfig);
	} catch (err) {
		// it should not throw
		// TODO(v6): add logger
	} finally {
		tokenOrchestrator.clearTokens();
		await clearCredentials();
	}
}

async function handleOAuthSignOut(cognitoConfig: CognitoUserPoolConfig) {
	try {
		assertOAuthConfig(cognitoConfig);
	} catch (err) {
		// all good no oauth handling
		return;
	}

	const oauthStore = new DefaultOAuthStore(defaultStorage);
	oauthStore.setAuthConfig(cognitoConfig);
	const { isOAuthSignIn, preferPrivateSession } =
		await oauthStore.loadOAuthSignIn();
	await oauthStore.clearOAuthData();

	if (isOAuthSignIn) {
		oAuthSignOutRedirect(cognitoConfig, preferPrivateSession);
	}
}

async function oAuthSignOutRedirect(
	authConfig: CognitoUserPoolConfig,
	preferPrivateSession: boolean
) {
	assertOAuthConfig(authConfig);

	const { loginWith, userPoolClientId } = authConfig;
	const { domain, redirectSignOut } = loginWith.oauth;
	const signoutUri = redirectSignOut[0];
	const oAuthLogoutEndpoint = `https://${domain}/logout?${Object.entries({
		client_id: userPoolClientId,
		logout_uri: encodeURIComponent(signoutUri),
	})
		.map(([k, v]) => `${k}=${v}`)
		.join('&')}`;

	// dispatchAuthEvent(
	// 	'oAuthSignOut',
	// 	{ oAuth: 'signOut' },
	// 	`Signing out from ${oAuthLogoutEndpoint}`
	// );
	// logger.debug(`Signing out from ${oAuthLogoutEndpoint}`);

	await openAuthSession(
		oAuthLogoutEndpoint,
		redirectSignOut,
		preferPrivateSession
	);
}

function isSessionRevocable(token: JWT) {
	if (token) {
		try {
			const { origin_jti } = token.payload;
			return !!origin_jti;
		} catch (err) {
			// Nothing to do, token doesnt have origin_jti claim
		}
	}

	return false;
}
