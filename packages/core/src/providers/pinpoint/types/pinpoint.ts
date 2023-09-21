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
	Pinpoint: {
		appId: string;
		region: string;
	};
};

export type PinpointServiceOptions = {
	address?: string;
	optOut?: 'ALL' | 'NONE';
};

export type PinpointSession = {
	Id: string;
	StartTimestamp: string;
};

export type PinpointAnalyticsEvent = {
	name: string;
	attributes?: Record<string, string>;
	metrics?: Record<string, number>;
};

// Common type that is required for operations that may trigger an endpoint update
type PinpointCommonParameters = {
	appId: string;
	category: SupportedCategory;
	credentials: Required<AuthSession>['credentials'];
	identityId?: AuthSession['identityId'];
	region: string;
	userAgentValue?: string;
};

export type PinpointUpdateEndpointInput = PinpointCommonParameters &
	PinpointServiceOptions & {
		channelType?: SupportedChannelType;
		userId?: string;
		userProfile?: UserProfile;
	};

export type PinpointRecordInput = PinpointCommonParameters & {
	event: PinpointAnalyticsEvent;
};
