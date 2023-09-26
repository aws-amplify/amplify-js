// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger } from '@aws-amplify/core';

import { AWSPinpointMessageEvent } from '../../../../src/pushNotifications/Providers/AWSPinpointProvider/types';
import { getAnalyticsEvent } from '../../../../src/pushNotifications/Providers/AWSPinpointProvider/utils';

import {
	androidCampaignData,
	androidJourneyData,
	iosCampaignData,
	iosJourneyData,
	pinpointCampaign,
	pinpointJourney,
} from '../../../../__mocks__/data';

jest.mock('@aws-amplify/core');

const loggerDebugSpy = jest.spyOn(ConsoleLogger.prototype, 'debug');

describe('AWSPinpoint PushNotification Provider Utils', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('getAnalyticsEvent', () => {
		test('returns an android campaign analytics event', () => {
			// Also tests campaign / notification received in background combination
			expect(
				getAnalyticsEvent(
					{ data: androidCampaignData },
					AWSPinpointMessageEvent.BACKGROUND_MESSAGE_RECEIVED
				)
			).toMatchObject({
				Attributes: {
					campaign_activity_id: pinpointCampaign.campaign_activity_id,
					campaign_id: pinpointCampaign.campaign_id,
					treatment_id: pinpointCampaign.treatment_id,
				},
				EventType: '_campaign.received_background',
			});
		});

		test('returns an android journey analytics event', () => {
			// Also tests journey / notification received in background combination
			expect(
				getAnalyticsEvent(
					{ data: androidJourneyData },
					AWSPinpointMessageEvent.BACKGROUND_MESSAGE_RECEIVED
				)
			).toMatchObject({
				Attributes: pinpointJourney,
				EventType: '_journey.received_background',
			});
		});

		test('returns an ios campaign analytics event', () => {
			// Also tests campaign / notification received in foreground combination
			expect(
				getAnalyticsEvent(
					{ data: iosCampaignData },
					AWSPinpointMessageEvent.FOREGROUND_MESSAGE_RECEIVED
				)
			).toMatchObject({
				Attributes: pinpointCampaign,
				EventType: '_campaign.received_foreground',
			});
		});

		test('returns an ios journey analytics event', () => {
			// Also tests journey / notification received in foreground combination
			expect(
				getAnalyticsEvent(
					{ data: iosJourneyData },
					AWSPinpointMessageEvent.FOREGROUND_MESSAGE_RECEIVED
				)
			).toMatchObject({
				Attributes: pinpointJourney,
				EventType: '_journey.received_foreground',
			});
		});

		test('returns the correct event type for notifications opened', () => {
			expect(
				getAnalyticsEvent(
					{ data: androidJourneyData },
					AWSPinpointMessageEvent.NOTIFICATION_OPENED
				)
			).toMatchObject({
				EventType: '_journey.opened_notification',
			});
			expect(
				getAnalyticsEvent(
					{ data: iosCampaignData },
					AWSPinpointMessageEvent.NOTIFICATION_OPENED
				)
			).toMatchObject({
				EventType: '_campaign.opened_notification',
			});
		});

		test('returns null if there is no data', () => {
			expect(
				getAnalyticsEvent(
					{ data: undefined },
					AWSPinpointMessageEvent.BACKGROUND_MESSAGE_RECEIVED
				)
			).toBeNull();
		});

		test('returns null data is not parseable', () => {
			expect(
				getAnalyticsEvent(
					{ data: {} },
					AWSPinpointMessageEvent.BACKGROUND_MESSAGE_RECEIVED
				)
			).toBeNull();
		});
	});
});
