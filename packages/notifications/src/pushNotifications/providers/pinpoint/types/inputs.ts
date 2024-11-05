// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	PushNotificationIdentifyUserInput,
	PushNotificationOnNotificationOpenedInput,
	PushNotificationOnNotificationReceivedInBackgroundInput,
	PushNotificationOnNotificationReceivedInForegroundInput,
	PushNotificationOnTokenReceivedInput,
	PushNotificationRequestPermissionsInput,
	PushNotificationSetBadgeCountInput,
} from '../../../types';

import { IdentifyUserOptions } from './options';

export type IdentifyUserInput =
	PushNotificationIdentifyUserInput<IdentifyUserOptions>;

export type RequestPermissionsInput = PushNotificationRequestPermissionsInput;

export type SetBadgeCountInput = PushNotificationSetBadgeCountInput;

export type OnNotificationOpenedInput =
	PushNotificationOnNotificationOpenedInput;

export type OnNotificationReceivedInBackgroundInput =
	PushNotificationOnNotificationReceivedInBackgroundInput;

export type OnNotificationReceivedInForegroundInput =
	PushNotificationOnNotificationReceivedInForegroundInput;

export type OnTokenReceivedInput = PushNotificationOnTokenReceivedInput;
