import { AmplifyV6, AuthConfig, LocalStorage } from '@aws-amplify/core';
import { SignOutRequest } from '../../../types/requests';
import { AuthSignOutResult } from '../../../types/results';
import { DefaultOAuthStore } from '../utils/signInWithRedirectStore';
import { tokenOrchestrator } from '../tokenProvider';
import {
	assertOAuthConfig,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';
import {
	globalSignOut,
	revokeToken,
} from '../utils/clients/CognitoIdentityProvider';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';
import { JWT } from '@aws-amplify/core/lib-esm/singleton/Auth/types';
import { AuthError } from '../../../errors/AuthError';
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
	if (signOutRequest?.global) {
		return globalSignOutHandler();
	} else {
		return clientSignOut();
	}
}

async function clientSignOut() {
	const authConfig = AmplifyV6.getConfig().Auth;

	try {
		const { refreshToken, accessToken } =
			await tokenOrchestrator.tokenStore.loadTokens();
		if (isSessionRevocable(accessToken)) {
			await revokeTokens({
				region: getRegion(authConfig.userPoolId),
				clientId: authConfig.userPoolWebClientId,
				token: refreshToken,
			});
		}

		await handleOAuthSignOut(authConfig);
		const oauthStore = new DefaultOAuthStore(LocalStorage);
		oauthStore.setAuthConfig(authConfig);
		if (authConfig.oauth && oauthStore.loadOAuthSignIn()) {
			oAuthSignOutRedirect(authConfig);
		}
	} catch (err) {
		throw new AuthError({
			message: 'SignOut error',
			name: 'SignOutError',
			underlyingError: err,
		});
	} finally {
		tokenOrchestrator.clearTokens();
	}
}

async function globalSignOutHandler() {
	const authConfig = AmplifyV6.getConfig().Auth;

	try {
		assertTokenProviderConfig(authConfig);
		const { accessToken } = await tokenOrchestrator.tokenStore.loadTokens();
		await globalSignOut(
			{
				region: getRegion(authConfig.userPoolId),
			},
			{
				AccessToken: accessToken.toString(),
			}
		);

		tokenOrchestrator.clearTokens();

		await handleOAuthSignOut(authConfig);
		const oauthStore = new DefaultOAuthStore(LocalStorage);
		oauthStore.setAuthConfig(authConfig);
		if (authConfig.oauth && oauthStore.loadOAuthSignIn()) {
			oAuthSignOutRedirect(authConfig);
		}
	} catch (err) {
		throw new AuthError({
			message: 'SignOut error',
			name: 'SignOutError',
			underlyingError: err,
		});
	} finally {
		tokenOrchestrator.clearTokens();
	}
}

function handleOAuthSignOut(authConfig: AuthConfig) {
	try {
		assertOAuthConfig(authConfig);
	} catch (err) {
		// all good no oauth handling
		return;
	}
	oAuthSignOutRedirect(authConfig);
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

async function revokeTokens({
	region,
	token,
	clientId,
}: {
	region: string;
	token: string;
	clientId: string;
}) {
	// this will invoke the API that revoke Cognito refresh token
	await revokeToken(
		{
			region,
		},
		{
			ClientId: clientId,
			Token: token,
		}
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
