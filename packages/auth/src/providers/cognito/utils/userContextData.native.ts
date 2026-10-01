// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Dimensions, Platform } from 'react-native';
import { Sha256 } from '@aws-crypto/sha256-js';
import { ConsoleLogger, defaultStorage } from '@aws-amplify/core';
import { amplifyUuid, base64Encoder } from '@aws-amplify/core/internals/utils';
import { getDeviceName } from '@aws-amplify/react-native';

import { textEncoder } from './textEncoder';

const logger = new ConsoleLogger('userContextData');

// The payload format and version identifiers must match what the Amplify
// Swift and Amplify Android libraries send, as Cognito uses the version to
// determine how to parse the payload.
const IOS_VERSION = 'IOS20171114';
const ANDROID_VERSION = 'ANDROID20171114';

const ASF_DEVICE_ID_STORAGE_KEY = 'amplify-cognito-asf-device-id';

let asfDeviceIdPromise: Promise<string> | undefined;

export async function getUserContextData({
	username,
	userPoolId,
	userPoolClientId,
}: {
	username: string;
	userPoolId: string;
	userPoolClientId: string;
}): Promise<{ EncodedData: string } | undefined> {
	const version = getVersion();
	if (!version) {
		return undefined;
	}

	try {
		const contextData = await collectContextData();
		const payload = JSON.stringify({
			contextData,
			username,
			userPoolId,
			timestamp: Date.now().toString(),
		});
		const result = JSON.stringify({
			payload,
			signature: getSignature(payload, userPoolClientId, version),
			version,
		});

		return { EncodedData: base64Encoder.convert(textEncoder.convert(result)) };
	} catch (error) {
		logger.debug('Unable to collect user context data', error);

		return undefined;
	}
}

const getVersion = () => {
	switch (Platform.OS) {
		case 'ios':
			return IOS_VERSION;
		case 'android':
			return ANDROID_VERSION;
		default:
			return undefined;
	}
};

const getSignature = (payload: string, secret: string, version: string) => {
	const hmac = new Sha256(textEncoder.convert(secret));
	hmac.update(textEncoder.convert(`${version}${payload}`));

	return base64Encoder.convert(hmac.digestSync());
};

const collectContextData = async (): Promise<Record<string, string>> => {
	const contextData: Record<string, string | undefined> = {
		DeviceId: await getAsfDeviceId(),
		ClientTimezone: getTimezoneOffset(),
		DeviceLanguage: getLocale(),
		...getPlatformData(),
	};

	if (Platform.OS === 'ios') {
		contextData.DeviceName = await getDeviceName().catch(() => undefined);
	}

	return Object.fromEntries(
		Object.entries(contextData).filter(
			(entry): entry is [string, string] => !!entry[1],
		),
	);
};

const getPlatformData = (): Record<string, string | undefined> => {
	const screen = Dimensions.get('screen');

	if (Platform.OS === 'android') {
		const { Brand, Fingerprint, Manufacturer, Model, Release } =
			Platform.constants;

		return {
			Platform: 'ANDROID',
			DeviceBrand: Brand,
			DeviceFingerprint: Fingerprint,
			DeviceManufacturer: Manufacturer,
			DeviceName: Model,
			DeviceOsReleaseVersion: Release,
			DeviceSdkVersion: String(Platform.Version),
			ScreenHeightPixels: String(Math.round(screen.height * screen.scale)),
			ScreenWidthPixels: String(Math.round(screen.width * screen.scale)),
		};
	}

	if (Platform.OS === 'ios') {
		const osVersion = String(Platform.Version);
		const buildType = __DEV__ ? 'debug' : 'release';
		const model = Platform.isPad ? 'iPad' : 'iPhone';

		return {
			Platform: 'iOS',
			PhoneType: model,
			DeviceOsReleaseVersion: osVersion,
			BuildType: buildType,
			DeviceFingerprint: `Apple/${model}/-/-:${osVersion}/-/-:-/${buildType}`,
			ScreenHeightPixels: String(Math.round(screen.height)),
			ScreenWidthPixels: String(Math.round(screen.width)),
		};
	}

	return {};
};

const getAsfDeviceId = (): Promise<string> => {
	asfDeviceIdPromise ??= loadOrCreateAsfDeviceId().catch(error => {
		asfDeviceIdPromise = undefined;
		throw error;
	});

	return asfDeviceIdPromise;
};

const loadOrCreateAsfDeviceId = async () => {
	const storedId = await defaultStorage.getItem(ASF_DEVICE_ID_STORAGE_KEY);
	if (storedId) {
		return storedId;
	}

	const id = amplifyUuid();
	await defaultStorage.setItem(ASF_DEVICE_ID_STORAGE_KEY, id);

	return id;
};

const getTimezoneOffset = () => {
	const offsetMinutes = -new Date().getTimezoneOffset();
	const sign = offsetMinutes < 0 ? '-' : '+';
	const hours = Math.floor(Math.abs(offsetMinutes) / 60);
	const minutes = Math.abs(offsetMinutes) % 60;

	return `${sign}${pad(hours)}:${pad(minutes)}`;
};

const pad = (value: number) => value.toString().padStart(2, '0');

const getLocale = () => {
	try {
		return Intl.DateTimeFormat().resolvedOptions().locale;
	} catch {
		return undefined;
	}
};
