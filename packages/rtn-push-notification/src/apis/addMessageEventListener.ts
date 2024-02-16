// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { EmitterSubscription } from 'react-native';
import { nativeEventEmitter } from '../nativeModule';
import { NativeMessage, PushNotificationMessage } from '../types';
import { normalizeNativeMessage } from '../utils';

export const addMessageEventListener = (
	event: string,
	listener: (
		message: PushNotificationMessage | null,
		completionHandlerId?: string,
	) => void,
): EmitterSubscription =>
	nativeEventEmitter.addListener(event, (nativeMessage: NativeMessage) => {
		listener(
			normalizeNativeMessage(nativeMessage),
			nativeMessage.completionHandlerId,
		);
	});
