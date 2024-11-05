// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export {
	getBadgeCount,
	GetBadgeCountOutput,
	getLaunchNotification,
	GetLaunchNotificationOutput,
	getPermissionStatus,
	GetPermissionStatusOutput,
	identifyUser,
	IdentifyUserInput,
	initializePushNotifications,
	onNotificationOpened,
	OnNotificationOpenedInput,
	OnNotificationOpenedOutput,
	onNotificationReceivedInBackground,
	OnNotificationReceivedInBackgroundInput,
	OnNotificationReceivedInBackgroundOutput,
	onNotificationReceivedInForeground,
	OnNotificationReceivedInForegroundInput,
	OnNotificationReceivedInForegroundOutput,
	onTokenReceived,
	OnTokenReceivedInput,
	OnTokenReceivedOutput,
	requestPermissions,
	RequestPermissionsInput,
	setBadgeCount,
	SetBadgeCountInput,
} from './providers/pinpoint';
export { PushNotificationMessage } from './types';
export { PushNotificationError } from './errors';
