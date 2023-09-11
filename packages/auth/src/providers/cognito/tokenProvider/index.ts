// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	AuthConfig,
	AuthTokens,
	FetchAuthSessionOptions,
	KeyValueStorageInterface,
	defaultStorage,
} from '@aws-amplify/core';
import { DefaultTokenStore } from './TokenStore';
import { TokenOrchestrator } from './TokenOrchestrator';
import { CognitoUserPoolTokenRefresher } from '../apis/tokenRefresher';
import { CognitoUserPoolTokenProviderType } from './types';

class CognitoUserPoolsTokenProviderClass
	implements CognitoUserPoolTokenProviderType
{
	authTokenStore: DefaultTokenStore;
	tokenOrchestrator: TokenOrchestrator;
	constructor() {
		this.authTokenStore = new DefaultTokenStore();
		this.authTokenStore.setKeyValueStorage(defaultStorage);
		this.tokenOrchestrator = new TokenOrchestrator();
		this.tokenOrchestrator.setAuthTokenStore(this.authTokenStore);
		this.tokenOrchestrator.setTokenRefresher(CognitoUserPoolTokenRefresher);
	}
	getTokens(
		{ forceRefresh }: FetchAuthSessionOptions = { forceRefresh: false }
	): Promise<AuthTokens | null> {
		return this.tokenOrchestrator.getTokens({ forceRefresh });
	}

	setKeyValueStorage(keyValueStorage: KeyValueStorageInterface): void {
		this.authTokenStore.setKeyValueStorage(keyValueStorage);
	}
	setWaitForInflightOAuth(waitForInflightOAuth: () => Promise<void>): void {
		this.tokenOrchestrator.setWaitForInflightOAuth(waitForInflightOAuth);
	}
	setAuthConfig(authConfig: AuthConfig) {
		this.authTokenStore.setAuthConfig(authConfig);
		this.tokenOrchestrator.setAuthConfig(authConfig);
	}
}

export const CognitoUserPoolsTokenProvider =
	new CognitoUserPoolsTokenProviderClass();

export const tokenOrchestrator =
	CognitoUserPoolsTokenProvider.tokenOrchestrator;

export {
	CognitoUserPoolTokenProviderType,
	TokenOrchestrator,
	DefaultTokenStore,
	CognitoUserPoolTokenRefresher,
};
