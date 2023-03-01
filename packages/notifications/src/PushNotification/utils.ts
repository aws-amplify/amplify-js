// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { isEmpty } from 'lodash';

import {
	NormalizedValues,
	PushNotificationMessage,
	PushNotificationPermissionStatus,
} from './types';

const logger = new Logger('Notifications.PushNotification');

// Currently, the pinpoint specifics have not yet been abstracted out of the native payloads, but we are working
// towards doing so.
const PINPOINT_PREFIX = 'pinpoint.';
const DEEP_LINK_ACTION = 'deeplink';
const URL_ACTION = 'url';

export const normalizeNativePermissionStatus = (
	nativeStatus?
): PushNotificationPermissionStatus => {
	switch (nativeStatus) {
		case 'Denied':
			return PushNotificationPermissionStatus.DENIED;
		case 'Authorized':
		case 'Granted':
			return PushNotificationPermissionStatus.GRANTED;
		case 'NotRequested':
			return PushNotificationPermissionStatus.NOT_REQUESTED;
		case 'NotDetermined':
		case 'ShouldRequestWithRationale':
			return PushNotificationPermissionStatus.SHOULD_REQUEST_WITH_RATIONALE;
	}
};

export const normalizeNativeMessage = (
	nativeMessage?
): PushNotificationMessage | null => {
	let normalized: NormalizedValues;
	if (nativeMessage?.aps) {
		normalized = normalizeApnsMessage(nativeMessage);
	}
	if (nativeMessage?.payload) {
		normalized = normalizeFcmMessage(nativeMessage);
	}
	if (!normalized) {
		return null;
	}
	const { body, imageUrl, title, action, options, data } = normalized;
	return {
		...(body && { body }),
		...(imageUrl && { imageUrl }),
		...(title && { title }),
		...action,
		...options,
		...(!isEmpty(data) && { data }),
	};
};

const normalizeApnsMessage = (apnsMessage): NormalizedValues => {
	const { aps = { alert: {} }, data = {} } = apnsMessage;
	const { body, title } = aps.alert;
	// We want to eventually move provider specifics into the provider somehow, but without another provider use case to
	// develop against, any decisions made regarding how to transform this data would likely be discarded. For now, we
	// should not over-complicate this transformer
	const action = getApnsAction(data.pinpoint) ?? {};
	const imageUrl = data['media-url'];
	const options = getApnsOptions(apnsMessage);
	return { body, imageUrl, title, action, options, data };
};

const normalizeFcmMessage = (fcmMessage): NormalizedValues => {
	try {
		const payload = JSON.parse(fcmMessage.payload);
		const { body, imageUrl, rawData: data, title } = payload;
		const action = getFcmAction(payload.action) ?? {};
		const options = getFcmOptions(payload);
		return { body, imageUrl, title, action, options, data };
	} catch (e) {
		logger.error('An error ocurred parsing the native payload');
	}
};

const getApnsAction = (
	action = {}
): Pick<PushNotificationMessage, 'deeplinkUrl'> => {
	if (action[DEEP_LINK_ACTION]) {
		return { deeplinkUrl: action[DEEP_LINK_ACTION] };
	}
};

const getFcmAction = (
	action = {}
): Pick<PushNotificationMessage, 'goToUrl' | 'deeplinkUrl'> => {
	if (action[`${PINPOINT_PREFIX}${URL_ACTION}`]) {
		return { goToUrl: action[`${PINPOINT_PREFIX}${URL_ACTION}`] };
	}
	if (action[`${PINPOINT_PREFIX}${DEEP_LINK_ACTION}`]) {
		return { deeplinkUrl: action[`${PINPOINT_PREFIX}${DEEP_LINK_ACTION}`] };
	}
};

const getApnsOptions = ({
	subtitle,
}): Pick<PushNotificationMessage, 'apnsOptions'> => {
	const apnsOptions = { ...(subtitle && { subtitle }) };
	return { ...(!isEmpty(apnsOptions) && { apnsOptions }) };
};

const getFcmOptions = ({
	channelId,
	messageId,
	senderId,
	sendTime,
}): Pick<PushNotificationMessage, 'fcmOptions'> => ({
	fcmOptions: {
		channelId,
		messageId,
		senderId,
		sendTime: new Date(sendTime),
	},
});
