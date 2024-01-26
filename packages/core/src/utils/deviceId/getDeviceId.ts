// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO: add native impl of this
import { Cache } from '../../Cache';
import { amplifyUuid } from '../amplifyUuid';

const _localStorageKey = 'amplify-device-id';

export async function getDeviceId(): Promise<string | undefined> {
	let deviceId = (await Cache.getItem(_localStorageKey)) as string | undefined;
	if (!!deviceId) {
		return deviceId;
	}
	deviceId = amplifyUuid();
	await Cache.setItem(_localStorageKey, deviceId);
	return deviceId;
}
