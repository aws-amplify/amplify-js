// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AtLeastOne } from '../types';

import { InAppMessagingConfig } from './InAppMessaging/types';
import { PushNotificationConfig } from './PushNotification/types';

export interface InAppMessagingProviderConfig {
	InAppMessaging: InAppMessagingConfig;
}

export interface PushNotificationProviderConfig {
	PushNotification: PushNotificationConfig;
}

export type NotificationsConfig = AtLeastOne<
	InAppMessagingProviderConfig & PushNotificationProviderConfig
>;
