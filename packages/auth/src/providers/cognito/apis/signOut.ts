// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Amplify,
	CognitoUserPoolConfig,
	ConsoleLogger,
	clearCredentials,
	defaultStorage,
} from '@aws-amplify/core';
import {
	AuthAction,
	JWT,
	assertOAuthConfig,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';

import { getAuthUserAgentValue } from '../../../utils';
import { SignOutInput } from '../types';
import { tokenOrchestrator } from '../tokenProvider';
import { getRegionFromUserPoolId } from '../../../foundation/parsers';
import {
	assertAuthTokens,
	assertAuthTokensWithRefreshToken,
} from '../utils/types';
import { handleOAuthSignOut } from '../utils/oauth';
import { DefaultOAuthStore } from '../utils/signInWithRedirectStore';
import { dispatchSignOutBoundaryEvents } from '../utils/dispatchSignOutHubEvents';
import { AuthError } from '../../../errors/AuthError';
import { OAUTH_SIGNOUT_EXCEPTION } from '../../../errors/constants';
import {
	createGlobalSignOutClient,
	createRevokeTokenClient,
} from '../../../foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../factories';

const logger = new ConsoleLogger('Auth');

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

	let hasOAuthConfig;

	try {
		assertOAuthConfig(cognitoConfig);
		hasOAuthConfig = true;
	} catch (err) {
		hasOAuthConfig = false;
	}
	if (hasOAuthConfig) {
		const oAuthStore = new DefaultOAuthStore(defaultStorage);
		oAuthStore.setAuthConfig(cognitoConfig);
		const { type } =
			(await handleOAuthSignOut(
				cognitoConfig,
				oAuthStore,
				tokenOrchestrator,
				input?.oauth?.redirectUrl,
			)) ?? {};
		if (type === 'error') {
			throw new AuthError({
				name: OAUTH_SIGNOUT_EXCEPTION,
				message: `An error occurred when attempting to log out from OAuth provider.`,
			});
		}
	} else {
		// complete sign out
		// Resolve the signed-out user identity from STORED tokens (no refresh)
		// before any local mutation, so the boundary events can carry it.
		const tokenStore = tokenOrchestrator.getTokenStore();
		const activeUsername = await tokenStore.getLastAuthUser();
		const storedIdToken = await tokenStore.getStoredIdToken(activeUsername);
		const userId = storedIdToken?.payload?.sub as string | undefined;
		const signedOutUser = userId
			? { username: activeUsername, userId }
			: undefined;

		// No-promotion sign-out: clear the active user's namespaced tokens, drop
		// them from the roster (never promoting a parked user), then clear the
		// active pointer so getCurrentUser/fetchAuthSession read as signed-out.
		await tokenStore.clearTokensForUser(activeUsername);
		await tokenStore.removeSession(activeUsername);
		await tokenStore.clearActiveUser();
		await clearCredentials();

		// emit the shared sign-out boundary events (userSignedOut when resolvable,
		// then signedOut ALWAYS). No switchActiveUser is ever emitted.
		await dispatchSignOutBoundaryEvents(signedOutUser);
	}
}

async function clientSignOut(cognitoConfig: CognitoUserPoolConfig) {
	try {
		const { userPoolEndpoint, userPoolId, userPoolClientId } = cognitoConfig;
		const authTokens = await tokenOrchestrator.getTokenStore().loadTokens();
		assertAuthTokensWithRefreshToken(authTokens);
		if (isSessionRevocable(authTokens.accessToken)) {
			const revokeToken = createRevokeTokenClient({
				endpointResolver: createCognitoUserPoolEndpointResolver({
					endpointOverride: userPoolEndpoint,
				}),
			});

			await revokeToken(
				{
					region: getRegionFromUserPoolId(userPoolId),
					userAgentValue: getAuthUserAgentValue(AuthAction.SignOut),
				},
				{
					ClientId: userPoolClientId,
					Token: authTokens.refreshToken,
				},
			);
		}
	} catch (err) {
		// this shouldn't throw
		logger.debug(
			'Client signOut error caught but will proceed with token removal',
		);
	}
}

async function globalSignOut(cognitoConfig: CognitoUserPoolConfig) {
	try {
		const { userPoolEndpoint, userPoolId } = cognitoConfig;
		const authTokens = await tokenOrchestrator.getTokenStore().loadTokens();
		assertAuthTokens(authTokens);
		const globalSignOutClient = createGlobalSignOutClient({
			endpointResolver: createCognitoUserPoolEndpointResolver({
				endpointOverride: userPoolEndpoint,
			}),
		});
		await globalSignOutClient(
			{
				region: getRegionFromUserPoolId(userPoolId),
				userAgentValue: getAuthUserAgentValue(AuthAction.SignOut),
			},
			{
				AccessToken: authTokens.accessToken.toString(),
			},
		);
	} catch (err) {
		// it should not throw
		logger.debug(
			'Global signOut error caught but will proceed with token removal',
		);
	}
}

const isSessionRevocable = (token: JWT) => !!token?.payload?.origin_jti;
