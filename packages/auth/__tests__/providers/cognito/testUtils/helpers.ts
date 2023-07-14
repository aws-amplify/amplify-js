// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LocalStorage } from '@aws-amplify/core';
import { LEGACY_KEY_PREFIX } from '../../../../src/storage/constants';
import { getCognitoKeys } from '../../../../src/storage/helpers';
import {
	CognitoDeviceKey,
	LegacyCognitoUserPoolKeys,
} from '../../../../src/storage/keys';
import {
	clientId,
	idToken,
	refreshToken,
	accessToken,
	username,
	clockDrift,
	deviceGroupKey,
	deviceKey,
	randomPasswordKey,
	userData,
} from './mocks';

export async function setLegacyUserPoolTokens(): Promise<void> {
	const keys = getCognitoKeys(LegacyCognitoUserPoolKeys)(
		LEGACY_KEY_PREFIX,
		`${clientId}.${username}`
	);

	await LocalStorage.setItem(keys.idToken, idToken);
	await LocalStorage.setItem(keys.refreshToken, refreshToken);
	await LocalStorage.setItem(keys.accessToken, accessToken);
	await LocalStorage.setItem(
		`${LEGACY_KEY_PREFIX}.${clientId}.${LegacyCognitoUserPoolKeys.lastAuthUser}`,
		username
	);
	await LocalStorage.setItem(keys.clockDrift, clockDrift);
	await LocalStorage.setItem(keys.userData, userData);
}

export async function setLegacyDeviceKeysTokens(): Promise<void> {
	const keys = getCognitoKeys(CognitoDeviceKey)(
		LEGACY_KEY_PREFIX,
		`${clientId}.${username}`
	);

	await LocalStorage.setItem(
		`${LEGACY_KEY_PREFIX}.${clientId}.${LegacyCognitoUserPoolKeys.lastAuthUser}`,
		username
	);
	await LocalStorage.setItem(keys.deviceGroupKey, deviceGroupKey);
	await LocalStorage.setItem(keys.deviceKey, deviceKey);
	await LocalStorage.setItem(keys.randomPasswordKey, randomPasswordKey);
}
