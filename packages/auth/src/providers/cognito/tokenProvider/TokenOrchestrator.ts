import {
	AmplifyV6,
	isTokenExpired,
	AuthTokens,
	FetchAuthSessionOptions,
} from '@aws-amplify/core';
import { AuthTokenStore, CognitoAuthTokens, TokenRefresher } from './types';
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

	async getTokens(options?: FetchAuthSessionOptions): Promise<AuthTokens> {
		// TODO(v6): how to handle if there are not tokens on tokenManager
		let tokens: CognitoAuthTokens;

		try {
			// TODO(v6): add wait for inflight OAuth in case there is one
			tokens = await this.tokenStore.loadTokens();

			const idTokenExpired =
				!!tokens?.idToken &&
				isTokenExpired({
					expiresAt: (tokens.idToken?.payload?.exp || 0) * 1000,
					clockDrift: tokens.clockDrift || 0,
				});
			const accessTokenExpired = isTokenExpired({
				expiresAt: (tokens.accessToken?.payload?.exp || 0) * 1000,
				clockDrift: tokens.clockDrift || 0,
			});

			if (options?.forceRefresh || idTokenExpired || accessTokenExpired) {
				tokens = await this.refreshTokens({
					tokens,
				});
			}
		} catch (err) {
			// TODO(v6): review token handling mechanism, including exponential retry, offline, etc
			throw new Error('No session');
		}

		return {
			accessToken: tokens?.accessToken,
			idToken: tokens?.idToken,
		};
	}

	private async refreshTokens({
		tokens,
	}: {
		tokens: CognitoAuthTokens;
	}): Promise<CognitoAuthTokens> {
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

	async setTokens({ tokens }: { tokens: CognitoAuthTokens }) {
		return this.tokenStore.storeTokens(tokens);
	}

	async clearTokens() {
		return this.tokenStore.clearTokens();
	}
}
