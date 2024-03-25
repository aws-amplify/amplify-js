// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	addMessageEventListener,
	addTokenEventListener,
	completeNotification,
	getBadgeCount,
	getConstants,
	getLaunchNotification,
	getPermissionStatus,
	registerHeadlessTask,
	requestPermissions,
	setBadgeCount,
} from './apis';

export {
	PushNotificationMessage,
	PushNotificationPermissionStatus,
	PushNotificationPermissions,
} from './types';

const module = {
	addMessageEventListener,
	addTokenEventListener,
	completeNotification,
	getBadgeCount,
	getConstants,
	getLaunchNotification,
	getPermissionStatus,
	registerHeadlessTask,
	requestPermissions,
	setBadgeCount,
};

export type PushNotificationModule = typeof module;
export { module };
