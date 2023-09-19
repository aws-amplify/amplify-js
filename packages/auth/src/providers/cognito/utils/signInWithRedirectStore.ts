// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	CognitoUserPoolConfig,
	KeyValueStorageInterface,
} from '@aws-amplify/core';
import { OAuthStorageKeys, OAuthStore } from './types';
import { getAuthStorageKeys } from '../tokenProvider/TokenStore';
import { assertTokenProviderConfig } from '@aws-amplify/core/internals/utils';

export class DefaultOAuthStore implements OAuthStore {
	keyValueStorage: KeyValueStorageInterface;
	cognitoConfig?: CognitoUserPoolConfig;

	constructor(keyValueStorage: KeyValueStorageInterface) {
		this.keyValueStorage = keyValueStorage;
	}
	async clearOAuthInflightData(): Promise<void> {
		assertTokenProviderConfig(this.cognitoConfig);

		const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure

		const authKeys = createKeysForAuthStorage(
			name,
			this.cognitoConfig.userPoolClientId
		);
		await Promise.all([
			this.keyValueStorage.removeItem(authKeys.inflightOAuth),
			this.keyValueStorage.removeItem(authKeys.oauthPKCE),
			this.keyValueStorage.removeItem(authKeys.oauthState),
		]);
	}
	async clearOAuthData(): Promise<void> {
		const name = 'Cognito';
		assertTokenProviderConfig(this.cognitoConfig);
		const authKeys = createKeysForAuthStorage(
			name,
			this.cognitoConfig.userPoolClientId
		);
		await this.clearOAuthInflightData();
		this.keyValueStorage.removeItem(authKeys.oauthSignIn);
	}
	loadOAuthState(): Promise<string | null> {
		assertTokenProviderConfig(this.cognitoConfig);

		const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure

		const authKeys = createKeysForAuthStorage(
			name,
			this.cognitoConfig.userPoolClientId
		);

		return this.keyValueStorage.getItem(authKeys.oauthState);
	}
	storeOAuthState(state: string): Promise<void> {
		assertTokenProviderConfig(this.cognitoConfig);

		const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure

		const authKeys = createKeysForAuthStorage(
			name,
			this.cognitoConfig.userPoolClientId
		);

		return this.keyValueStorage.setItem(authKeys.oauthState, state);
	}
	loadPKCE(): Promise<string | null> {
		assertTokenProviderConfig(this.cognitoConfig);

		const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure

		const authKeys = createKeysForAuthStorage(
			name,
			this.cognitoConfig.userPoolClientId
		);

		return this.keyValueStorage.getItem(authKeys.oauthPKCE);
	}
	storePKCE(pkce: string): Promise<void> {
		assertTokenProviderConfig(this.cognitoConfig);

		const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure

		const authKeys = createKeysForAuthStorage(
			name,
			this.cognitoConfig.userPoolClientId
		);

		return this.keyValueStorage.setItem(authKeys.oauthPKCE, pkce);
	}

	setAuthConfig(authConfigParam: CognitoUserPoolConfig): void {
		this.cognitoConfig = authConfigParam;
	}
	async loadOAuthInFlight(): Promise<boolean> {
		assertTokenProviderConfig(this.cognitoConfig);

		const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure

		const authKeys = createKeysForAuthStorage(
			name,
			this.cognitoConfig.userPoolClientId
		);

		return (
			(await this.keyValueStorage.getItem(authKeys.inflightOAuth)) === 'true'
		);
	}

	async storeOAuthInFlight(inflight: boolean): Promise<void> {
		assertTokenProviderConfig(this.cognitoConfig);

		const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure

		const authKeys = createKeysForAuthStorage(
			name,
			this.cognitoConfig.userPoolClientId
		);

		return await this.keyValueStorage.setItem(
			authKeys.inflightOAuth,
			`${inflight}`
		);
	}

	async loadOAuthSignIn(): Promise<boolean> {
		assertTokenProviderConfig(this.cognitoConfig);

		const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure

		const authKeys = createKeysForAuthStorage(
			name,
			this.cognitoConfig.userPoolClientId
		);

		const isOAuthSignIn = await this.keyValueStorage.getItem(
			authKeys.oauthSignIn
		);

		return isOAuthSignIn === 'true';
	}

	async storeOAuthSignIn(oauthSignIn: boolean): Promise<void> {
		assertTokenProviderConfig(this.cognitoConfig);

		const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure

		const authKeys = createKeysForAuthStorage(
			name,
			this.cognitoConfig.userPoolClientId
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
