// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { UserPoolTokenManager } from '../../../src/storage/UserPoolTokenManager';
import { LocalStorage } from '@aws-amplify/core';
import { LegacyUserPoolTokenManager } from '../../../src/storage/LegacyUserPoolManager';
import { LegacyDeviceKeyTokenManager } from '../../../src/storage/LegacyDeviceKeyTokenManager';
import {
	cognitoUserPoolTokens,
	config,
	devicekeyTokens,
} from './testUtils/mocks';
import {
	setLegacyDeviceKeysTokens,
	setLegacyUserPoolTokens,
} from './testUtils/helpers';
import {
	AuthTokenStorageManagerVersion,
	DEVICE_KEY_MANAGER_VERSION_KEY,
	USER_POOL_MANAGER_VERSION_KEY,
} from '../../../src/storage/keys';
import { DeviceKeyTokenManager } from '../../../src/storage/DeviceKeyTokenManager';

describe('migrate legacy user pool tokens', () => {
	const userPoolManager = new UserPoolTokenManager(config, LocalStorage);

	test('user pool manager should migrate tokens on load action.', async () => {
		await setLegacyUserPoolTokens();
		expect(await userPoolManager.loadTokens()).toEqual(cognitoUserPoolTokens);
	});

	test('user pool token migration should clear legacy tokens.', async () => {
		const legacyUserPoolManager = new LegacyUserPoolTokenManager(
			config,
			LocalStorage
		);

		expect(await legacyUserPoolManager.loadTokens()).toEqual(null);
	});

	test('user pool token migration should setup a version key', async () => {
		const tokenManagerVersion = await LocalStorage.getItem(
			USER_POOL_MANAGER_VERSION_KEY
		);
		expect(tokenManagerVersion).toEqual(AuthTokenStorageManagerVersion.v1);
	});
});

describe('migrate legacy device key tokens', () => {
	const deviceKeyManager = new DeviceKeyTokenManager(config, LocalStorage);

	test('device key manager should migrate tokens on load action.', async () => {
		await setLegacyDeviceKeysTokens();
		expect(await deviceKeyManager.loadTokens()).toEqual(devicekeyTokens);
	});

	test('device key token migration should clear legacy tokens.', async () => {
		const legacyDeviceKeyManager = new LegacyDeviceKeyTokenManager(
			config,
			LocalStorage
		);

		expect(await legacyDeviceKeyManager.loadTokens()).toEqual(null);
	});

	test('device key token migration should setup a version key', async () => {
		const deviceKeytokenManagerVersion = await LocalStorage.getItem(
			DEVICE_KEY_MANAGER_VERSION_KEY
		);
		expect(deviceKeytokenManagerVersion).toEqual(
			AuthTokenStorageManagerVersion.v1
		);
	});
});
