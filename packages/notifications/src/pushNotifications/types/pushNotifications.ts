// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PushNotificationMessage } from '@aws-amplify/react-native';
export type {
	PushNotificationMessage,
	PushNotificationPermissionStatus,
	PushNotificationPermissions,
} from '@aws-amplify/react-native';

export type OnTokenReceivedHandler = (token: string) => void;

export type OnPushNotificationMessageHandler = (
	message: PushNotificationMessage
) => void;

export type PushNotificationEvent =
	| 'backgroundMessageReceived'
	| 'foregroundMessageReceived'
	| 'launchNotificationsOpened'
	| 'notificationOpened'
	| 'tokenReceived';
