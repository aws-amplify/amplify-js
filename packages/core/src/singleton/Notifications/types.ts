// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { InAppMessagingConfig } from './InAppMessaging/types';
import { PushNotificationConfig } from './PushNotification/types';
import { AtLeastOne } from '../types';

export type InAppMessagingProviderConfig = {
	InAppMessaging: InAppMessagingConfig;
};

export type PushNotificationProviderConfig = {
	PushNotification: PushNotificationConfig;
};

export type NotificationsConfig = AtLeastOne<
	InAppMessagingProviderConfig & PushNotificationProviderConfig
>;
