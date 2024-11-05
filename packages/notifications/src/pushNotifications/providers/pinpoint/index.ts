// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export {
	getBadgeCount,
	getLaunchNotification,
	getPermissionStatus,
	identifyUser,
	initializePushNotifications,
	onNotificationOpened,
	onNotificationReceivedInBackground,
	onNotificationReceivedInForeground,
	onTokenReceived,
	requestPermissions,
	setBadgeCount,
} from './apis';
export {
	IdentifyUserInput,
	OnNotificationOpenedInput,
	OnNotificationReceivedInBackgroundInput,
	OnNotificationReceivedInForegroundInput,
	OnTokenReceivedInput,
	RequestPermissionsInput,
	SetBadgeCountInput,
} from './types/inputs';
export {
	GetBadgeCountOutput,
	GetLaunchNotificationOutput,
	GetPermissionStatusOutput,
	OnNotificationOpenedOutput,
	OnNotificationReceivedInBackgroundOutput,
	OnNotificationReceivedInForegroundOutput,
	OnTokenReceivedOutput,
} from './types/outputs';
