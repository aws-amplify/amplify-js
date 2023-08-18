// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthSession } from '../../../singleton/Auth/types';
import { UserProfile } from '../../../types';

export type SupportedCategory =
	| 'Analytics'
	| 'InAppMessaging'
	| 'PushNotification';

export type SupportedChannelType = 'APNS' | 'APNS_SANDBOX' | 'GCM' | 'IN_APP';

export type PinpointProviderConfig = {
	AWSPinpoint: {
		appId: string;
		region: string;
	};
};

export type PinpointUserProfile = UserProfile & {
	address?: string;
	optOut?: 'ALL' | 'NONE';
};

export type PinpointUpdateEndpointParameters = {
	appId: string;
	category: SupportedCategory;
	channelType?: SupportedChannelType;
	credentials: AuthSession['credentials'];
	identityId?: AuthSession['identityId'];
	region: string;
	userId?: string;
	userProfile?: PinpointUserProfile;
	userAgentValue?: string;
};
