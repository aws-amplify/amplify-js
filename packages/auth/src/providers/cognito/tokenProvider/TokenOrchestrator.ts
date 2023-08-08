import { AmplifyV6, isTokenExpired } from '@aws-amplify/core';
import {
	AuthConfig,
	AuthTokens,
	FetchAuthSessionOptions,
} from '@aws-amplify/core';
import { AuthTokenStore, TokenRefresher } from './types';
import { tokenOrchestrator } from '.';

export class TokenOrchestrator {
	tokenStore: AuthTokenStore;
	tokenRefresher: TokenRefresher;

	setTokenRefresher(tokenRefresher: TokenRefresher) {
		this.tokenRefresher = tokenRefresher;
	}
	setAuthTokenStore(tokenStore: AuthTokenStore) {
		this.tokenStore = tokenStore;
	}
	async getTokens({
		options,
	}: {
		options?: FetchAuthSessionOptions;
	}): Promise<AuthTokens> {
		// TODO(v6): how to handle if there are not tokens on tokenManager
		let tokens: AuthTokens;

		try {
			// TODO(v6): add wait for inflight OAuth in case there is one
			tokens = await this.tokenStore.loadTokens();

			const idTokenExpired =
				!!tokens?.idToken &&
				isTokenExpired({
					expiresAt: (tokens.idToken?.payload?.exp || 0) * 1000,
					clockDrift: tokens?.clockDrift || 0,
				});
			const accessTokenExpired = isTokenExpired({
				expiresAt: tokens.accessTokenExpAt,
				clockDrift: tokens.clockDrift || 0,
			});

			if (options?.forceRefresh || idTokenExpired || accessTokenExpired) {
				tokens = await this.refreshTokens({
					tokens,
				});
			}
		} catch (err) {
			console.warn(err);
			// TODO(v6): review token handling mechanism, including exponential retry, offline, etc
			throw new Error('No session');
		}

		return { ...tokens };
	}

	private async refreshTokens({
		tokens,
	}: {
		tokens: AuthTokens;
	}): Promise<AuthTokens> {
		try {
			const authConfig = AmplifyV6.getConfig().Auth;

			const newTokens = await this.tokenRefresher({
				tokens,
				authConfig,
			});

			tokenOrchestrator.setTokens({ tokens: newTokens });
			return newTokens;
		} catch (err) {
			tokenOrchestrator.clearTokens();
			throw err;
		}
	}

	async setTokens({ tokens }: { tokens: AuthTokens }) {
		return this.tokenStore.storeTokens(tokens);
	}

	async clearTokens() {
		return this.tokenStore.clearTokens();
	}
}
