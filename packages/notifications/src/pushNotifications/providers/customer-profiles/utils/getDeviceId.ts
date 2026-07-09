// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { amplifyUuid } from '@aws-amplify/core/internals/utils';
import { loadAsyncStorage } from '@aws-amplify/react-native';

const DEVICE_ID_STORAGE_KEY =
	'@aws-amplify/notifications/customer-profiles/deviceId';

let cachedDeviceId: string | undefined;

/**
 * Resolves a stable, per-install device identifier used as the UNIQUE key for
 * the device object registered with Amazon Connect Customer Profiles. Because
 * the backend upserts the device object by this `deviceId`, it MUST be stable
 * across launches and token refreshes so a refreshed token replaces the same
 * device object rather than creating a duplicate.
 *
 * The id is generated once (UUID v4) and persisted to AsyncStorage; subsequent
 * calls return the persisted value. An in-module cache avoids repeated storage
 * reads within a single app session.
 *
 * @internal
 */
export const getDeviceId = async (): Promise<string> => {
	if (cachedDeviceId) {
		return cachedDeviceId;
	}

	const asyncStorage = loadAsyncStorage();
	const stored = await asyncStorage.getItem(DEVICE_ID_STORAGE_KEY);
	if (stored) {
		cachedDeviceId = stored;

		return stored;
	}

	const deviceId = amplifyUuid();
	await asyncStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
	cachedDeviceId = deviceId;

	return deviceId;
};
