import { isTokenExpired } from '.';
import { AmplifyV6 } from '../';
import { asserts } from '../../Util/errors/AssertError';
import {
	AuthConfig,
	AuthTokenOrchestrator,
	AuthTokenStore,
	AuthTokens,
	FetchAuthSessionOptions,
	TokenRefresher,
} from './types';
import { assertsTokenStore } from './utils';

export class DefaultAuthTokensOrchestrator implements AuthTokenOrchestrator {
	tokenStore?: AuthTokenStore;
	tokenRefresher?: TokenRefresher;
	authConfig?: AuthConfig;

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
		// TODO(v6): how to handle if there are not tokens on tokenManager
		let tokens: AuthTokens;
		assertsTokenStore(this.tokenStore);
		try {
			// TODO(v6): add wait for inflight OAuth in case there is one
			tokens = await this.tokenStore.loadTokens();

			// TODO: handle case where idToken and clockDrift are null
			const idTokenExpired =
				!!tokens.idToken &&
				isTokenExpired({
					expiresAt: tokens.idToken.payload.exp! * 1000,
					clockDrift: tokens.clockDrift!,
				});
			const accessTokenExpired = isTokenExpired({
				expiresAt: tokens.accessTokenExpAt,
				clockDrift: tokens.clockDrift!,
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

		return { ...tokens };
	}

	private async refreshTokens({
		tokens,
	}: {
		tokens: AuthTokens;
	}): Promise<AuthTokens> {
		try {
			asserts(!(this.tokenRefresher === undefined), {
				name: 'TokenRefresherException',
				message: 'TokenRefresher is undefined',
			});

			const newTokens = await this.tokenRefresher({
				tokens,
				authConfig: this.authConfig,
			});
			await AmplifyV6.Auth.setTokens(newTokens);
			return newTokens;
		} catch (err) {
			await AmplifyV6.Auth.clearTokens();
			throw err;
		}
	}

	async setTokens({ tokens }: { tokens: AuthTokens }) {
		assertsTokenStore(this.tokenStore);
		return this.tokenStore.storeTokens(tokens);
	}

	async clearTokens() {
		assertsTokenStore(this.tokenStore);
		return this.tokenStore.clearTokens();
	}
}
