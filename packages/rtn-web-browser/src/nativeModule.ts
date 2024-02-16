// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { NativeModules } from 'react-native';
import { LINKING_ERROR } from './constants';
import { WebBrowserNativeModule } from './types';

export const nativeModule: WebBrowserNativeModule =
	NativeModules.AmplifyRTNWebBrowser
		? NativeModules.AmplifyRTNWebBrowser
		: new Proxy(
				{},
				{
					get() {
						throw new Error(LINKING_ERROR);
					},
				},
			);
