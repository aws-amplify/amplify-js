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
import { AuthError } from '../errors/AuthError';
import { AuthErrorCodes } from '../common/AuthErrorStrings';
import { LEGACY_KEY_PREFIX } from './constants';

export class LegacyUserPoolTokenManager implements AuthTokenManager {
	// TODO: change to config interface once defined
	private config: any;
	private storage: AuthStorage;
	private prefix: string = LEGACY_KEY_PREFIX;
	private keys: Omit<CognitoKeys<LegacyCognitoUserPoolKeys>, 'LastAuthUser'>;

	constructor(config: any, username: string, storage: AuthStorage) {
		this.config = config;
		this.storage = storage;
		const clientId = this.config.clientId;

		this.keys = getCognitoKeys(LegacyCognitoUserPoolKeys)(
			this.prefix,
			`${clientId}.${username}`
		);
	}

	private getLegacyKeys() {
		const clientId = this.config.clientId;
		// Gets LastAuthUser key without 'username' prefix
		const legacyLastAuthUserKey = `${this.prefix}.${clientId}.${LegacyCognitoUserPoolKeys.lastAuthUser}`;
		
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

		// This assertion doesn't check for lastAuthUser, clockDrift and userData
		// because these values are not migrated
		if (accessToken && refreshToken && idToken) {
			tokens.accessToken = accessToken;
			tokens.refreshToken = refreshToken;
			tokens.idToken = idToken;
			tokens.lastAuthUser = lastAuthUser!;
			tokens.clockDrift = clockDrift!;
			tokens.userData = userData!;
			return tokens;
		}

		return null;
	}
	async storeTokens(tokens: Record<string, string>): Promise<void> {
		throw new AuthError({
			name: AuthErrorCodes.AuthStorageException,
			message: 'storeTokens method is not supported',
		});
	}
	async clearTokens(): Promise<void> {
		const legacyKeyValues = this.getLegacyKeys();

		const legacyCognitoKeyPromiseArray = Object.values(legacyKeyValues).map(
			async key => this.storage.removeItem(key)
		);

		await Promise.all(legacyCognitoKeyPromiseArray);
	}
}
