// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { normalizeNativeMessage } from '../../src/utils';
import {
	apnsMessage,
	apnsMessagePayload,
	fcmMessage,
	fcmMessagePayload,
	fcmMessageOptions,
	imageUrl,
	pushNotificationAdhocData,
	pushNotificationDeeplinkUrl,
	pushNotificationUrl,
} from '../testUtils/data';
import { ApnsMessage } from '../../src/types';

describe('normalizeNativeMessage', () => {
	describe('apns messages', () => {
		it('normalizes typical messages', () => {
			const { body, subtitle, title } = apnsMessagePayload.alert;

			expect(normalizeNativeMessage(apnsMessage)).toStrictEqual({
				title,
				body,
				imageUrl: imageUrl,
				data: {
					...pushNotificationAdhocData,
					'media-url': imageUrl,
				},
				apnsOptions: { subtitle },
			});
		});

		it('normalizes alert only messages', () => {
			const { body, title } = apnsMessagePayload.alert;
			const payload = { aps: { alert: { body, title } } };

			expect(normalizeNativeMessage(payload)).toStrictEqual(
				expect.objectContaining({ body, title }),
			);
		});

		it('normalizes data only messages', () => {
			const payload = {
				aps: { 'content-available': 1 },
				data: pushNotificationAdhocData,
			} as ApnsMessage;

			expect(normalizeNativeMessage(payload)).toStrictEqual(
				expect.objectContaining({
					data: pushNotificationAdhocData,
				}),
			);
		});

		it('extracts a deep link action', () => {
			const payload = {
				aps: apnsMessagePayload,
				data: {
					pinpoint: {
						deeplink: pushNotificationDeeplinkUrl,
					},
				},
			};

			expect(normalizeNativeMessage(payload)).toMatchObject({
				deeplinkUrl: pushNotificationDeeplinkUrl,
			});
		});
	});

	describe('fcm messages', () => {
		it('normalizes typical messages', () => {
			const { body, rawData, imageUrl, title } = fcmMessagePayload;

			expect(normalizeNativeMessage(fcmMessage)).toStrictEqual({
				body,
				data: rawData,
				imageUrl,
				title,
				fcmOptions: {
					...fcmMessageOptions,
					sendTime: new Date(fcmMessageOptions.sendTime),
				},
			});
		});

		it('normalizes data only messages', () => {
			const payload = { rawData: fcmMessagePayload.rawData };

			expect(normalizeNativeMessage(payload)).toStrictEqual(
				expect.objectContaining({
					data: pushNotificationAdhocData,
				}),
			);
		});

		it('extracts a go to url action', () => {
			const payload = {
				...fcmMessagePayload,
				action: { url: pushNotificationUrl },
			};

			expect(normalizeNativeMessage(payload)).toMatchObject({
				goToUrl: pushNotificationUrl,
			});
		});

		it('extracts a deep link action', () => {
			const payload = {
				...fcmMessagePayload,
				action: { deeplink: pushNotificationDeeplinkUrl },
			};

			expect(normalizeNativeMessage(payload)).toMatchObject({
				deeplinkUrl: pushNotificationDeeplinkUrl,
			});
		});
	});

	it('handles null input', () => {
		expect(normalizeNativeMessage()).toBeNull();
	});
});
