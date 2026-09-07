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
	isOAuthInProgress,
} from '../utils/oauth/inflightPromise';
import { OAuthStorageKeys } from '../utils/types';
import { ClientMetadata, CognitoAuthSignInDetails } from '../types';

import {
	AuthTokenOrchestrator,
	AuthTokenStore,
	CognitoAuthTokens,
	DeviceMetadata,
	OAuthMetadata,
	TokenRefresher,
} from './types';

// Upper bound for how long a tab that does NOT own the inflight OAuth flow will
// block token-fetching calls (fetchAuthSession, getCurrentUser, ...) before it
// gives up waiting. The `inflightOAuth` flag lives in cross-tab shared storage,
// but the resolver that clears the wait is only invoked in the tab that
// actually processes the OAuth redirect response. This bound guarantees a tab
// that did not initiate the flow (or where the flow was abandoned) can never
// block indefinitely, while a tab that IS completing its own redirect keeps
// waiting (see the `isOAuthInProgress` re-check in `waitForInflightOAuth`).
const INFLIGHT_OAUTH_WAIT_TIMEOUT_MS = 5_000;

// Storage-key prefix used by `DefaultOAuthStore` (see `signInWithRedirectStore`).
// Must stay in sync with that store's provider name.
const OAUTH_STORAGE_KEY_PREFIX = 'CognitoIdentityServiceProvider';

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

				const inflightOAuthKey = `${OAUTH_STORAGE_KEY_PREFIX}.${this.authConfig?.Cognito?.userPoolClientId}.${OAuthStorageKeys.inflightOAuth}`;

				this.inflightPromise = new Promise<void>(resolve => {
					let settled = false;
					const cleanups: (() => void)[] = [];

					// Releases only this tab's local waiter. It intentionally does NOT
					// clear the shared `inflightOAuth`/PKCE/state, so an OAuth flow that
					// is genuinely inflight in another tab is left untouched.
					const settle = () => {
						if (settled) {
							return;
						}
						settled = true;
						cleanups.forEach(cleanup => {
							cleanup();
						});
						resolve();
					};

					// The `inflightOAuth` flag is persisted in shared (cross-tab)
					// storage, but the resolver registered below is only invoked (via
					// `resolveAndClearInflightPromises`) in the tab that processes the
					// OAuth redirect response. Without an escape hatch, a tab that did
					// not initiate the flow — the flow was started in another tab, or
					// abandoned before completion — would block forever. Resolve the
					// local waiter as soon as another tab clears this pool's shared flag
					// (e.g. sign-out, completion, or failure). An exact-key match avoids
					// reacting to other user-pool clients / tenants in the same origin.
					if (
						typeof window !== 'undefined' &&
						typeof window.addEventListener === 'function'
					) {
						const onStorage = (event: StorageEvent) => {
							if (event.key === inflightOAuthKey && event.newValue !== 'true') {
								settle();
							}
						};
						window.addEventListener('storage', onStorage);
						cleanups.push(() => {
							window.removeEventListener('storage', onStorage);
						});
					}

					// ...and, as a safety net for an abandoned flow that is never
					// cleared, after a bounded timeout. A tab that is actively
					// completing its OWN redirect (`isOAuthInProgress()`) must not give
					// up here — its `completeOAuthFlow` may legitimately take longer than
					// the bound (slow network, cold Cognito) and will settle the wait via
					// `resolveAndClearInflightPromises`. Only bystander/abandoned tabs
					// release on timeout; owning tabs re-arm and keep waiting.
					const scheduleTimeout = () => {
						const timeoutId = setTimeout(() => {
							if (isOAuthInProgress()) {
								scheduleTimeout();
							} else {
								settle();
							}
						}, INFLIGHT_OAUTH_WAIT_TIMEOUT_MS);
						cleanups.push(() => {
							clearTimeout(timeoutId);
						});
					};
					scheduleTimeout();

					// Registered last so a resolver that fires synchronously can still
					// tear down the listener and timeout created above. The returned
					// handle removes `settle` from the shared list when we resolve via
					// the timeout / storage paths, so no dead resolver is left behind.
					cleanups.push(addInflightPromise(settle));
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
