// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger as Logger } from '@aws-amplify/core';

import {
	PushNotificationMessage,
	PushNotificationPermissionStatus,
} from './types';

const logger = new Logger('Notifications.PushNotification');

export const normalizeNativePermissionStatus = (
	nativeStatus?
): PushNotificationPermissionStatus => {
	switch (nativeStatus) {
		case 'Denied':
			return PushNotificationPermissionStatus.DENIED;
		case 'Granted':
			return PushNotificationPermissionStatus.GRANTED;
		default:
			return PushNotificationPermissionStatus.UNDETERMINED;
	}
};

export const normalizeNativeMessage = (
	nativeMessage?
): PushNotificationMessage | null => {
	if (!nativeMessage?.payload) {
		return null;
	}
	try {
		const {
			body,
			imageUrl,
			notificationId,
			title,
			rawData: data,
		} = JSON.parse(nativeMessage.payload);
		const deeplinkUrl = data?.['pinpoint.deeplink'];
		const goToUrl = data?.['pinpoint.url'];
		return {
			messageId: notificationId,
			senderId: '😭',
			sendTime: new Date(),
			content: {
				body,
				deeplinkUrl,
				imageUrl,
				title,
				goToUrl,
			},
			data,
		};
	} catch (e) {
		logger.error('An error ocurred parsing the native payload');
	}
	return null;
};
