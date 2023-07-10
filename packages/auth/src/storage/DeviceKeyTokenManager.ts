// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthStorage } from '@aws-amplify/core';
import { getCognitoKeys, migrateTokens } from './helpers';
import { CognitoDeviceKey, DEVICE_KEY_MANAGER_VERSION_KEY } from './keys';
import { AuthTokenManager } from './types';
import { CognitoDeviceKeyTokens, CognitoKeys } from './types/models';
import { KEY_PREFIX } from './constants';
import { LegacyDeviceKeyTokenManager } from './LegacyDeviceKeyTokenManager';

export class DeviceKeyTokenManager implements AuthTokenManager {
	// TODO: change to config interface once defined
	private config: any;
	storage: AuthStorage;
	private prefix = KEY_PREFIX;
	private keys: CognitoKeys<CognitoDeviceKey>;
	constructor(config: any, storage: AuthStorage) {
		this.config = config;
		this.storage = storage;
		const clientId = this.config.clientId;
		this.keys = getCognitoKeys(CognitoDeviceKey)(this.prefix, clientId);
	}

	async loadTokens(): Promise<CognitoDeviceKeyTokens | null> {
		const legacyDeviceKeyTokenManager = new LegacyDeviceKeyTokenManager(
			this.config,
			this.storage
		);

		await migrateTokens(
			legacyDeviceKeyTokenManager,
			this,
			DEVICE_KEY_MANAGER_VERSION_KEY
		);
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
		const { deviceGroupKey, deviceKey, randomPasswordKey } = tokens;

		const items: Record<string, string> = {};

		items[this.keys.deviceGroupKey] = deviceGroupKey;
		items[this.keys.deviceKey] = deviceKey;
		items[this.keys.randomPasswordKey] = randomPasswordKey;

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
