// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { isEmpty } from 'lodash';

import {
	PushNotificationMessage,
	PushNotificationPermissionStatus,
} from './types';

const logger = new Logger('Notifications.PushNotification');

// Currently, the pinpoint specifics have not yet been abstracted out of the native payloads, but we are working
// towards doing so.
const DEEP_LINK_ACTION = 'pinpoint.deeplink';
const URL_ACTION = 'pinpoint.url';

export const normalizeNativePermissionStatus = (
	nativeStatus?
): PushNotificationPermissionStatus => {
	switch (nativeStatus) {
		case 'Denied':
			return PushNotificationPermissionStatus.DENIED;
		case 'Granted':
			return PushNotificationPermissionStatus.GRANTED;
		case 'NotRequested':
			return PushNotificationPermissionStatus.NOT_REQUESTED;
		case 'ShouldRequestWithRationale':
			return PushNotificationPermissionStatus.SHOULD_REQUEST_WITH_RATIONALE;
	}
};

export const normalizeNativeMessage = (
	nativeMessage?
): PushNotificationMessage | null => {
	if (!nativeMessage?.payload) {
		return null;
	}
	try {
		const payload = JSON.parse(nativeMessage.payload);
		const { messageId, senderId, sendTime, rawData: data } = payload;
		const content = getContent(payload);
		return {
			messageId,
			sendTime: new Date(sendTime),
			...(senderId && { senderId }),
			...(!isEmpty(content) && { content }),
			data,
		};
	} catch (e) {
		logger.error('An error ocurred parsing the native payload');
	}
	return null;
};

const getContent = (payload): PushNotificationMessage['content'] => {
	const { action, body, imageUrl, title } = payload;
	const apnsOptions = getApnsOptions(payload);
	const fcmOptions = getFcmOptions(payload);
	return {
		...(body && { body }),
		...(imageUrl && { imageUrl }),
		...(title && { title }),
		...getAction(action),
		...(!isEmpty(apnsOptions) && { apnsOptions }),
		...(!isEmpty(fcmOptions) && { fcmOptions }),
	};
};

const getAction = (
	action
): Pick<PushNotificationMessage['content'], 'goToUrl' | 'deeplinkUrl'> => {
	if (action[URL_ACTION]) {
		return { goToUrl: action[URL_ACTION] };
	}
	if (action[DEEP_LINK_ACTION]) {
		return { deeplinkUrl: action[DEEP_LINK_ACTION] };
	}
};

const getApnsOptions = ({
	subtitle,
}): PushNotificationMessage['content']['apnsOptions'] => ({
	...(subtitle && { subtitle }),
});

const getFcmOptions = ({
	channelId,
}): PushNotificationMessage['content']['fcmOptions'] => ({
	...(channelId && { channelId }),
});
