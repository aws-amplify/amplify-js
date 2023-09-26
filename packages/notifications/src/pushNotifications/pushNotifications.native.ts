// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { EventListener } from '../common';
import { UserInfo } from '../types';

import {
	OnTokenReceivedHandler,
	PushNotificationPermissions,
	PushNotificationPermissionStatus,
} from './types';

import { pushNotification } from './pushNotificationsClass.native';

export function enable(): void {
	return pushNotification.enable();
}

export function identifyUser(
	userId: string,
	userInfo: UserInfo
): Promise<void> {
	return pushNotification.identifyUser(userId, userInfo);
}

export async function getBadgeCount(): Promise<number | null> {
	return pushNotification.getBadgeCount();
}

export function setBadgeCount(count: number): void {
	return pushNotification.setBadgeCount(count);
}

export async function getPermissionStatus(): Promise<PushNotificationPermissionStatus> {
	return pushNotification.getPermissionStatus();
}

export async function requestPermissions(
	permissions: PushNotificationPermissions = {
		alert: true,
		badge: true,
		sound: true,
	}
): Promise<boolean> {
	return pushNotification.requestPermissions(permissions);
}

export function onTokenReceived(
	handler: OnTokenReceivedHandler
): EventListener<OnTokenReceivedHandler> {
	return pushNotification.onTokenReceived(handler);
}
