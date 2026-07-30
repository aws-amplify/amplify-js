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
import {
	addInflightPromise,
	resolveAndClearInflightPromises,
} from '../utils/oauth/inflightPromise';
import { ClientMetadata, CognitoAuthSignInDetails } from '../types';

import {
	AuthTokenOrchestrator,
	AuthTokenStore,
	CognitoAuthTokens,
	DeviceMetadata,
	OAuthMetadata,
	TokenRefresher,
} from './types';

/**
 * Upper bound for how long token fetching may be blocked by an inflight OAuth
 * flow. Some platforms (e.g. a dismissed native "Sign in with Apple" sheet on
 * iOS Safari) provide no reliable cancellation signal, which would otherwise
 * leave the inflight flag set forever and hang every subsequent auth call.
 * See https://github.com/aws-amplify/amplify-js/issues/14900
 */
const INFLIGHT_OAUTH_TIMEOUT_MS = 60_000;

export class TokenOrchestrator implements AuthTokenOrchestrator {
	private authConfig?: AuthConfig;
	/**
	 * Incremented every time a new inflight OAuth wait is armed. A pending
	 * timeout captures the value current at arming time so a stale timer can
	 * never clear the inflight state of a flow that started after it.
	 */
	private inflightOAuthGeneration = 0;
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

				const generation = ++this.inflightOAuthGeneration;

				this.inflightPromise = new Promise<void>(resolve => {
					let settled = false;
					let timeoutId: ReturnType<typeof setTimeout> | undefined;

					addInflightPromise(() => {
						settled = true;
						if (timeoutId !== undefined) {
							clearTimeout(timeoutId);
							timeoutId = undefined;
						}
						resolve();
					});

					if (settled) {
						return;
					}

					timeoutId = setTimeout(() => {
						timeoutId = undefined;

						if (settled) {
							return;
						}

						if (generation !== this.inflightOAuthGeneration) {
							// a newer flow owns the inflight state, so never touch it; still
							// settle this superseded promise so its callers cannot hang
							resolve();

							return;
						}

						const clearAndSettle = async () => {
							try {
								await oAuthStore.clearOAuthInflightData();
							} finally {
								if (!settled && generation === this.inflightOAuthGeneration) {
									resolveAndClearInflightPromises();
								}
								resolve();
							}
						};
						clearAndSettle().catch(() => undefined);
					}, INFLIGHT_OAUTH_TIMEOUT_MS);
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
			Hub.dispatch('auth', { event: 'tokenRefresh' }, 'Auth', AMPLIFY_SYMBOL);

			return newTokens;
		} catch (err) {
			return this.handleErrors(err);
		}
	}

	private handleErrors(err: unknown) {
		assertServiceError(err);

		// Only clear tokens for definitive authentication failures
		// Do NOT clear tokens for transient errors like service issues, rate limits, etc.
		const shouldClearTokens = this.isAuthenticationError(err);

		if (shouldClearTokens) {
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
