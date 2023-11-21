// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { EmitterSubscription } from 'react-native';
import { nativeEventEmitter } from '~/src/nativeModule';
import { NativeMessage, PushNotificationMessage } from '~/src/types';
import { normalizeNativeMessage } from '~/src/utils';

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
