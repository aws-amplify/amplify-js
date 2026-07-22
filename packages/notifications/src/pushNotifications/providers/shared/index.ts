// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export {
	getBadgeCount,
	getLaunchNotification,
	getPermissionStatus,
	onNotificationOpened,
	onNotificationReceivedInBackground,
	onNotificationReceivedInForeground,
	onTokenReceived,
	requestPermissions,
	setBadgeCount,
} from './apis';
export {
	getChannelType,
	getInflightDeviceRegistration,
	rejectInflightDeviceRegistration,
	resolveInflightDeviceRegistration,
} from './utils';
export {
	ChannelType,
	GetBadgeCount,
	GetBadgeCountOutput,
	GetLaunchNotification,
	GetLaunchNotificationOutput,
	GetPermissionStatus,
	GetPermissionStatusOutput,
	InflightDeviceRegistration,
	InflightDeviceRegistrationResolver,
	InitializePushNotifications,
	OnNotificationOpened,
	OnNotificationOpenedInput,
	OnNotificationOpenedOutput,
	OnNotificationReceivedInBackground,
	OnNotificationReceivedInBackgroundInput,
	OnNotificationReceivedInBackgroundOutput,
	OnNotificationReceivedInForeground,
	OnNotificationReceivedInForegroundInput,
	OnNotificationReceivedInForegroundOutput,
	OnTokenReceived,
	OnTokenReceivedInput,
	OnTokenReceivedOutput,
	RequestPermissions,
	RequestPermissionsInput,
	RequestPermissionsOutput,
	SetBadgeCount,
	SetBadgeCountInput,
} from './types';
