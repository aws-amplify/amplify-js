// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';

import { IdentifyUserInput, RegisterDeviceInput } from './inputs';

export {
	GetBadgeCount,
	GetLaunchNotification,
	GetPermissionStatus,
	InitializePushNotifications,
	OnNotificationOpened,
	OnNotificationReceivedInBackground,
	OnNotificationReceivedInForeground,
	OnTokenReceived,
	RequestPermissions,
	SetBadgeCount,
} from '../../shared/types';

export interface IdentifyUser {
	(ctx: AmplifyContext, input: IdentifyUserInput): Promise<void>;
	(input: IdentifyUserInput): Promise<void>;
}

export interface RegisterDevice {
	(ctx: AmplifyContext, input: RegisterDeviceInput): Promise<void>;
	(input: RegisterDeviceInput): Promise<void>;
}

export interface RemoveDevice {
	(ctx: AmplifyContext): Promise<void>;
	(): Promise<void>;
}
