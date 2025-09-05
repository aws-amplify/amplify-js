// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AppState,
	Linking,
	NativeEventSubscription,
	NativeModules,
	Platform,
} from 'react-native';

import { nativeModule } from '../nativeModule';

let appStateListener: NativeEventSubscription | undefined;
let redirectListener: NativeEventSubscription | undefined;

export async function isChromebook(): Promise<boolean> {
	// expo go
	try {
		const Device = require('expo-device');
		if (Device?.hasPlatformFeatureAsync) {
			if (await Device.hasPlatformFeatureAsync('org.chromium.arc')) return true;
			if (
				await Device.hasPlatformFeatureAsync(
					'org.chromium.arc.device_management',
				)
			)
				return true;
		}
	} catch {
		// not using Expo
	}

	// fallback to native module
	try {
		const nm = (NativeModules as any)?.ChromeOS;
		if (nm?.isChromeOS) return !!(await nm.isChromeOS());
	} catch {}

	return false;
}

export const openAuthSessionAsync = async (
	url: string,
	redirectUrls: string[],
	prefersEphemeralSession?: boolean,
) => {
	// enforce HTTPS
	const httpsUrl = url.replace('http://', 'https://');
	if (Platform.OS === 'ios') {
		return openAuthSessionIOS(httpsUrl, redirectUrls, prefersEphemeralSession);
	}

	if (Platform.OS === 'android') {
		try {
			const isChromebookRes = await isChromebook();
			if (isChromebookRes) {
				return openAuthSessionChromeOs(httpsUrl, redirectUrls);
			}
		} catch {
			// ignore and fallback to android
		}

		return openAuthSessionAndroid(httpsUrl, redirectUrls);
	}
};

const openAuthSessionIOS = async (
	url: string,
	redirectUrls: string[],
	prefersEphemeralSession = false,
) => {
	const redirectUrl = redirectUrls.find(
		// take the first non-web url as the deeplink
		item => !item.startsWith('https://') && !item.startsWith('http://'),
	);

	return nativeModule.openAuthSessionAsync(
		url,
		redirectUrl,
		prefersEphemeralSession,
	);
};

const openAuthSessionAndroid = async (url: string, redirectUrls: string[]) => {
	try {
		const [redirectUrl] = await Promise.all([
			Promise.race([
				// wait for app to redirect, resulting in a redirectUrl
				getRedirectPromise(redirectUrls),
				// wait for app to return some other way, resulting in null
				getAppStatePromise(),
			]),
			// open chrome tab
			nativeModule.openAuthSessionAsync(url),
		]);

		return redirectUrl;
	} finally {
		removeAppStateListener();
		removeRedirectListener();
	}
};

const openAuthSessionChromeOs = async (url: string, redirectUrls: string[]) => {
	try {
		const [redirectUrl] = await Promise.all([
			Promise.race([
				// wait for app to redirect, resulting in a redirectUrl
				getRedirectPromise(redirectUrls),
				// wait for app to return some other way, resulting in null
				getAppStatePromise(),
			]),
			Linking.openURL(url),
		]);

		if (redirectUrl) Linking.openURL(redirectUrl);

		return redirectUrl;
	} finally {
		removeAppStateListener();
		removeRedirectListener();
	}
};

const getAppStatePromise = (): Promise<null> =>
	new Promise(resolve => {
		// remove any stray listeners before creating new ones
		removeAppStateListener();

		let previousState = AppState.currentState;
		appStateListener = AppState.addEventListener('change', nextAppState => {
			if (previousState !== 'active' && nextAppState === 'active') {
				removeAppStateListener();
				resolve(null);
			}
			previousState = nextAppState;
		});
	});

const getRedirectPromise = (redirectUrls: string[]): Promise<string> =>
	new Promise(resolve => {
		// remove any stray listeners before creating new ones
		removeRedirectListener();

		redirectListener = Linking.addEventListener('url', event => {
			if (redirectUrls.some(url => event.url.startsWith(url))) {
				resolve(event.url);
			}
		});
	});

const removeAppStateListener = () => {
	appStateListener?.remove();
	appStateListener = undefined;
};

const removeRedirectListener = () => {
	redirectListener?.remove();
	redirectListener = undefined;
};
