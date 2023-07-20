import { isTokenExpired } from '.';
import { Amplify } from '../';
import {
	AuthConfig,
	AuthTokenOrchestrator,
	AuthTokenStore,
	AuthTokens,
	FetchAuthSessionOptions,
	TokenRefresher,
} from './types';

export class DefaultAuthTokensOrchestrator implements AuthTokenOrchestrator {
	tokenStore: AuthTokenStore;
	tokenRefresher: TokenRefresher;
	authConfig: AuthConfig;

	setAuthConfig(authConfig: AuthConfig) {
		this.authConfig = authConfig;
	}
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
		// TODO: how to handle if there are not tokens on tokenManager
		let tokens: AuthTokens;

		try {
			tokens = await this.tokenStore.loadTokens();

			const idTokenExpired =
				!!tokens.idToken &&
				isTokenExpired({
					expiresAt: tokens.idToken.payload.exp * 1000,
					clockDrift: tokens.clockDrift,
				});
			const accessTokenExpired = isTokenExpired({
				expiresAt: tokens.accessTokenExpAt,
				clockDrift: tokens.clockDrift,
			});

			if (options?.forceRefresh || idTokenExpired || accessTokenExpired) {
				tokens = await this.refreshTokens({
					tokens,
					tokenRefresher: this.tokenRefresher,
					authConfig: this.authConfig,
				});
			}
		} catch (err) {
			// TODO: review token handling mechanism, including exponential retry, offline, etc
			throw new Error('No session');
		}

		return { ...tokens };
	}

	private async refreshTokens({
		tokens,
		tokenRefresher,
		authConfig,
	}: {
		tokens: AuthTokens;
		tokenRefresher: TokenRefresher;
		authConfig: AuthConfig;
	}): Promise<AuthTokens> {
		try {
			const newTokens = await tokenRefresher({ tokens, authConfig });
			await Amplify.Auth.setTokens(newTokens);
			return newTokens;
		} catch (err) {
			await Amplify.Auth.clearTokens();
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
