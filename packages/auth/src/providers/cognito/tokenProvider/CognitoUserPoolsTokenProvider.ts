// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AuthConfig,
	AuthTokens,
	FetchAuthSessionOptions,
	KeyValueStorageInterface,
	defaultStorage,
} from '@aws-amplify/core';

import { refreshAuthTokens } from '../utils/refreshAuthTokens';

import { DefaultTokenStore } from './TokenStore';
import { TokenOrchestrator } from './TokenOrchestrator';
import { CognitoUserPoolTokenProviderType } from './types';

export class CognitoUserPoolsTokenProvider
	implements CognitoUserPoolTokenProviderType
{
	authTokenStore: DefaultTokenStore;
	tokenOrchestrator: TokenOrchestrator;
	constructor() {
		this.authTokenStore = new DefaultTokenStore();
		this.authTokenStore.setKeyValueStorage(defaultStorage);
		this.tokenOrchestrator = new TokenOrchestrator();
		this.tokenOrchestrator.setAuthTokenStore(this.authTokenStore);
		this.tokenOrchestrator.setTokenRefresher(refreshAuthTokens);
	}

	getTokens(
		{ forceRefresh }: FetchAuthSessionOptions = { forceRefresh: false },
	): Promise<AuthTokens | null> {
		return this.tokenOrchestrator.getTokens({ forceRefresh });
	}

	setKeyValueStorage(keyValueStorage: KeyValueStorageInterface): void {
		this.authTokenStore.setKeyValueStorage(keyValueStorage);
	}

	setAuthConfig(authConfig: AuthConfig) {
		this.authTokenStore.setAuthConfig(authConfig);
		this.tokenOrchestrator.setAuthConfig(authConfig);
	}
}
