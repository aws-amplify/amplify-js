// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { InAppMessagingConfig } from './InAppMessaging';

export type NotificationsCategory = 'Notifications';

export interface NotificationsConfig extends Record<any, any> {
	Notifications?: {
		InAppMessaging?: InAppMessagingConfig;
	};
}
