// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AppRegistry } from 'react-native';
import { NativeMessage, PushNotificationMessage } from '~/src/types';
import { normalizeNativeMessage } from '~/src/utils';

import { getConstants } from './getConstants';

export const registerHeadlessTask = (
	task: (message: PushNotificationMessage | null) => Promise<void>,
): void => {
	const { NativeHeadlessTaskKey } = getConstants();
	if (NativeHeadlessTaskKey) {
		AppRegistry.registerHeadlessTask(
			NativeHeadlessTaskKey,
			() => async (nativeMessage: NativeMessage) => {
				await task(normalizeNativeMessage(nativeMessage));
			},
		);
	}
};
