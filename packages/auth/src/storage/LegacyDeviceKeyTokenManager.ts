// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthStorage } from '@aws-amplify/core';
import { getCognitoKeys } from './helpers';
import { CognitoDeviceKey } from './keys';
import { AuthTokenManager } from './types';
import { CognitoDeviceKeyTokens, CognitoKeys } from './types/models';
import { AuthError } from '../errors/AuthError';
import { AuthErrorCodes } from '../common/AuthErrorStrings';
import { LEGACY_KEY_PREFIX } from './constants';

export class LegacyDeviceKeyTokenManager implements AuthTokenManager {
	// TODO: change to config interface once defined
	private config: any;
	private storage: AuthStorage;
	private prefix: string = LEGACY_KEY_PREFIX;
	private keys: CognitoKeys<CognitoDeviceKey>;
	constructor(config: any, storage: AuthStorage, username: string) {
		this.config = config;
		this.storage = storage;
		const clientId = this.config.clientId;
		this.keys = getCognitoKeys(CognitoDeviceKey)(
			this.prefix,
			`${clientId}.${username}`
		);
	}

	async loadTokens(): Promise<CognitoDeviceKeyTokens | null> {
		const tokens = {} as CognitoDeviceKeyTokens;

		const deviceKey = await this.storage.getItem(this.keys.deviceKey);
		const deviceGroupKey = await this.storage.getItem(this.keys.deviceGroupKey);
		const randomPasswordKey = await this.storage.getItem(
			this.keys.randomPasswordKey
		);
		if (deviceKey && deviceGroupKey && randomPasswordKey) {
			tokens.deviceGroupKey = deviceGroupKey;
			tokens.deviceKey = deviceKey;
			tokens.randomPasswordKey = randomPasswordKey;
			return tokens;
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
		const cognitoKeyPromiseArray = Object.values(this.keys).map(async key =>
			this.storage.removeItem(key)
		);
		await Promise.all(cognitoKeyPromiseArray);
	}
}
