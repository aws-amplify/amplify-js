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
	registerDevice,
	removeDevice,
	requestPermissions,
	setBadgeCount,
} from './apis';
export {
	IdentifyUserInput,
	OnNotificationOpenedInput,
	OnNotificationReceivedInBackgroundInput,
	OnNotificationReceivedInForegroundInput,
	OnTokenReceivedInput,
	RegisterDeviceInput,
	RequestPermissionsInput,
	SetBadgeCountInput,
	UserProfile,
	UserProfileLocation,
} from './types';
export {
	GetBadgeCountOutput,
	GetLaunchNotificationOutput,
	GetPermissionStatusOutput,
	OnNotificationOpenedOutput,
	OnNotificationReceivedInBackgroundOutput,
	OnNotificationReceivedInForegroundOutput,
	OnTokenReceivedOutput,
} from './types/outputs';
