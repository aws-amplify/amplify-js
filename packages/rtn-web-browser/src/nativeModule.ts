// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { NativeModules, Platform } from 'react-native';
import { WebBrowserNativeModule } from './types';

const LINKING_ERROR =
	`The package '@aws-amplify/rtn-web-browser' doesn't seem to be linked. Make sure: \n\n` +
	Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
	'- You rebuilt the app after installing the package\n' +
	'- You are not using Expo Go\n';

export const nativeModule: WebBrowserNativeModule =
	NativeModules.AmplifyRTNWebBrowser
		? NativeModules.AmplifyRTNWebBrowser
		: new Proxy(
				{},
				{
					get() {
						throw new Error(LINKING_ERROR);
					},
				}
		  );
