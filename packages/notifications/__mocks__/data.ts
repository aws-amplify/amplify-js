// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	Alignment,
	ButtonAction,
	DimensionType,
	FilterType,
	InAppMessageCampaign as PinpointInAppMessage,
} from '@aws-sdk/client-pinpoint';
import {
	InAppMessage,
	InAppMessagingEvent,
	UserInfo,
} from '../src/InAppMessaging';
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

export const inAppMessagingConfig = {
	AWSPinpoint: awsPinpointConfig,
};

export const notificationsConfig = {
	InAppMessaging: inAppMessagingConfig,
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

export const simpleEvent: InAppMessagingEvent = { name: 'foo' };

export const simpleMessages = [{ id: 'foo' }, { id: 'bar' }];

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
					Alignment: Alignment.LEFT,
					Body: 'Body content',
					TextColor: '#FF8888',
				},
				HeaderConfig: {
					Alignment: Alignment.CENTER,
					Header: 'Header content',
					TextColor: '#88FF88',
				},
				ImageUrl: 'http://image.url',
				PrimaryBtn: {
					DefaultConfig: {
						BackgroundColor: '#8888FF',
						BorderRadius: 4,
						ButtonAction: ButtonAction.CLOSE,
						Link: null,
						Text: 'Close button',
						TextColor: '#FF88FF',
					},
				},
				SecondaryBtn: {
					DefaultConfig: {
						BackgroundColor: '#88FFFF',
						BorderRadius: 4,
						ButtonAction: ButtonAction.LINK,
						Link: 'http://link.url',
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
			FilterType: FilterType.SYSTEM,
			Dimensions: {
				Attributes: {},
				EventType: {
					DimensionType: DimensionType.INCLUSIVE,
					Values: ['clicked', 'swiped'],
				},
				Metrics: {},
			},
		},
		QuietTime: {
			End: null,
			Start: null,
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
		image: { src: 'http://image.url' },
		primaryButton: {
			action: 'CLOSE',
			style: { backgroundColor: '#8888FF', borderRadius: 4, color: '#FF88FF' },
			title: 'Close button',
			url: null,
		},
		secondaryButton: {
			action: 'LINK',
			style: { backgroundColor: '#88FFFF', borderRadius: 4, color: '#FFFFFF' },
			title: 'Link button',
			url: 'http://link.url',
		},
	},
];

export const extractedMetadata = {
	customData: { foo: 'bar' },
	endDate: '2021-01-01T00:00:00Z',
	priority: 3,
	treatmentId: 'T1',
};

export const userId = 'user-id';

export const userInfo: UserInfo = {
	attributes: {
		hobbies: ['shuffleboard', 'jousting'],
	},
};

export const pinpointEndpointPayload = {
	ApplicationId: awsPinpointConfig.appId,
	EndpointRequest: expect.objectContaining({
		Attributes: userInfo.attributes,
		ChannelType: 'IN_APP',
		User: {
			UserAttributes: userInfo.attributes,
			UserId: userId,
		},
	}),
};
