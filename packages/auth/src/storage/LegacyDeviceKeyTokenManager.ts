// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthStorage } from '@aws-amplify/core';
import { getCognitoKeys, getUsernameFromStorage } from './helpers';
import { CognitoDeviceKey, LegacyCognitoUserPoolKeys } from './keys';
import { AuthTokenManager } from './types';
import { CognitoDeviceKeyTokens, CognitoKeys } from './types/models';
import { AuthError } from '../errors/AuthError';
import { AuthErrorCodes } from '../common/AuthErrorStrings';
import { LEGACY_KEY_PREFIX } from './constants';

export class LegacyDeviceKeyTokenManager implements AuthTokenManager {
	// TODO: change to config interface once defined
	private config: any;
	private storage: AuthStorage;
	private clientId: string;

	constructor(config: any, storage: AuthStorage) {
		this.config = config;
		this.storage = storage;
		this.clientId = this.config.clientId;
	}

	private async getLegacyKeys(): Promise<CognitoKeys<CognitoDeviceKey>> {
		// Gets LastAuthUser key without 'username' prefix
		const lastAuthUser = `${LEGACY_KEY_PREFIX}.${this.clientId}.${LegacyCognitoUserPoolKeys.lastAuthUser}`;
		const username = await getUsernameFromStorage(this.storage, lastAuthUser);
		const keys = getCognitoKeys(CognitoDeviceKey)(
			LEGACY_KEY_PREFIX,
			`${this.clientId}.${username}`
		);

		return keys;
	}

	async loadTokens(): Promise<CognitoDeviceKeyTokens | null> {
		const keys = await this.getLegacyKeys();
		const deviceKey = await this.storage.getItem(keys.deviceKey);
		const deviceGroupKey = await this.storage.getItem(keys.deviceGroupKey);
		const randomPasswordKey = await this.storage.getItem(
			keys.randomPasswordKey
		);
		if (deviceKey && deviceGroupKey && randomPasswordKey) {
			return {
				deviceGroupKey,
				deviceKey,
				randomPasswordKey,
			};
		}
		return null;
	}

	async storeTokens(tokens: CognitoDeviceKeyTokens): Promise<void> {
		throw new AuthError({
			name: AuthErrorCodes.AuthStorageException,
			message: 'storeTokens method is not supported',
		});
	}
	async clearTokens(): Promise<void> {
		const keys = await this.getLegacyKeys();
		const cognitoKeyPromiseArray = Object.values(keys).map(async key =>
			this.storage.removeItem(key)
		);
		await Promise.all(cognitoKeyPromiseArray);
	}
}
