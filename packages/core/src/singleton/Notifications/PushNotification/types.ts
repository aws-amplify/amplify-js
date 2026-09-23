// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PinpointProviderConfig } from '../../../providers/pinpoint/types';
import { AtLeastOne } from '../../types';

/**
 * Configuration for the Amazon Connect Customer Profiles Push Notification
 * provider. The provider backs device registration (`identifyUser` /
 * `initializePushNotifications`) with a REST endpoint (typically fronted by a
 * Lambda) that writes device tokens to Amazon Connect Customer Profiles.
 */
export interface ConnectCustomerProfilesPushProviderConfig {
	CustomerProfiles: {
		endpoint: string;
		region: string;
	};
}

export type PushNotificationConfig = AtLeastOne<
	PinpointProviderConfig & ConnectCustomerProfilesPushProviderConfig
>;
