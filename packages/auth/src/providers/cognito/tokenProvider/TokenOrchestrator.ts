// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	AuthConfig,
	AuthTokens,
	CognitoUserPoolConfig,
	FetchAuthSessionOptions,
	Hub,
} from '@aws-amplify/core';
import {
	AMPLIFY_SYMBOL,
	AmplifyErrorCode,
	assertTokenProviderConfig,
	isBrowser,
	isTokenExpired,
} from '@aws-amplify/core/internals/utils';

import { assertServiceError } from '../../../errors/utils/assertServiceError';
import { AuthError } from '../../../errors/AuthError';
import { oAuthStore } from '../utils/oauth/oAuthStore';
import { addInflightPromise } from '../utils/oauth/inflightPromise';
import { CognitoAuthSignInDetails } from '../types';

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
	}: {
		tokens: CognitoAuthTokens;
		username: string;
	}): Promise<CognitoAuthTokens | null> {
		try {
			const { signInDetails } = tokens;
			const newTokens = await this.getTokenRefresher()({
				tokens,
				authConfig: this.authConfig,
				username,
			});
			newTokens.signInDetails = signInDetails;
			await this.setTokens({ tokens: newTokens });
			Hub.dispatch('auth', { event: 'tokenRefresh' }, 'Auth', AMPLIFY_SYMBOL);

			return newTokens;
		} catch (err) {
			return this.handleErrors(err);
		}
	}

	private handleErrors(err: unknown) {
		assertServiceError(err);
		if (err.name !== AmplifyErrorCode.NetworkError) {
			// TODO(v6): Check errors on client
			this.clearTokens();
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

		if (err.name.startsWith('NotAuthorizedException')) {
			return null;
		}
		throw err;
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
