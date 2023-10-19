// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { InAppMessagingConfig } from './InAppMessaging/types';
import { PushNotificationConfig } from './PushNotification/types';

export type NotificationsConfig = {
	InAppMessaging?: InAppMessagingConfig;
	PushNotification?: PushNotificationConfig;
};
