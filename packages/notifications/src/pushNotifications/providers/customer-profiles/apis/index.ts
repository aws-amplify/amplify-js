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
} from '../../shared/apis';
export { identifyUser } from './identifyUser';
export { initializePushNotifications } from './initializePushNotifications';
export { registerDevice } from './registerDevice';
export { removeDevice } from './removeDevice';
