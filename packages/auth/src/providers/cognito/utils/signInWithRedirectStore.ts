import { AuthConfig, KeyValueStorageInterface } from '@aws-amplify/core';
import { OAuthStorageKeys, OAuthStore } from './types';
import { getAuthStorageKeys } from '../tokenProvider/TokenStore';
import { assertTokenProviderConfig } from '@aws-amplify/core/lib-esm/libraryUtils';

export class DefaultOAuthStore implements OAuthStore {
	keyValueStorage: KeyValueStorageInterface;
	authConfig: AuthConfig;

	constructor(keyValueStorage: KeyValueStorageInterface) {
		this.keyValueStorage = keyValueStorage;
	}
	async clearOAuthInflightData(): Promise<void> {
		assertTokenProviderConfig(this.authConfig);

		const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure

		const authKeys = createKeysForAuthStorage(
			name,
			this.authConfig.userPoolWebClientId
		);
		await Promise.all([
			this.keyValueStorage.removeItem(authKeys.inflightOAuth),
			this.keyValueStorage.removeItem(authKeys.oauthPKCE),
			this.keyValueStorage.removeItem(authKeys.oauthState),
		]);
	}
	clearOAuthData(): Promise<void> {
		// TODO(v6): Implement this on signOut PR
		throw new Error('Method not implemented.');
	}
	loadOAuthState(): Promise<string> {
		assertTokenProviderConfig(this.authConfig);

		const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure

		const authKeys = createKeysForAuthStorage(
			name,
			this.authConfig.userPoolWebClientId
		);

		return this.keyValueStorage.getItem(authKeys.oauthState);
	}
	storeOAuthState(state: string): Promise<void> {
		assertTokenProviderConfig(this.authConfig);

		const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure

		const authKeys = createKeysForAuthStorage(
			name,
			this.authConfig.userPoolWebClientId
		);

		return this.keyValueStorage.setItem(authKeys.oauthState, state);
	}
	loadPKCE(): Promise<string> {
		assertTokenProviderConfig(this.authConfig);

		const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure

		const authKeys = createKeysForAuthStorage(
			name,
			this.authConfig.userPoolWebClientId
		);

		return this.keyValueStorage.getItem(authKeys.oauthPKCE);
	}
	storePKCE(pkce: string): Promise<void> {
		assertTokenProviderConfig(this.authConfig);

		const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure

		const authKeys = createKeysForAuthStorage(
			name,
			this.authConfig.userPoolWebClientId
		);

		return this.keyValueStorage.setItem(authKeys.oauthPKCE, pkce);
	}

	setAuthConfig(authConfigParam: AuthConfig): void {
		this.authConfig = authConfigParam;
	}
	async loadOAuthInFlight(): Promise<boolean> {
		assertTokenProviderConfig(this.authConfig);

		const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure

		const authKeys = createKeysForAuthStorage(
			name,
			this.authConfig.userPoolWebClientId
		);

		return (
			(await this.keyValueStorage.getItem(authKeys.inflightOAuth)) === 'true'
		);
	}

	async storeOAuthInFlight(inflight: boolean): Promise<void> {
		assertTokenProviderConfig(this.authConfig);

		const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure

		const authKeys = createKeysForAuthStorage(
			name,
			this.authConfig.userPoolWebClientId
		);

		return await this.keyValueStorage.setItem(
			authKeys.inflightOAuth,
			`${inflight}`
		);
	}

	async loadOAuthSignIn(): Promise<boolean> {
		assertTokenProviderConfig(this.authConfig);

		const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure

		const authKeys = createKeysForAuthStorage(
			name,
			this.authConfig.userPoolWebClientId
		);

		return (
			(await this.keyValueStorage.getItem(authKeys.oauthSignIn)) === 'true'
		);
	}
	async storeOAuthSignIn(oauthSignIn: boolean): Promise<void> {
		assertTokenProviderConfig(this.authConfig);

		const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure

		const authKeys = createKeysForAuthStorage(
			name,
			this.authConfig.userPoolWebClientId
		);

		return await this.keyValueStorage.setItem(
			authKeys.oauthSignIn,
			`${oauthSignIn}`
		);
	}
}

const createKeysForAuthStorage = (provider: string, identifier: string) => {
	return getAuthStorageKeys(OAuthStorageKeys)(
		`com.amplify.${provider}`,
		identifier
	);
};
