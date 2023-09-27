// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { isEmpty } from 'lodash';

import {
	NormalizedValues,
	PushNotificationMessage,
	PushNotificationPermissionStatus,
} from './types';

const DEEP_LINK_ACTION = 'deeplink';
const URL_ACTION = 'url';

export const normalizeNativePermissionStatus = (
	nativeStatus?
): PushNotificationPermissionStatus => {
	switch (nativeStatus) {
		case 'ShouldRequest':
			return PushNotificationPermissionStatus.SHOULD_REQUEST;
		case 'NotDetermined':
		case 'ShouldExplainThenRequest':
			return PushNotificationPermissionStatus.SHOULD_EXPLAIN_THEN_REQUEST;
		case 'Authorized':
		case 'Granted':
			return PushNotificationPermissionStatus.GRANTED;
		case 'Denied':
			return PushNotificationPermissionStatus.DENIED;
	}
};

export const normalizeNativeMessage = (
	nativeMessage?
): PushNotificationMessage | null => {
	let normalized: NormalizedValues;
	if (nativeMessage?.aps) {
		normalized = normalizeApnsMessage(nativeMessage);
	}
	if (nativeMessage?.rawData) {
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
	const { aps, data = {} } = apnsMessage;
	const { body, title } = aps.alert ?? {};
	const action = getApnsAction(data.pinpoint) ?? {};
	const imageUrl = data['media-url'];
	const options = getApnsOptions(apnsMessage);
	return { body, imageUrl, title, action, options, data };
};

const normalizeFcmMessage = (fcmMessage): NormalizedValues => {
	const { body, imageUrl, rawData: data, title } = fcmMessage;
	const action = getFcmAction(fcmMessage.action) ?? {};
	const options = getFcmOptions(fcmMessage);
	return { body, imageUrl, title, action, options, data };
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
	if (action[URL_ACTION]) {
		return { goToUrl: action[URL_ACTION] };
	}
	if (action[DEEP_LINK_ACTION]) {
		return { deeplinkUrl: action[DEEP_LINK_ACTION] };
	}
};

const getApnsOptions = ({
	aps,
}): Pick<PushNotificationMessage, 'apnsOptions'> => {
	const { subtitle } = aps.alert ?? {};
	const apnsOptions = { ...(subtitle && { subtitle }) };
	return { ...(!isEmpty(apnsOptions) && { apnsOptions }) };
};

const getFcmOptions = ({
	channelId,
	messageId,
	senderId,
	sendTime,
}): Pick<PushNotificationMessage, 'fcmOptions'> => {
	const fcmOptions = {
		...(channelId && { channelId }),
		...(messageId && { messageId }),
		...(senderId && { senderId }),
		...(sendTime && { sendTime: new Date(sendTime) }),
	};
	return { ...(!isEmpty(fcmOptions) && { fcmOptions }) };
};
