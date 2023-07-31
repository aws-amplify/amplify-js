// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LocalStorage } from '@aws-amplify/core';
import {
	LEGACY_KEY_PREFIX,
	getAuthStorageKeys,
} from '../../src/singleton/Auth/utils';
import {
	AuthDeviceKeys,
	AuthStorageKeys,
	LegacyAuthStorageKeys,
} from '../../src/singleton/Auth/types';
import { LegacyTokenStore } from '../../src/singleton/Auth/LegacyTokenStore';
import { DefaultTokenStore } from '../../src/singleton/Auth/TokenStore';

const clientId = '111111-aaaaa-42d8-891d-ee81a1549398';
const username = 'username';
//create a mock jwt token
const accessToken =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
	'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.' +
	'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
const refreshToken = 'XXXXXXXX';
const idToken =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
	'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.' +
	'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
const lastAuthUser = username;
const deviceGroupKey = 'XXXXXXXX';
const deviceKey = 'XXXXXXXX';
const randomPasswordKey = 'XXXXXXXX';
const clockDrift = '1';
const legacyKeys = getAuthStorageKeys({
	...LegacyAuthStorageKeys,
	...AuthDeviceKeys,
})(LEGACY_KEY_PREFIX, `${clientId}.${username}`);
const lasAuthUserKey = `${LEGACY_KEY_PREFIX}.${clientId}.${LegacyAuthStorageKeys.lastAuthUser}`;
const config = {
	userPoolWebClientId: clientId,
	userPoolId: 'us-west-2_zzzzz',
};

const authKeys = getAuthStorageKeys(AuthStorageKeys)(
	`com.amplify.Cognito`,
	clientId
);

describe('migrate legacy user pool tokens', () => {
	const legacyTokenStore = new LegacyTokenStore();
	legacyTokenStore.setAuthConfig(config);
	legacyTokenStore.setKeyValueStorage(LocalStorage);
	const tokenStore = new DefaultTokenStore();
	tokenStore.setAuthConfig(config);
	tokenStore.setKeyValueStorage(LocalStorage);

	test('set and migrate legacy user pool tokens on a single load action', async () => {
		await Promise.all([
			LocalStorage.setItem(legacyKeys.accessToken, accessToken),
			LocalStorage.setItem(legacyKeys.refreshToken, refreshToken),
			LocalStorage.setItem(legacyKeys.idToken, idToken),
			LocalStorage.setItem(lasAuthUserKey, lastAuthUser),
			LocalStorage.setItem(legacyKeys.clockDrift, clockDrift),
			LocalStorage.setItem(legacyKeys.deviceGroupKey, deviceGroupKey),
			LocalStorage.setItem(legacyKeys.deviceKey, deviceKey),
			LocalStorage.setItem(legacyKeys.randomPasswordKey, randomPasswordKey),
		]);

		const legacyTokens = await legacyTokenStore.loadTokens();
		const tokens = await tokenStore.loadTokens();
		expect(legacyTokens.toString()).toEqual(tokens.toString());
	});

	test('legacy user pool tokens should be cleared after migration', async () => {
		const legacyAccessToken = await LocalStorage.getItem(
			legacyKeys.accessToken
		);
		const legacyRefreshToken = await LocalStorage.getItem(
			legacyKeys.refreshToken
		);
		const legacyIdToken = await LocalStorage.getItem(legacyKeys.idToken);
		const legacyLastAuthUser = await LocalStorage.getItem(lasAuthUserKey);
		const legacyClockDrift = await LocalStorage.getItem(legacyKeys.clockDrift);
		const legacyDeviceGroupKey = await LocalStorage.getItem(
			legacyKeys.deviceGroupKey
		);
		const legacyDeviceKey = await LocalStorage.getItem(legacyKeys.deviceKey);
		const legacyRandomPasswordKey = await LocalStorage.getItem(
			legacyKeys.randomPasswordKey
		);
		expect(legacyAccessToken).toBeNull();
		expect(legacyRefreshToken).toBeNull();
		expect(legacyIdToken).toBeNull();
		expect(legacyLastAuthUser).toBeNull();
		expect(legacyClockDrift).toBeNull();
		expect(legacyDeviceGroupKey).toBeNull();
		expect(legacyDeviceKey).toBeNull();
		expect(legacyRandomPasswordKey).toBeNull();
	});

	test('user pool tokens should be in storage', async () => {
		const accessTokenValue = await LocalStorage.getItem(authKeys.accessToken);
		const idTokenValue = await LocalStorage.getItem(authKeys.idToken);
		const clockDriftValue = await LocalStorage.getItem(authKeys.clockDrift);
		const metadataValue = await LocalStorage.getItem(authKeys.metadata);
		const medatada = {
			deviceGroupKey,
			deviceKey,
			randomPasswordKey,
			refreshToken,
		};
		expect(accessTokenValue).toEqual(accessToken);
		expect(idTokenValue).toEqual(idToken);
		expect(clockDriftValue).toEqual(clockDrift);
		expect(metadataValue).toEqual(JSON.stringify(medatada));
	});
});
