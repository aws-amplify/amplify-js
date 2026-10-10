// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { amplifyUuid } from '@aws-amplify/core/internals/utils';
import { loadAsyncStorage } from '@aws-amplify/react-native';

const DEVICE_ID_STORAGE_KEY =
	'@aws-amplify/notifications/customer-profiles/deviceId';

// In-module cache of the in-flight (and, once settled, resolved) deviceId
// resolution. Lives for the lifetime of the JS module instance (the app
// session): created on first call, shared by all later calls, and naturally
// discarded on app reload/restart (the persisted AsyncStorage value is then
// re-read). Never invalidated at runtime on success because the per-install
// deviceId is immutable; cleared on failure so a transient storage error does
// not permanently wedge subsequent calls.
let deviceIdPromise: Promise<string> | undefined;

const resolveOrCreateDeviceId = async (): Promise<string> => {
	const asyncStorage = loadAsyncStorage();
	const stored = await asyncStorage.getItem(DEVICE_ID_STORAGE_KEY);
	if (stored) {
		return stored;
	}

	const deviceId = amplifyUuid();
	await asyncStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);

	return deviceId;
};

/**
 * Resolves a stable, per-install device identifier used as the UNIQUE key for
 * the device object registered with Amazon Connect Customer Profiles. Because
 * the backend upserts the device object by this `deviceId`, it MUST be stable
 * across launches and token refreshes so a refreshed token replaces the same
 * device object rather than creating a duplicate.
 *
 * The id is generated once (UUID v4) and persisted to AsyncStorage; subsequent
 * calls return the persisted value. The resolution is memoized as a single
 * in-flight promise, so concurrent first-calls share one resolution and cannot
 * each generate and persist a different id.
 *
 * @internal
 */
export const getDeviceId = (): Promise<string> => {
	if (!deviceIdPromise) {
		deviceIdPromise = resolveOrCreateDeviceId().catch(error => {
			deviceIdPromise = undefined;
			throw error;
		});
	}

	return deviceIdPromise;
};
