// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PinpointAnalyticsEvent } from '@aws-amplify/core/internals/providers/pinpoint';
import {
	type InAppMessageCampaign as PinpointInAppMessage,
	OverrideButtonConfiguration,
} from '@aws-amplify/core/internals/aws-clients/pinpoint';
import {
	InAppMessage,
	InAppMessageContent,
	InAppMessagingEvent,
} from '../../src/inAppMessaging/types';
import { PushNotificationMessage } from '../../src/pushNotifications';
import { ButtonConfigPlatform } from '../../src/inAppMessaging/types/message';

export const credentials = {
	credentials: {
		accessKeyId: 'access-key-id',
		secretAccessKey: 'secret-access-key',
	},
	identityId: 'identity-id',
};

export const pinpointConfig = {
	appId: 'pinpoint-project-id',
	region: 'us-west-2',
};

export const subcategoryConfig = {
	Pinpoint: pinpointConfig,
};

export const notificationsConfig = {
	InAppMessaging: subcategoryConfig,
	Push: subcategoryConfig,
};

export const adhocConfig = {
	Notifications: {
		InAppMessaging: {
			AWSPinpoint: {
				appId: 'another-pinpoint-project-id',
				region: 'us-east-1',
			},
		},
	},
};

export const awsConfig = {
	mobileHubProperty: '',
	AnotherCategory: {},
	Notifications: notificationsConfig,
};

export const imageUrl = 'http://image.fakeurl/avocado.png';

export const userId = 'user-id';

export const analyticsEvent: PinpointAnalyticsEvent = {
	name: 'analytics-event',
};

/**
 * In-App Messaging data
 */
export const simpleInAppMessagingEvent: InAppMessagingEvent = { name: 'foo' };

export const simpleInAppMessages: Partial<InAppMessage>[] = [
	{ id: 'foo' },
	{ id: 'bar' },
];

export const closestExpiryMessage: InAppMessage = {
	id: 'closest-expiry',
	layout: 'CAROUSEL',
	content: [],
	metadata: {
		endDate: '2021-01-01T00:00:00Z',
	},
};

export const customHandledMessage: InAppMessage = {
	id: 'custom-handled',
	layout: 'MIDDLE_BANNER',
	content: [],
	metadata: {
		endDate: '2021-03-01T00:00:00Z',
	},
};

export const inAppMessages: InAppMessage[] = [
	{
		id: 'top-banner',
		layout: 'TOP_BANNER',
		content: [],
		metadata: {
			endDate: '2021-02-01T00:00:00Z',
			treatmentId: 'T1',
		},
	},
	{
		id: 'no-end-date-1',
		layout: 'MIDDLE_BANNER',
		content: [],
	},
	{ ...customHandledMessage },
	{
		id: 'bottom-banner',
		layout: 'BOTTOM_BANNER',
		content: [],
		metadata: {
			endDate: '2021-02-01T00:00:00Z',
		},
	},
	{ ...closestExpiryMessage },
	{
		id: 'no-end-date-2',
		layout: 'MIDDLE_BANNER',
		content: [],
	},
];

export const pinpointInAppMessage: PinpointInAppMessage = {
	CampaignId: 'uuid-1',
	InAppMessage: {
		Content: [
			{
				BackgroundColor: '#FFFF88',
				BodyConfig: {
					Alignment: 'LEFT',
					Body: 'Body content',
					TextColor: '#FF8888',
				},
				HeaderConfig: {
					Alignment: 'CENTER',
					Header: 'Header content',
					TextColor: '#88FF88',
				},
				ImageUrl: imageUrl,
				PrimaryBtn: {
					DefaultConfig: {
						BackgroundColor: '#8888FF',
						BorderRadius: 4,
						ButtonAction: 'CLOSE',
						Link: undefined,
						Text: 'Close button',
						TextColor: '#FF88FF',
					},
				},
				SecondaryBtn: {
					DefaultConfig: {
						BackgroundColor: '#88FFFF',
						BorderRadius: 4,
						ButtonAction: 'LINK',
						Link: 'http://link.fakeurl',
						Text: 'Link button',
						TextColor: '#FFFFFF',
					},
				},
			},
		],
		Layout: 'TOP_BANNER',
		CustomConfig: { foo: 'bar' },
	},
	Priority: 3,
	Schedule: {
		EndDate: '2021-01-01T00:00:00Z',
		EventFilter: {
			FilterType: 'SYSTEM',
			Dimensions: {
				Attributes: {},
				EventType: {
					DimensionType: 'INCLUSIVE',
					Values: ['clicked', 'swiped'],
				},
				Metrics: {},
			},
		},
		QuietTime: {
			End: undefined,
			Start: undefined,
		},
	},
	SessionCap: 0,
	DailyCap: 0,
	TotalCap: 0,
	TreatmentId: 'T1',
};

export const extractedContent: InAppMessageContent[] = [
	{
		body: {
			content: 'Body content',
			style: { color: '#FF8888', textAlign: 'left' },
		},
		container: { style: { backgroundColor: '#FFFF88' } },
		header: {
			content: 'Header content',
			style: { color: '#88FF88', textAlign: 'center' },
		},
		image: { src: imageUrl },
		primaryButton: {
			action: 'CLOSE',
			style: { backgroundColor: '#8888FF', borderRadius: 4, color: '#FF88FF' },
			title: 'Close button',
			url: undefined,
		},
		secondaryButton: {
			action: 'LINK',
			style: { backgroundColor: '#88FFFF', borderRadius: 4, color: '#FFFFFF' },
			title: 'Link button',
			url: 'http://link.fakeurl',
		},
	},
];

export const nativeButtonOverrides: {
	configPlatform: 'ios' | 'android';
	mappedPlatform: ButtonConfigPlatform;
	buttonOverrides: {
		primaryButton: OverrideButtonConfiguration;
		secondaryButton: OverrideButtonConfiguration;
	};
}[] = [
	{
		configPlatform: 'android',
		mappedPlatform: 'Android',
		buttonOverrides: {
			primaryButton: {
				ButtonAction: 'DEEP_LINK',
				Link: 'android-app://primaryButtonLink',
			},
			secondaryButton: {
				ButtonAction: 'LINK',
				Link: 'android-app://secondaryButtonLink',
			},
		},
	},
	{
		configPlatform: 'ios',
		mappedPlatform: 'IOS',
		buttonOverrides: {
			primaryButton: {
				ButtonAction: 'DEEP_LINK',
				Link: 'ios-app://primaryButtonLink',
			},
			secondaryButton: {
				ButtonAction: 'LINK',
				Link: 'ios-app://secondaryButtonLink',
			},
		},
	},
];
export const browserButtonOverrides: {
	configPlatform: 'web';
	mappedPlatform: ButtonConfigPlatform;
	buttonOverrides: {
		primaryButton: OverrideButtonConfiguration;
		secondaryButton: OverrideButtonConfiguration;
	};
}[] = [
	{
		configPlatform: 'web',
		mappedPlatform: 'Web',
		buttonOverrides: {
			primaryButton: {
				ButtonAction: 'LINK',
				Link: 'https://webPrimaryButtonLink.com',
			},
			secondaryButton: {
				ButtonAction: 'LINK',
				Link: 'https://webSecondaryButtonLink.com',
			},
		},
	},
];

export const extractedMetadata = {
	customData: { foo: 'bar' },
	endDate: '2021-01-01T00:00:00Z',
	priority: 3,
	treatmentId: 'T1',
};

/**
 * Push Notification data
 */
export const pushNotificationApnsConfig = {
	endpointInfo: { channelType: 'APNS' },
};

export const pushNotificationFcmConfig = {
	endpointInfo: { channelType: 'GCM' },
};

export const pushModuleConstants = {
	NativeEvent: {
		BACKGROUND_MESSAGE_RECEIVED: 'BackgroundMessageReceived',
		FOREGROUND_MESSAGE_RECEIVED: 'ForegroundMessageReceived',
		LAUNCH_NOTIFICATION_OPENED: 'LaunchNotificationOpened',
		NOTIFICATION_OPENED: 'NotificationOpened',
		TOKEN_RECEIVED: 'TokenReceived',
	},
	NativeHeadlessTaskKey: 'PushNotificationHeadlessTaskKey',
};

export const simplePushMessage: PushNotificationMessage = {
	title: 'foo',
	body: 'bar',
};

export const pushToken = 'foo-bar';
export const pinpointCampaign = {
	campaign_id: 'campaign-id',
	campaign_activity_id: 'campaign-activity-id',
	treatment_id: 'treatment-id',
};
export const pinpointJourney = {
	journey_activity_id: 'journey-activity-id',
	journey_run_id: 'journey-run-id',
	journey_id: 'journey-id',
};

export const ANDROID_CAMPAIGN_ACTIVITY_ID_KEY =
	'pinpoint.campaign.campaign_activity_id';
export const ANDROID_CAMPAIGN_ID_KEY = 'pinpoint.campaign.campaign_id';
export const ANDROID_CAMPAIGN_TREATMENT_ID_KEY =
	'pinpoint.campaign.treatment_id';

export const androidCampaignData = {
	title: simplePushMessage.title,
	body: simplePushMessage.body,
	[ANDROID_CAMPAIGN_ACTIVITY_ID_KEY]: pinpointCampaign.campaign_activity_id,
	[ANDROID_CAMPAIGN_ID_KEY]: pinpointCampaign.campaign_id,
	[ANDROID_CAMPAIGN_TREATMENT_ID_KEY]: pinpointCampaign.treatment_id,
};

export const androidJourneyData = {
	title: simplePushMessage.title,
	body: simplePushMessage.body,
	pinpoint: {
		journey: pinpointJourney,
	},
};

export const iosCampaignData = {
	pinpoint: {
		campaign: pinpointCampaign,
	},
};

export const iosJourneyData = {
	pinpoint: {
		journey: pinpointJourney,
	},
};

export const completionHandlerId = 'completion-handler-id';

export const userAgentValue = 'user-agent-value';

export const channelType = 'APNS_SANDBOX';

export const browserConfigTestCases = [
	{ os: 'android', expectedPlatform: 'Web' },
	{ os: 'ios', expectedPlatform: 'Web' },
	{ os: 'windows', expectedPlatform: 'Web' },
	{ os: 'macos', expectedPlatform: 'Web' },
	{ os: 'linux', expectedPlatform: 'Web' },
	{ os: 'unix', expectedPlatform: 'Web' },
	{ os: 'unknown', expectedPlatform: 'Web' },
];

export const nonBrowserConfigTestCases = [
	{ os: 'android', expectedPlatform: 'Android' },
	{ os: 'ios', expectedPlatform: 'IOS' },
	{ os: 'windows', expectedPlatform: 'DefaultConfig' },
	{ os: 'macos', expectedPlatform: 'DefaultConfig' },
	{ os: 'linux', expectedPlatform: 'DefaultConfig' },
	{ os: 'unix', expectedPlatform: 'DefaultConfig' },
	{ os: 'unknown', expectedPlatform: 'DefaultConfig' },
];
