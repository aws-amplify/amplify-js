// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	IdentifyUserInput,
	OnNotificationOpenedInput,
	OnNotificationReceivedInBackgroundInput,
	OnNotificationReceivedInForegroundInput,
	OnTokenReceivedInput,
	RequestPermissionsInput,
	SetBadgeCountInput,
} from './inputs';
import {
	GetBadgeCountOutput,
	GetLaunchNotificationOutput,
	GetPermissionStatusOutput,
	OnNotificationOpenedOutput,
	OnNotificationReceivedInBackgroundOutput,
	OnNotificationReceivedInForegroundOutput,
	OnTokenReceivedOutput,
	RequestPermissionsOutput,
} from './outputs';

export type GetBadgeCount = () => Promise<void | GetBadgeCountOutput>;

export type GetLaunchNotification = () => Promise<GetLaunchNotificationOutput>;

export type GetPermissionStatus = () => Promise<GetPermissionStatusOutput>;

export type IdentifyUser = (input: IdentifyUserInput) => Promise<void>;

export type InitializePushNotifications = () => void;

export type RequestPermissions = (
	input?: RequestPermissionsInput,
) => Promise<RequestPermissionsOutput>;

export type SetBadgeCount = (input: SetBadgeCountInput) => void;

export type OnNotificationOpened = (
	input: OnNotificationOpenedInput,
) => OnNotificationOpenedOutput;

export type OnNotificationReceivedInBackground = (
	input: OnNotificationReceivedInBackgroundInput,
) => OnNotificationReceivedInBackgroundOutput;

export type OnNotificationReceivedInForeground = (
	input: OnNotificationReceivedInForegroundInput,
) => OnNotificationReceivedInForegroundOutput;

export type OnTokenReceived = (
	input: OnTokenReceivedInput,
) => OnTokenReceivedOutput;
