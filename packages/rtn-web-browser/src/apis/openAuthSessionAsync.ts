// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AppState,
	Linking,
	NativeEventSubscription,
	Platform,
} from 'react-native';
import { nativeModule } from '../nativeModule';

let appStateListener: NativeEventSubscription | undefined;
let redirectListener: NativeEventSubscription | undefined;

export const openAuthSessionAsync = async (
	url: string,
	redirectSchemes: string[]
) => {
	// enforce HTTPS
	const httpsUrl = url.replace('http://', 'https://');
	if (Platform.OS === 'ios') {
		return nativeModule.openAuthSessionAsync(httpsUrl);
	}

	if (Platform.OS === 'android') {
		return openAuthSessionAndroid(httpsUrl, redirectSchemes);
	}
};

const openAuthSessionAndroid = async (
	url: string,
	redirectSchemes: string[]
) => {
	try {
		const [redirectUrl] = await Promise.all([
			Promise.race([
				// wait for app to redirect, resulting in a redirectUrl
				getRedirectPromise(redirectSchemes),
				// wait for app to return some other way, resulting in null
				getAppStatePromise(),
			]),
			// open chrome tab
			nativeModule.openAuthSessionAsync(url),
		]);
		return redirectUrl;
	} finally {
		appStateListener?.remove();
		redirectListener?.remove();
		appStateListener = undefined;
		redirectListener = undefined;
	}
};

const getAppStatePromise = (): Promise<null> =>
	new Promise(resolve => {
		appStateListener = AppState.addEventListener('change', nextAppState => {
			// if current state is null, the change is from initialization
			if (AppState.currentState === null) {
				return;
			}

			if (nextAppState === 'active') {
				appStateListener?.remove();
				appStateListener = undefined;
				resolve(null);
			}
		});
	});

const getRedirectPromise = (redirectSchemes: string[]): Promise<string> =>
	new Promise(resolve => {
		redirectListener = Linking.addEventListener('url', event => {
			if (redirectSchemes.some(scheme => event.url.startsWith(scheme))) {
				resolve(event.url);
			}
		});
	});
