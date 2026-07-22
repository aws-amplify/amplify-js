// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

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

export type IdentifyUser = (input: IdentifyUserInput) => Promise<void>;
