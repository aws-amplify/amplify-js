// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
	Event,
	InAppMessageCampaign as PinpointInAppMessage,
} from '@aws-amplify/core/internals/aws-clients/pinpoint';
import { InAppMessage, InAppMessagingEvent } from '../src/inAppMessaging/types';
import { PushNotificationMessage } from '../src/pushNotifications';
import { UserInfo } from '../src';
import { NotificationsConfig } from '../src';

export const credentials = {
	accessKeyId: 'access-key-id',
	sessionToken: 'session-token',
	secretAccessKey: 'secret-access-key',
	identityId: 'identity-id',
	authenticated: true,
};

export const awsPinpointConfig = {
	appId: 'pinpoint-project-id',
	region: 'us-west-2',
};

export const subcategoryConfig = {
	AWSPinpoint: awsPinpointConfig,
};

export const notificationsConfig = {
	InAppMessaging: subcategoryConfig,
	Push: subcategoryConfig,
};

export const adhocConfig: NotificationsConfig = {
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

export const userInfo: UserInfo = {
	attributes: {
		hobbies: ['shuffleboard', 'jousting'],
	},
};

export const analyticsEvent: Event = {
	EventType: 'analytics-event',
	Timestamp: '2023-03-08T18:13:03.627Z',
};

/**
 * In-App Messaging data
 */
export const inAppMessagingConfig = {
	endpointInfo: { channelType: 'IN_APP' },
};

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
		EndDate: '2024-01-01T00:00:00Z',
		EventFilter: {
			FilterType: 'SYSTEM',
			Dimensions: {
				Attributes: {
					interests: { Values: ['test-interest'] },
				},
				EventType: {
					DimensionType: 'INCLUSIVE',
					Values: ['clicked', 'swiped'],
				},
				Metrics: {
					clicks: { ComparisonOperator: 'EQUAL', Value: 5 },
				},
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

export const extractedContent = [
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
export const pushNotificationUrl = 'http://goto.fakeurl';
export const pushNotificationDeeplinkUrl = 'deeplink://url';
export const pushNotificationAdhocData = { foo: 'bar' };
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

export const apnsMessagePayload = {
	alert: {
		title: 'apns-title',
		subtitle: 'apns-subtitle',
		body: 'apns-body',
	},
};

export const apnsMessage = {
	aps: apnsMessagePayload,
	data: {
		'media-url': imageUrl,
		...pushNotificationAdhocData,
	},
};

export const fcmMessageOptions = {
	channelId: 'channel-id',
	messageId: 'message-id',
	senderId: 'sender-id',
	sendTime: 1678840781599,
};

export const fcmMessagePayload = {
	title: 'fcm-title',
	body: 'fcm-body',
	imageUrl: imageUrl,
	action: {},
	rawData: pushNotificationAdhocData,
};

export const fcmMessage = {
	...fcmMessagePayload,
	...fcmMessageOptions,
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
