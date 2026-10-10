// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	PushNotificationGetBadgeCountOutput,
	PushNotificationGetLaunchNotificationOutput,
	PushNotificationGetPermissionStatusOutput,
	PushNotificationOnNotificationOpenedOutput,
	PushNotificationOnNotificationReceivedInBackgroundOutput,
	PushNotificationOnNotificationReceivedInForegroundOutput,
	PushNotificationOnTokenReceivedOutput,
	PushNotificationRequestPermissionsOutput,
} from '../../../types';

export type GetBadgeCountOutput = PushNotificationGetBadgeCountOutput;

export type GetLaunchNotificationOutput =
	PushNotificationGetLaunchNotificationOutput;

export type GetPermissionStatusOutput =
	PushNotificationGetPermissionStatusOutput;

export type RequestPermissionsOutput = PushNotificationRequestPermissionsOutput;

export type OnNotificationOpenedOutput =
	PushNotificationOnNotificationOpenedOutput;

export type OnNotificationReceivedInBackgroundOutput =
	PushNotificationOnNotificationReceivedInBackgroundOutput;

export type OnNotificationReceivedInForegroundOutput =
	PushNotificationOnNotificationReceivedInForegroundOutput;

export type OnTokenReceivedOutput = PushNotificationOnTokenReceivedOutput;
