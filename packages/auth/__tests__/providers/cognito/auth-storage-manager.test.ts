// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { UserPoolTokenManager } from '../../../src/storage/UserPoolTokenManager';
import { LocalStorage } from '@aws-amplify/core';
import { LegacyUserPoolTokenManager } from '../../../src/storage/LegacyUserPoolManager';
import { AuthError } from '../../../src/errors/AuthError';
import { AuthErrorCodes } from '../../../src/common/AuthErrorStrings';
import { LegacyDeviceKeyTokenManager } from '../../../src/storage/LegacyDeviceKeyTokenManager';
import { KEY_PREFIX } from '../../../src/storage/constants';
import {
	clientId,
	clockDrift,
	cognitoUserPoolTokens,
	config,
	devicekeyTokens,
	idToken,
	userData,
	username,
} from './testUtils/mocks';
import {
	setLegacyDeviceKeysTokens,
	setLegacyUserPoolTokens,
} from './testUtils/helpers';

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
	const legacyUserPoolManager = new LegacyUserPoolTokenManager(
		config,
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
		await setLegacyUserPoolTokens();
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
	const legacyDeviceKeyManager = new LegacyDeviceKeyTokenManager(
		config,
		LocalStorage
	);
	test('legacy device key manager should not allow to set tokens', async () => {
		try {
			await legacyDeviceKeyManager.storeTokens(devicekeyTokens);
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthErrorCodes.AuthStorageException);
		}
	});

	test('legacy device key manager should load tokens', async () => {
		await setLegacyDeviceKeysTokens();
		expect(await legacyDeviceKeyManager.loadTokens()).toEqual(devicekeyTokens);
	});

	test('legacy device key manager should return null if there are no tokens in storage ', async () => {
		await legacyDeviceKeyManager.clearTokens();

		expect(await legacyDeviceKeyManager.loadTokens()).toEqual(null);
	});
});
