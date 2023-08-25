// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Amplify,
	AuthConfig,
	LocalStorage,
	clearCredentials,
} from '@aws-amplify/core';
import { SignOutRequest } from '../../../types/requests';
import { AuthSignOutResult } from '../../../types/results';
import { DefaultOAuthStore } from '../utils/signInWithRedirectStore';
import { tokenOrchestrator } from '../tokenProvider';
import {
	assertOAuthConfig,
	assertTokenProviderConfig,
	JWT,
} from '@aws-amplify/core/internals/utils';
import {
	globalSignOut as globalSignOutClient,
	revokeToken,
} from '../utils/clients/CognitoIdentityProvider';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';
const SELF = '_self';

/**
 * Signs a user out
 *
 * @param signOutRequest - The SignOutRequest object
 * @returns AuthSignOutResult
 *
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function signOut(
	signOutRequest?: SignOutRequest
): Promise<AuthSignOutResult> {
	const authConfig = Amplify.getConfig().Auth;

	if (signOutRequest?.global) {
		return globalSignOut(authConfig);
	} else {
		return clientSignOut(authConfig);
	}
}

async function clientSignOut(authConfig: AuthConfig) {
	try {
		assertTokenProviderConfig(authConfig);

		const { refreshToken, accessToken } =
			await tokenOrchestrator.tokenStore.loadTokens();

		if (isSessionRevocable(accessToken)) {
			await revokeToken(
				{
					region: getRegion(authConfig.userPoolId),
				},
				{
					ClientId: authConfig.userPoolWebClientId,
					Token: refreshToken,
				}
			);
		}

		await handleOAuthSignOut(authConfig);
	} catch (err) {
		// this shouldn't throw
		// TODO(v6): add logger message
	} finally {
		tokenOrchestrator.clearTokens();
		await clearCredentials();
	}
}

async function globalSignOut(authConfig: AuthConfig) {
	try {
		assertTokenProviderConfig(authConfig);

		const { accessToken } = await tokenOrchestrator.tokenStore.loadTokens();
		await globalSignOutClient(
			{
				region: getRegion(authConfig.userPoolId),
			},
			{
				AccessToken: accessToken.toString(),
			}
		);

		await handleOAuthSignOut(authConfig);
	} catch (err) {
		// it should not throw
		// TODO(v6): add logger
	} finally {
		tokenOrchestrator.clearTokens();
		await clearCredentials();
	}
}

async function handleOAuthSignOut(authConfig: AuthConfig) {
	try {
		assertOAuthConfig(authConfig);
	} catch (err) {
		// all good no oauth handling
		return;
	}

	const oauthStore = new DefaultOAuthStore(LocalStorage);
	oauthStore.setAuthConfig(authConfig);
	const isOAuthSignIn = await oauthStore.loadOAuthSignIn();
	oauthStore.clearOAuthData();

	if (isOAuthSignIn) {
		oAuthSignOutRedirect(authConfig);
	}
}

function oAuthSignOutRedirect(authConfig: AuthConfig) {
	assertOAuthConfig(authConfig);
	let oAuthLogoutEndpoint = 'https://' + authConfig.oauth.domain + '/logout?';

	const client_id = authConfig.userPoolWebClientId;

	const signout_uri = authConfig.oauth.redirectSignOut;

	oAuthLogoutEndpoint += Object.entries({
		client_id,
		logout_uri: encodeURIComponent(signout_uri),
	})
		.map(([k, v]) => `${k}=${v}`)
		.join('&');

	// dispatchAuthEvent(
	// 	'oAuthSignOut',
	// 	{ oAuth: 'signOut' },
	// 	`Signing out from ${oAuthLogoutEndpoint}`
	// );
	// logger.debug(`Signing out from ${oAuthLogoutEndpoint}`);

	window.open(oAuthLogoutEndpoint, SELF);
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
