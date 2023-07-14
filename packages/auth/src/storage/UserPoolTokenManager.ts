// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthStorage } from '@aws-amplify/core';
import { getCognitoKeys, migrateTokens } from './helpers';
import { CognitoUserPoolKey, USER_POOL_MANAGER_VERSION_KEY } from './keys';
import { CognitoUserPoolTokens, AuthTokenManager, CognitoKeys } from './types';
import { KEY_PREFIX } from './constants';
import { LegacyUserPoolTokenManager } from './LegacyUserPoolManager';

export class UserPoolTokenManager implements AuthTokenManager {
	// TODO: change to config interface once defined
	private config: any;
	storage: AuthStorage;
	private keys: CognitoKeys<CognitoUserPoolKey>;

	constructor(config: any, storage: AuthStorage) {
		this.config = config;
		this.storage = storage;
		const clientId = this.config.clientId;
		this.keys = getCognitoKeys(CognitoUserPoolKey)(KEY_PREFIX, clientId);
	}

	async loadTokens(): Promise<CognitoUserPoolTokens | null> {
		const legacyTokenManager = new LegacyUserPoolTokenManager(
			this.config,
			this.storage
		);
		await migrateTokens(
			legacyTokenManager,
			this,
			USER_POOL_MANAGER_VERSION_KEY
		);

		const accessToken = await this.storage.getItem(this.keys.accessToken);
		const refreshToken = await this.storage.getItem(this.keys.refreshToken);
		const idToken = await this.storage.getItem(this.keys.idToken);

		if (accessToken && refreshToken && idToken) {
			return {
				accessToken,
				idToken,
				refreshToken,
			};
		}

		return null;
	}

	async storeTokens(tokens: CognitoUserPoolTokens): Promise<void> {
		const { accessToken, idToken, refreshToken } = tokens;

		const items: Record<string, string> = {};

		items[this.keys.accessToken] = accessToken;
		items[this.keys.refreshToken] = refreshToken;
		items[this.keys.idToken] = idToken;

		const keyValuePairPromiseArray = Object.entries(items).map(
			async ([key, value]) => this.storage.setItem(key, value)
		);

		await Promise.all(keyValuePairPromiseArray);
	}
	async clearTokens(): Promise<void> {
		const cognitoKeyPromiseArray = Object.values(this.keys).map(async key =>
			this.storage.removeItem(key)
		);
		await Promise.all(cognitoKeyPromiseArray);
	}
}
