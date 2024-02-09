// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const imageUrl = 'http://image.fakeurl/avocado.png';
export const pushNotificationDeeplinkUrl = 'deeplink://url';
export const pushNotificationUrl = 'http://goto.fakeurl';

export const pushNotificationAdhocData = { foo: 'bar' };

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

export const nativeMessage = { title: 'foo', body: 'bar' };

export const eventType = 'event-type';

export const completionHandlerId = 'completion-handler-id';
