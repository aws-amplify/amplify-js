// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { UserInfo } from '../types';
import PlatformNotSupportedError from './PlatformNotSupportedError';
import {
	OnTokenReceivedHandler,
	PushNotificationPermissions,
	PushNotificationPermissionStatus,
} from './types';

export function enable(): void {
	throw new PlatformNotSupportedError();
}

export function identifyUser(
	userId: string,
	userInfo: UserInfo
): Promise<void[]> {
	throw new PlatformNotSupportedError();
}

export async function getBadgeCount(): Promise<number | null> {
	throw new PlatformNotSupportedError();
}

export function setBadgeCount(_: number): void {
	throw new PlatformNotSupportedError();
}

export async function getPermissionStatus(): Promise<PushNotificationPermissionStatus> {
	throw new PlatformNotSupportedError();
}

export async function requestPermissions(
	_?: PushNotificationPermissions
): Promise<boolean> {
	throw new PlatformNotSupportedError();
}

export function onTokenReceived(_: OnTokenReceivedHandler): any {
	throw new PlatformNotSupportedError();
}
