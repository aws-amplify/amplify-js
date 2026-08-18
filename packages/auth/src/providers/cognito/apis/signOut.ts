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
import { GetCurrentUserOutput, SignOutInput } from '../types';
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

import { getCurrentUser } from './getCurrentUser';

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
		// capture the active user before any local token/roster mutation so we can
		// emit the correct boundary events after removal.
		let active: GetCurrentUserOutput | undefined;
		try {
			active = await getCurrentUser();
		} catch {
			// no resolvable active user (e.g. tokens already gone); fall back below.
		}
		const tokenStore = tokenOrchestrator.getTokenStore();
		const activeUsername =
			active?.username ?? (await tokenStore.getLastAuthUser());

		// clear only the active user's namespaced tokens and drop them from the roster
		await tokenStore.clearTokensForUser(activeUsername);
		const removeResult = await tokenStore.removeSession(activeUsername);
		await clearCredentials();

		// emit the shared sign-out boundary events (userSignedOut, then either
		// signedOut or switchActiveUser). The promoted user's identity is resolved
		// inside the helper from stored tokens rather than via getCurrentUser().
		await dispatchSignOutBoundaryEvents(
			tokenStore,
			active ? { username: active.username, userId: active.userId } : undefined,
			removeResult,
		);
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
