// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';

import { IdentifyUserInput } from './inputs';

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
