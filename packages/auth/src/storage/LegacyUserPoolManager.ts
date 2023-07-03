// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthStorage } from '@aws-amplify/core';
import { getCognitoKeys } from './helpers';
import { LegacyCognitoUserPoolKeys } from './keys';
import {
	AuthTokenManager,
	CognitoKeys,
	LegacyCognitoUserPoolTokens,
} from './types';

export class LegacyUserPoolTokenManager implements AuthTokenManager {
	private username: string;
	private config: any;
	private storage: AuthStorage;
	private legacyPrefix: string;
	private keys: Omit<CognitoKeys<LegacyCognitoUserPoolKeys>, 'LastAuthUser'>;

	constructor(config: any, username: string, storage: AuthStorage) {
		this.username = username;
		this.config = config;
		this.storage = storage;
		const clientId = this.config.clientId;
		this.keys = getCognitoKeys(LegacyCognitoUserPoolKeys)(
			this.legacyPrefix,
			this.username
		);
		this.legacyPrefix = `CognitoIdentityServiceProvider.${clientId}`;
	}

	getLegacyKeys() {
		// Gets LastAuthUser key without 'username' prefix
		const legacyLastAuthUserKey = `${this.legacyPrefix}.${LegacyCognitoUserPoolKeys.lastAuthUser}`;

		return { ...this.keys, lastAuthUser: legacyLastAuthUserKey };
	}

	async loadTokens(): Promise<LegacyCognitoUserPoolTokens | null> {
		const legacyKeyValues = this.getLegacyKeys();
		const tokens = {} as LegacyCognitoUserPoolTokens;

		const accessToken = await this.storage.getItem(legacyKeyValues.accessToken);
		const refreshToken = await this.storage.getItem(
			legacyKeyValues.refreshToken
		);
		const clockDrift = await this.storage.getItem(legacyKeyValues.clockDrift);
		const idToken = await this.storage.getItem(legacyKeyValues.idToken);
		const lastAuthUser = await this.storage.getItem(
			legacyKeyValues.lastAuthUser
		);
		const userData = await this.storage.getItem(legacyKeyValues.userData);

		if (
			accessToken &&
			refreshToken &&
			clockDrift &&
			idToken &&
			lastAuthUser &&
			userData
		) {
			tokens.accessToken = accessToken;
			tokens.refreshToken = refreshToken;
			tokens.idToken = idToken;
			tokens.lastAuthUser = lastAuthUser;
			tokens.clockDrift = clockDrift;
			tokens.userData = userData;
			return tokens;
		}

		return null;
	}
	async storeTokens(tokens: Record<string, string>): Promise<void> {
		throw new Error(`storeTokens method is not supported on ${this}`);
	}
	async clearTokens(): Promise<void> {
		const legacyKeyValues = this.getLegacyKeys();

		const legacyCognitoKeyPromiseArray = Object.values(legacyKeyValues).map(
			async key => this.storage.removeItem(key)
		);

		await Promise.all(legacyCognitoKeyPromiseArray);
	}
}
