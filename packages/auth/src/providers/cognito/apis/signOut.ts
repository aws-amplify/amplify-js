// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Amplify,
	AuthConfig,
	LocalStorage,
	UserPoolConfig,
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
import {
	CognitoIdentityPoolConfig,
	CognitoUserPoolConfig,
	StrictUnion,
} from '@aws-amplify/core/lib-esm/singleton/Auth/types';
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
	const cognitoConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(cognitoConfig);

	if (signOutRequest?.global) {
		return globalSignOut(cognitoConfig);
	} else {
		return clientSignOut(cognitoConfig);
	}
}

async function clientSignOut(cognitoConfig: CognitoUserPoolConfig) {
	try {
		const { refreshToken, accessToken } =
			await tokenOrchestrator.tokenStore.loadTokens();

		if (isSessionRevocable(accessToken)) {
			await revokeToken(
				{
					region: getRegion(cognitoConfig.userPoolId),
				},
				{
					ClientId: cognitoConfig.userPoolClientId,
					Token: refreshToken,
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

async function globalSignOut(cognitoCognfig: CognitoUserPoolConfig) {
	try {
		const { accessToken } = await tokenOrchestrator.tokenStore.loadTokens();
		await globalSignOutClient(
			{
				region: getRegion(cognitoCognfig.userPoolId),
			},
			{
				AccessToken: accessToken.toString(),
			}
		);

		await handleOAuthSignOut(cognitoCognfig);
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

	const oauthStore = new DefaultOAuthStore(LocalStorage);
	oauthStore.setAuthConfig(cognitoConfig);
	const isOAuthSignIn = await oauthStore.loadOAuthSignIn();
	oauthStore.clearOAuthData();

	if (isOAuthSignIn) {
		oAuthSignOutRedirect(cognitoConfig);
	}
}

function oAuthSignOutRedirect(authConfig: CognitoUserPoolConfig) {
	assertOAuthConfig(authConfig);
	let oAuthLogoutEndpoint =
		'https://' + authConfig.loginWith.oauth.domain + '/logout?';

	const client_id = authConfig.userPoolClientId;

	const signout_uri = authConfig.loginWith.oauth.redirectSignOut[0];

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
