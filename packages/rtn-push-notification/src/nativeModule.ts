// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { NativeEventEmitter, NativeModules } from 'react-native';

import { LINKING_ERROR } from './constants';
import { PushNotificationNativeModule } from './types';

export const nativeModule: PushNotificationNativeModule =
	NativeModules.AmplifyRTNPushNotification
		? NativeModules.AmplifyRTNPushNotification
		: new Proxy(
				{},
				{
					get() {
						throw new Error(LINKING_ERROR);
					},
				},
			);

export const nativeEventEmitter = new NativeEventEmitter(nativeModule);
