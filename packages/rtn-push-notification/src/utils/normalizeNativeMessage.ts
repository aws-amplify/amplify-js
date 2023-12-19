// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import isEmpty from 'lodash/isEmpty.js';
import {
	ApnsMessage,
	FcmMessage,
	NativeAction,
	NativeMessage,
	NormalizedValues,
	PushNotificationMessage,
} from '../types';

/**
 * @internal
 */
export const normalizeNativeMessage = (
	nativeMessage?: NativeMessage
): PushNotificationMessage | null => {
	let normalized: NormalizedValues;
	if (isApnsMessage(nativeMessage)) {
		normalized = normalizeApnsMessage(nativeMessage);
	} else if (isFcmMessage(nativeMessage)) {
		normalized = normalizeFcmMessage(nativeMessage);
	} else {
		return null;
	}
	const { body, imageUrl, title, action, options, data } = normalized;
	return {
		body,
		data,
		imageUrl,
		title,
		...action,
		...options,
	};
};

const normalizeApnsMessage = (apnsMessage: ApnsMessage): NormalizedValues => {
	const { aps, data } = apnsMessage;
	const { body, title } = aps.alert ?? {};
	const action = getApnsAction(data?.pinpoint) ?? {};
	const imageUrl = data?.['media-url'];
	const options = getApnsOptions(apnsMessage);
	return { body, imageUrl, title, action, options, data };
};

const normalizeFcmMessage = (fcmMessage: FcmMessage): NormalizedValues => {
	const { body, imageUrl, rawData: data, title } = fcmMessage;
	const action = getFcmAction(fcmMessage.action) ?? {};
	const options = getFcmOptions(fcmMessage);
	return { body, imageUrl, title, action, options, data };
};

const getApnsAction = (
	action?: NativeAction
): Pick<PushNotificationMessage, 'deeplinkUrl'> | undefined => {
	if (action?.deeplink) {
		return { deeplinkUrl: action.deeplink };
	}
};

const getFcmAction = (
	action?: NativeAction
): Pick<PushNotificationMessage, 'goToUrl' | 'deeplinkUrl'> | undefined => {
	if (action?.url) {
		return { goToUrl: action.url };
	}
	if (action?.deeplink) {
		return { deeplinkUrl: action.deeplink };
	}
};

const getApnsOptions = ({
	aps,
}: ApnsMessage): Pick<PushNotificationMessage, 'apnsOptions'> => {
	const { subtitle } = aps.alert ?? {};
	const apnsOptions = { ...(subtitle && { subtitle }) };
	return { ...(!isEmpty(apnsOptions) && { apnsOptions }) };
};

const getFcmOptions = ({
	channelId = '',
	messageId = '',
	senderId = '',
	sendTime = new Date().getTime(),
}: FcmMessage): Pick<PushNotificationMessage, 'fcmOptions'> => {
	const fcmOptions = {
		channelId,
		messageId,
		senderId,
		sendTime: new Date(sendTime),
	};
	return { ...(!isEmpty(fcmOptions) && { fcmOptions }) };
};

const isApnsMessage = (
	nativeMessage?: NativeMessage
): nativeMessage is ApnsMessage => !!nativeMessage?.aps;

const isFcmMessage = (
	nativeMessage?: NativeMessage
): nativeMessage is FcmMessage => !!nativeMessage?.rawData;
