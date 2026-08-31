// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { InAppMessagingConfig } from './InAppMessaging/types';
import { PushNotificationConfig } from './PushNotification/types';

export type NotificationsCategory = 'Notifications';

export type NotificationsSubCategory = 'InAppMessaging' | 'PushNotification';

export interface NotificationsProvider {
	// configure provider
	configure(config: object): object;

	// return category ('Notifications')
	getCategory(): NotificationsCategory;

	// return sub-category
	getSubCategory(): NotificationsSubCategory;

	// return the name of you provider
	getProviderName(): string;

	// identify the current user with the provider
	identifyUser(userId: string, userInfo: UserInfo): Promise<void>;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface NotificationsConfig {
	Notifications?: {
		InAppMessaging?: InAppMessagingConfig;
		Push?: PushNotificationConfig;
	};
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type UserInfo = {
	attributes?: Record<string, string[]>;
	demographic?: {
		appVersion?: string;
		locale?: string;
		make?: string;
		model?: string;
		modelVersion?: string;
		platform?: string;
		platformVersion?: string;
		timezone?: string;
	};
	location?: {
		city?: string;
		country?: string;
		latitude?: number;
		longitude?: number;
		postalCode?: string;
		region?: string;
	};
	metrics?: Record<string, number>;
};
