// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { UserProfile } from '@aws-amplify/core';

import { PushNotificationServiceOptions } from './options';
import { PushNotificationPermissions } from './module';
import {
	OnPushNotificationMessageHandler,
	OnTokenReceivedHandler,
} from './pushNotifications';

export interface PushNotificationIdentifyUserInput<
	ServiceOptions extends
		PushNotificationServiceOptions = PushNotificationServiceOptions,
> {
	/**
	 * A User ID associated to the current device.
	 */
	userId: string;

	/**
	 * Additional information about the user and their device.
	 */
	userProfile: UserProfile;

	/**
	 * Options to be passed to the API.
	 */
	options?: ServiceOptions;
}

export type PushNotificationRequestPermissionsInput =
	PushNotificationPermissions;

export type PushNotificationSetBadgeCountInput = number;

export type PushNotificationOnNotificationOpenedInput =
	OnPushNotificationMessageHandler;

export type PushNotificationOnNotificationReceivedInBackgroundInput =
	OnPushNotificationMessageHandler;

export type PushNotificationOnNotificationReceivedInForegroundInput =
	OnPushNotificationMessageHandler;

export type PushNotificationOnTokenReceivedInput = OnTokenReceivedHandler;
