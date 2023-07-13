// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthStorage } from '@aws-amplify/core';
import { getCognitoKeys, getUsernameFromStorage } from './helpers';
import { LegacyCognitoUserPoolKeys } from './keys';
import {
	AuthTokenManager,
	LegacyCognitoUserPoolTokens,
} from './types';
import { AuthError } from '../errors/AuthError';
import { AuthErrorCodes } from '../common/AuthErrorStrings';
import { LEGACY_KEY_PREFIX } from './constants';

export class LegacyUserPoolTokenManager implements AuthTokenManager {
	// TODO: change to config interface once defined
	private config: any;
	private storage: AuthStorage;

	private clientId: string;

	constructor(config: any, storage: AuthStorage) {
		this.config = config;
		this.storage = storage;
		this.clientId = this.config.clientId;
	}

	private async getLegacyKeys(): Promise<LegacyCognitoUserPoolTokens> {
		// Gets LastAuthUser key without 'username' prefix
		const lastAuthUser = `${LEGACY_KEY_PREFIX}.${this.clientId}.${LegacyCognitoUserPoolKeys.lastAuthUser}`;
		const username = await getUsernameFromStorage(this.storage, lastAuthUser);
		const keys = getCognitoKeys(LegacyCognitoUserPoolKeys)(
			LEGACY_KEY_PREFIX,
			`${this.clientId}.${username}`
		);

		return { ...keys, lastAuthUser };
	}

	async loadTokens(): Promise<LegacyCognitoUserPoolTokens | null> {
		const legacyKeyValues = await this.getLegacyKeys();

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
			return {
				accessToken,
				refreshToken,
				idToken,
				lastAuthUser: lastAuthUser!,
				clockDrift: clockDrift!,
				userData: userData!,
			};
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
		const keys = await this.getLegacyKeys();

		const legacyCognitoKeyPromiseArray = Object.values(keys).map(async key =>
			this.storage.removeItem(key)
		);

		await Promise.all(legacyCognitoKeyPromiseArray);
	}
}
