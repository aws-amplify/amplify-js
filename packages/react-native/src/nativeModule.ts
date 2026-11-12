// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { NativeModules, Platform } from 'react-native';

import { RTNCore } from './types';

const LINKING_ERROR =
	`The package '@aws-amplify/react-native' doesn't seem to be linked. Make sure: \n\n` +
	Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
	'- You rebuilt the app after installing the package\n' +
	'- You are not using Expo Go\n';

/**
 * Whether the `AmplifyRTNCore` native module is linked into the app. When it
 * isn't, the APIs in this package fall back to JavaScript implementations.
 */
export const isNativeModuleLinked = !!NativeModules.AmplifyRTNCore;

export const nativeModule: RTNCore = isNativeModuleLinked
	? NativeModules.AmplifyRTNCore
	: new Proxy(
			{},
			{
				get() {
					throw new Error(LINKING_ERROR);
				},
			},
		);
