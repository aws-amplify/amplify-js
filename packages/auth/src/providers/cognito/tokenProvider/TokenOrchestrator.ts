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
	armInflightDeadline,
} from '../utils/oauth/inflightPromise';
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
				// Read-time evaluation of the blocking deadline: absent flag, an
				// expired deadline, or a flag value other than 'true' all mean
				// "do not block". An abandoned flow in another tab can therefore
				// never park token consumers indefinitely.
				// (`loadOAuthInFlightDeadline` is optional on the OAuthStore
				// interface for custom-implementation compatibility, but this
				// singleton is always the concrete DefaultOAuthStore, which
				// implements it.)
				const deadline = await oAuthStore.loadOAuthInFlightDeadline();
				if (deadline === undefined) {
					return;
				}

				if (this.inflightPromise) {
					// Keep the backstop aligned with the current deadline for waiters
					// piggybacking on the existing park.
					armInflightDeadline(deadline, () =>
						oAuthStore.loadOAuthInFlightDeadline(),
					);

					return this.inflightPromise;
				}

				// when there is valid oauth config and there is an inflight oauth flow, try
				// to block async calls that require fetching tokens before the oauth flow completes
				// e.g. getCurrentUser, fetchAuthSession etc.

				this.inflightPromise = new Promise<void>(resolve => {
					// Invariant: `this.inflightPromise` is owned by the park lifecycle —
					// created here and reset by the very resolver that releases it
					// (drained by the backstop timer, the cross-tab listener, or
					// in-process completion). Resetting BEFORE resolving closes the
					// post-release hole where a caller for a NEW flow could observe a
					// stale, already-resolved promise and skip blocking on it.
					addInflightPromise(() => {
						this.inflightPromise = undefined;
						resolve();
					});
					// Arm the deadline backstop in the same synchronous step as the
					// park: it releases this waiter even when the cross-tab release
					// fired between the deadline read above and this park (that storage
					// event never re-fires), when storage events are unavailable
					// (Safari private mode), or when the flow is simply never
					// completed anywhere.
					armInflightDeadline(deadline, () =>
						oAuthStore.loadOAuthInFlightDeadline(),
					);
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
		// NOTE: `this.inflightPromise` is reset by the resolver registered in
		// `waitForInflightOAuth` (co-located with the release), NOT here — a reset
		// here could clobber a newer flow's park created between the release and
		// this line resuming.
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
			// storeTokens no longer writes the active-user pointer (LastAuthUser);
			// re-assert it for the active user so SSR cookie migration re-sets it at
			// path '/' along with the refreshed token cookies. Pointer-only: the
			// roster is never reordered on refresh.
			await this.getTokenStore().reassertActiveUserPointer(username);
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

		let cleared = false;
		let signedOutUser: { username: string; userId: string } | undefined;
		if (shouldClearTokens) {
			// Scope the clear to ONLY the failing user's namespace, drop them from
			// the roster (no promotion of a parked user) and clear the active
			// pointer. A blanket clearTokens() would remove AuthUserList and orphan
			// every other parked session (multi-session support).
			const tokenStore = this.getTokenStore();
			await tokenStore.clearTokensForUser(username);
			await tokenStore.removeSession(username);
			await tokenStore.clearActiveUser();
			cleared = true;
			signedOutUser = userId ? { username, userId } : undefined;
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

		if (cleared) {
			// emit the sign-out boundary events for the removed session (userSignedOut
			// when resolvable, then signedOut ALWAYS; never switchActiveUser). Resolve
			// everything from the pre-clear tokens; do NOT call getCurrentUser()/
			// getTokens() here as that would recurse back into token refresh. This
			// path keeps its existing credential handling (no clearCredentials call).
			await dispatchSignOutBoundaryEvents(signedOutUser);
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

	setOAuthMetadata(metadata: OAuthMetadata, username?: string): Promise<void> {
		return this.getTokenStore().setOAuthMetadata(metadata, username);
	}

	getOAuthMetadata(): Promise<OAuthMetadata | null> {
		return this.getTokenStore().getOAuthMetadata();
	}
}
