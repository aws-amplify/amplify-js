// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	CognitoUserPoolConfig,
	KeyValueStorageInterface,
} from '@aws-amplify/core';
import { OAuthStorageKeys, OAuthStore } from './types';
import { getAuthStorageKeys } from '../tokenProvider/TokenStore';
import { assertTokenProviderConfig } from '@aws-amplify/core/internals/utils';

const V5_HOSTED_UI_KEY = 'amplify-signin-with-hostedUI';

const name = 'CognitoIdentityServiceProvider';
export class DefaultOAuthStore implements OAuthStore {
	keyValueStorage: KeyValueStorageInterface;
	cognitoConfig?: CognitoUserPoolConfig;

	constructor(keyValueStorage: KeyValueStorageInterface) {
		this.keyValueStorage = keyValueStorage;
	}
	async clearOAuthInflightData(): Promise<void> {
		assertTokenProviderConfig(this.cognitoConfig);

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
		assertTokenProviderConfig(this.cognitoConfig);
		const authKeys = createKeysForAuthStorage(
			name,
			this.cognitoConfig.userPoolClientId
		);
		await this.clearOAuthInflightData();
		await this.keyValueStorage.removeItem(V5_HOSTED_UI_KEY); // remove in case a customer migrated an App from v5 to v6
		return this.keyValueStorage.removeItem(authKeys.oauthSignIn);
	}
	loadOAuthState(): Promise<string | null> {
		assertTokenProviderConfig(this.cognitoConfig);

		const authKeys = createKeysForAuthStorage(
			name,
			this.cognitoConfig.userPoolClientId
		);

		return this.keyValueStorage.getItem(authKeys.oauthState);
	}
	storeOAuthState(state: string): Promise<void> {
		assertTokenProviderConfig(this.cognitoConfig);

		const authKeys = createKeysForAuthStorage(
			name,
			this.cognitoConfig.userPoolClientId
		);

		return this.keyValueStorage.setItem(authKeys.oauthState, state);
	}
	loadPKCE(): Promise<string | null> {
		assertTokenProviderConfig(this.cognitoConfig);

		const authKeys = createKeysForAuthStorage(
			name,
			this.cognitoConfig.userPoolClientId
		);

		return this.keyValueStorage.getItem(authKeys.oauthPKCE);
	}
	storePKCE(pkce: string): Promise<void> {
		assertTokenProviderConfig(this.cognitoConfig);

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
		const authKeys = createKeysForAuthStorage(
			name,
			this.cognitoConfig.userPoolClientId
		);

		return await this.keyValueStorage.setItem(
			authKeys.inflightOAuth,
			`${inflight}`
		);
	}

	async loadOAuthSignIn(): Promise<{
		isOAuthSignIn: boolean;
		preferPrivateSession: boolean;
	}> {
		assertTokenProviderConfig(this.cognitoConfig);

		const authKeys = createKeysForAuthStorage(
			name,
			this.cognitoConfig.userPoolClientId
		);

		const isLegacyHostedUISignIn =
			await this.keyValueStorage.getItem(V5_HOSTED_UI_KEY);

		const [isOAuthSignIn, preferPrivateSession] =
			(await this.keyValueStorage.getItem(authKeys.oauthSignIn))?.split(',') ??
			[];

		return {
			isOAuthSignIn:
				isOAuthSignIn === 'true' || isLegacyHostedUISignIn === 'true',
			preferPrivateSession: preferPrivateSession === 'true',
		};
	}

	async storeOAuthSignIn(
		oauthSignIn: boolean,
		preferPrivateSession: boolean = false
	): Promise<void> {
		assertTokenProviderConfig(this.cognitoConfig);

		const authKeys = createKeysForAuthStorage(
			name,
			this.cognitoConfig.userPoolClientId
		);

		return await this.keyValueStorage.setItem(
			authKeys.oauthSignIn,
			`${oauthSignIn},${preferPrivateSession}`
		);
	}
}

const createKeysForAuthStorage = (provider: string, identifier: string) => {
	return getAuthStorageKeys(OAuthStorageKeys)(provider, identifier);
};
