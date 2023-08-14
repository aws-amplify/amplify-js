import {
	AmplifyV6,
	isTokenExpired,
	AuthTokens,
	FetchAuthSessionOptions,
} from '@aws-amplify/core';
import {
	AuthTokenOrchestrator,
	AuthTokenStore,
	CognitoAuthTokens,
	TokenRefresher,
} from './types';
import { tokenOrchestrator } from '.';

export class TokenOrchestrator implements AuthTokenOrchestrator {
	tokenStore: AuthTokenStore;
	tokenRefresher: TokenRefresher;

	setTokenRefresher(tokenRefresher: TokenRefresher) {
		this.tokenRefresher = tokenRefresher;
	}
	setAuthTokenStore(tokenStore: AuthTokenStore) {
		this.tokenStore = tokenStore;
	}

	async getTokens(
		options?: FetchAuthSessionOptions
	): Promise<AuthTokens | null> {
		let tokens: CognitoAuthTokens;

		// TODO(v6): add wait for inflight OAuth in case there is one
		tokens = await this.tokenStore.loadTokens();

		if (tokens === null) {
			return null;
		}
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

			if (tokens === null) {
				return null;
			}
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
	}): Promise<CognitoAuthTokens | null> {
		try {
			const authConfig = AmplifyV6.getConfig().Auth;

			const newTokens = await this.tokenRefresher({
				tokens,
				authConfig,
			});

			tokenOrchestrator.setTokens({ tokens: newTokens });
			return newTokens;
		} catch (err) {
			return this.handleErrors(err);
		}
	}

	private handleErrors(err: Error) {
		if (err.message !== 'Network error') {
			// TODO(v6): Check errors on client
			tokenOrchestrator.clearTokens();
		}
		if (err.name.startsWith('NotAuthorizedException')) {
			return null;
		} else {
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
