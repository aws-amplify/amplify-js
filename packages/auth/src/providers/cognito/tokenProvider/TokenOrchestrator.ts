// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	AuthConfig,
	AuthTokens,
	ClientMetadataProvider,
	CognitoUserPoolConfig,
	FetchAuthSessionOptions,
	Hub,
} from '@aws-amplify/core';
import {
	AMPLIFY_SYMBOL,
	assertTokenProviderConfig,
	isBrowser,
	isTokenExpired,
} from '@aws-amplify/core/internals/utils';

import { assertServiceError } from '../../../errors/utils/assertServiceError';
import { AuthError } from '../../../errors/AuthError';
import { oAuthStore } from '../utils/oauth/oAuthStore';
import { addInflightPromise } from '../utils/oauth/inflightPromise';
import { dispatchSignOutBoundaryEvents } from '../utils/dispatchSignOutHubEvents';
import { ClientMetadata, CognitoAuthSignInDetails } from '../types';

import {
	AuthTokenOrchestrator,
	AuthTokenStore,
	CognitoAuthTokens,
	DeviceMetadata,
	OAuthMetadata,
	TokenRefresher,
} from './types';

export class TokenOrchestrator implements AuthTokenOrchestrator {
	private authConfig?: AuthConfig;
	clientMetadataProvider?: ClientMetadataProvider;
	tokenStore?: AuthTokenStore;
	tokenRefresher?: TokenRefresher;
	inflightPromise: Promise<void> | undefined;
	waitForInflightOAuth: () => Promise<void> = isBrowser()
		? async () => {
				if (!(await oAuthStore.loadOAuthInFlight())) {
					return;
				}

				if (this.inflightPromise) {
					return this.inflightPromise;
				}

				// when there is valid oauth config and there is an inflight oauth flow, try
				// to block async calls that require fetching tokens before the oauth flow completes
				// e.g. getCurrentUser, fetchAuthSession etc.

				this.inflightPromise = new Promise<void>((resolve, _reject) => {
					addInflightPromise(resolve);
				});

				return this.inflightPromise;
			}
		: async () => {
				// no-op for non-browser environments
			};

	setAuthConfig(authConfig: AuthConfig) {
		oAuthStore.setAuthConfig(authConfig.Cognito as CognitoUserPoolConfig);
		this.authConfig = authConfig;
	}

	setTokenRefresher(tokenRefresher: TokenRefresher) {
		this.tokenRefresher = tokenRefresher;
	}

	setAuthTokenStore(tokenStore: AuthTokenStore) {
		this.tokenStore = tokenStore;
	}

	getTokenStore(): AuthTokenStore {
		if (!this.tokenStore) {
			throw new AuthError({
				name: 'EmptyTokenStoreException',
				message: 'TokenStore not set',
			});
		}

		return this.tokenStore;
	}

	getTokenRefresher(): TokenRefresher {
		if (!this.tokenRefresher) {
			throw new AuthError({
				name: 'EmptyTokenRefresherException',
				message: 'TokenRefresher not set',
			});
		}

		return this.tokenRefresher;
	}

	setClientMetadataProvider(
		clientMetadataProvider: ClientMetadataProvider,
	): void {
		this.clientMetadataProvider = clientMetadataProvider;
	}

	async getTokens(
		options?: FetchAuthSessionOptions,
	): Promise<
		(AuthTokens & { signInDetails?: CognitoAuthSignInDetails }) | null
	> {
		let tokens: CognitoAuthTokens | null;

		try {
			assertTokenProviderConfig(this.authConfig?.Cognito);
		} catch (_err) {
			// Token provider not configured
			return null;
		}
		await this.waitForInflightOAuth();
		this.inflightPromise = undefined;
		tokens = await this.getTokenStore().loadTokens();
		const username = await this.getTokenStore().getLastAuthUser();

		if (tokens === null) {
			return null;
		}
		const idTokenExpired =
			!!tokens?.idToken &&
			isTokenExpired({
				expiresAt: (tokens.idToken?.payload?.exp ?? 0) * 1000,
				clockDrift: tokens.clockDrift ?? 0,
			});
		const accessTokenExpired = isTokenExpired({
			expiresAt: (tokens.accessToken?.payload?.exp ?? 0) * 1000,
			clockDrift: tokens.clockDrift ?? 0,
		});

		if (options?.forceRefresh || idTokenExpired || accessTokenExpired) {
			tokens = await this.refreshTokens({
				tokens,
				username,
				clientMetadata:
					options?.clientMetadata ?? (await this.clientMetadataProvider?.()),
			});

			if (tokens === null) {
				return null;
			}
		}

		return {
			accessToken: tokens?.accessToken,
			idToken: tokens?.idToken,
			signInDetails: tokens?.signInDetails,
		};
	}

	private async refreshTokens({
		tokens,
		username,
		clientMetadata,
	}: {
		tokens: CognitoAuthTokens;
		username: string;
		clientMetadata?: ClientMetadata;
	}): Promise<CognitoAuthTokens | null> {
		try {
			const { signInDetails } = tokens;
			const newTokens = await this.getTokenRefresher()({
				tokens,
				authConfig: this.authConfig,
				username,
				clientMetadata,
			});
			newTokens.signInDetails = signInDetails;
			await this.setTokens({ tokens: newTokens });
			const userId = newTokens.idToken?.payload?.sub;
			Hub.dispatch(
				'auth',
				{
					event: 'tokenRefresh',
					data: userId ? { username, userId: userId as string } : undefined,
				},
				'Auth',
				AMPLIFY_SYMBOL,
			);

			return newTokens;
		} catch (err) {
			// capture the failing user's id (from the pre-clear tokens) so the
			// boundary events can carry it before the namespace is removed.
			const userId = tokens.idToken?.payload?.sub as string | undefined;

			return this.handleErrors(err, username, userId);
		}
	}

	private async handleErrors(
		err: unknown,
		username: string,
		userId?: string,
	): Promise<CognitoAuthTokens | null> {
		assertServiceError(err);

		// Only clear tokens for definitive authentication failures
		// Do NOT clear tokens for transient errors like service issues, rate limits, etc.
		const shouldClearTokens = this.isAuthenticationError(err);

		let removeResult: { newActiveUser?: string; isEmpty: boolean } | undefined;
		if (shouldClearTokens) {
			// Scope the clear to ONLY the failing user's namespace and drop them
			// from the roster. A blanket clearTokens() would remove AuthUserList and
			// orphan every other parked session (multi-session support).
			const tokenStore = this.getTokenStore();
			await tokenStore.clearTokensForUser(username);
			removeResult = await tokenStore.removeSession(username);
		}

		Hub.dispatch(
			'auth',
			{
				event: 'tokenRefresh_failure',
				data: { error: err },
			},
			'Auth',
			AMPLIFY_SYMBOL,
		);

		if (removeResult) {
			// emit the sign-out boundary events for the removed/promoted session.
			// Resolve everything from stored tokens; do NOT call getCurrentUser()/
			// getTokens() here as that would recurse back into token refresh.
			await dispatchSignOutBoundaryEvents(
				this.getTokenStore(),
				userId ? { username, userId } : undefined,
				removeResult,
			);
		}

		if (err.name.startsWith('NotAuthorizedException')) {
			return null;
		}
		throw err;
	}

	private isAuthenticationError(err: any): boolean {
		// Only clear tokens for errors that definitively indicate the tokens are invalid
		// and re-authentication is required. All other errors (service errors, rate limits, etc.)
		// should preserve the tokens to allow for retry.
		// See: https://github.com/aws-amplify/amplify-js/issues/14534
		const authErrorNames = [
			'NotAuthorizedException', // Refresh token is expired or invalid
			'TokenRevokedException', // Token was revoked by admin
			'UserNotFoundException', // User no longer exists
			'PasswordResetRequiredException', // User must reset password
			'UserNotConfirmedException', // User account is not confirmed
			'RefreshTokenReuseException', // Refresh token invalidated by rotation
		];

		return authErrorNames.some(errorName => err?.name?.startsWith?.(errorName));
	}

	async setTokens({ tokens }: { tokens: CognitoAuthTokens }) {
		return this.getTokenStore().storeTokens(tokens);
	}

	async clearTokens() {
		return this.getTokenStore().clearTokens();
	}

	getDeviceMetadata(username?: string): Promise<DeviceMetadata | null> {
		return this.getTokenStore().getDeviceMetadata(username);
	}

	clearDeviceMetadata(username?: string): Promise<void> {
		return this.getTokenStore().clearDeviceMetadata(username);
	}

	setOAuthMetadata(metadata: OAuthMetadata): Promise<void> {
		return this.getTokenStore().setOAuthMetadata(metadata);
	}

	getOAuthMetadata(): Promise<OAuthMetadata | null> {
		return this.getTokenStore().getOAuthMetadata();
	}
}
