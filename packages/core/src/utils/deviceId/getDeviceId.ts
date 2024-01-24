// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO: add native impl of this
import { Cache } from '../../Cache';
import { amplifyUuid } from '../amplifyUuid';

/**
 * Local storage key to store the device id
 */
const _localStorageKey = 'amplify-device-id';

/**
 * Utility to generate or return cached deviceId
 */
export async function getDeviceId(): Promise<string | undefined> {
	let deviceId = (await Cache.getItem(_localStorageKey)) as string | undefined;
	if (!!deviceId) {
		return deviceId;
	}
	deviceId = amplifyUuid();
	await Cache.setItem(_localStorageKey, deviceId);
	return deviceId;
}
