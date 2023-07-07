// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { UserPoolTokenManager } from '../../../src/storage/UserPoolTokenManager';
import { LocalStorage } from '@aws-amplify/core';
import { LegacyUserPoolTokenManager } from '../../../src/storage/LegacyUserPoolManager';
import { AuthError } from '../../../src/errors/AuthError';
import { AuthErrorCodes } from '../../../src/common/AuthErrorStrings';
import { getCognitoKeys } from '../../../src/storage/helpers';
import {
	CognitoDeviceKey,
	LegacyCognitoUserPoolKeys,
} from '../../../src/storage/keys';
import { LegacyDeviceKeyTokenManager } from '../../../src/storage/LegacyDeviceKeyTokenManager';
import { KEY_PREFIX, LEGACY_KEY_PREFIX } from '../../../src/storage/constants';
import {
	accessToken,
	clientId,
	clockDrift,
	cognitoUserPoolTokens,
	config,
	deviceGroupKey,
	deviceKey,
	devicekeyTokens,
	idToken,
	randomPasswordKey,
	refreshToken,
	userData,
	username,
} from './testUtils/mocks';

describe('test userpool token manager', () => {
	const userPoolManager = new UserPoolTokenManager(config, LocalStorage);

	beforeEach(async () => {
		await userPoolManager.storeTokens(cognitoUserPoolTokens);
	});
	afterEach(async () => {
		await userPoolManager.clearTokens();
	});

	test('user pool manager should load tokens ', async () => {
		expect(await userPoolManager.loadTokens()).toEqual(cognitoUserPoolTokens);
	});

	test('user pool manager should return null if there are no tokens in storage ', async () => {
		await userPoolManager.clearTokens();

		expect(await userPoolManager.loadTokens()).toEqual(null);
	});

	test('user pool token manager should store tokens with a scoped key', async () => {
		const key = `${KEY_PREFIX}.${clientId}.idToken`;

		expect(await LocalStorage.getItem(key)).toEqual(idToken);
	});
});

describe('test legacy userpool token manager', () => {
	const keys = getCognitoKeys(LegacyCognitoUserPoolKeys)(
		LEGACY_KEY_PREFIX,
		`${clientId}.${username}`
	);

	// set legacy tokens first
	beforeEach(async () => {
		// set user pool tokens
		await LocalStorage.setItem(keys.idToken, idToken);
		await LocalStorage.setItem(keys.refreshToken, refreshToken);
		await LocalStorage.setItem(keys.accessToken, accessToken);
		await LocalStorage.setItem(
			`${LEGACY_KEY_PREFIX}.${clientId}.LastAuthUser`,
			username
		);
		await LocalStorage.setItem(keys.clockDrift, clockDrift);
		await LocalStorage.setItem(keys.userData, userData);
	});

	afterEach(async () => {
		await LocalStorage.clear();
	});

	const legacyUserPoolManager = new LegacyUserPoolTokenManager(
		config,
		username,
		LocalStorage
	);
	test('legacy userpool manager should not allow to set tokens', async () => {
		try {
			await legacyUserPoolManager.storeTokens(cognitoUserPoolTokens);
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthErrorCodes.AuthStorageException);
		}
	});

	test('legacy user pool manager should load tokens ', async () => {
		expect(await legacyUserPoolManager.loadTokens()).toEqual({
			...cognitoUserPoolTokens,
			clockDrift,
			userData,
			lastAuthUser: username,
		});
	});

	test('legacyuser pool manager should return null if there are no tokens in storage ', async () => {
		await legacyUserPoolManager.clearTokens();

		expect(await legacyUserPoolManager.loadTokens()).toEqual(null);
	});
});

describe('test legacy device key token manager', () => {
	const legacyKeys = getCognitoKeys(CognitoDeviceKey)(
		LEGACY_KEY_PREFIX,
		`${clientId}.${username}`
	);

	beforeEach(async () => {
		// set legacy device key tokens first
		await LocalStorage.setItem(legacyKeys.deviceGroupKey, deviceGroupKey);
		await LocalStorage.setItem(legacyKeys.deviceKey, deviceKey);
		await LocalStorage.setItem(legacyKeys.randomPasswordKey, randomPasswordKey);
	});

	afterEach(async () => {
		await LocalStorage.clear();
	});

	const legacyDeviceKeyManager = new LegacyDeviceKeyTokenManager(
		config,
		LocalStorage,
		username
	);
	test('legacy device key manager should not allow to set tokens', async () => {
		try {
			await legacyDeviceKeyManager.storeTokens(devicekeyTokens);
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthErrorCodes.AuthStorageException);
		}
	});

	test('legacy device key manager should load tokens ', async () => {
		expect(await legacyDeviceKeyManager.loadTokens()).toEqual(devicekeyTokens);
	});

	test('legacy device key manager should return null if there are no tokens in storage ', async () => {
		await legacyDeviceKeyManager.clearTokens();

		expect(await legacyDeviceKeyManager.loadTokens()).toEqual(null);
	});
});
