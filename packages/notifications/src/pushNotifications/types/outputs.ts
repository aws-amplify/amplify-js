// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { EventListenerRemover } from '../../eventListeners';
import {
	PushNotificationMessage,
	PushNotificationPermissionStatus,
} from '../types';

export type PushNotificationGetBadgeCountOutput = number | null;

export type PushNotificationGetLaunchNotificationOutput =
	PushNotificationMessage | null;

export type PushNotificationGetPermissionStatusOutput =
	PushNotificationPermissionStatus;

export type PushNotificationRequestPermissionsOutput = boolean;

export type PushNotificationOnNotificationOpenedOutput = EventListenerRemover;

export type PushNotificationOnNotificationReceivedInBackgroundOutput =
	EventListenerRemover;

export type PushNotificationOnNotificationReceivedInForegroundOutput =
	EventListenerRemover;

export type PushNotificationOnTokenReceivedOutput = EventListenerRemover;
