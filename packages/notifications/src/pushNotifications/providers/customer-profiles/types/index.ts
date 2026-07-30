// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export {
	GetBadgeCount,
	GetLaunchNotification,
	GetPermissionStatus,
	IdentifyUser,
	InitializePushNotifications,
	OnNotificationOpened,
	OnNotificationReceivedInBackground,
	OnNotificationReceivedInForeground,
	OnTokenReceived,
	RegisterDevice,
	RemoveDevice,
	RequestPermissions,
	SetBadgeCount,
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
} from './inputs';
export {
	GetLaunchNotificationOutput,
	GetPermissionStatusOutput,
	OnNotificationOpenedOutput,
	OnNotificationReceivedInBackgroundOutput,
	OnNotificationReceivedInForegroundOutput,
	OnTokenReceivedOutput,
} from './outputs';
export {
	ChannelType,
	InflightDeviceRegistration,
	InflightDeviceRegistrationResolver,
	UserProfile,
	UserProfileLocation,
} from './pushNotifications';
