// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getAnalyticsEvent } from '../../../../../src/pushNotifications/providers/pinpoint/utils/getAnalyticsEvent';

import {
	androidCampaignData,
	androidJourneyData,
	iosCampaignData,
	iosJourneyData,
	pinpointCampaign,
	pinpointJourney,
} from '../../../../testUtils/data';

describe('getAnalyticsEvent', () => {
	it('returns an android campaign analytics event', () => {
		// Also tests campaign / notification received in background combination
		expect(
			getAnalyticsEvent({ data: androidCampaignData }, 'received_background'),
		).toMatchObject({
			attributes: {
				campaign_activity_id: pinpointCampaign.campaign_activity_id,
				campaign_id: pinpointCampaign.campaign_id,
				treatment_id: pinpointCampaign.treatment_id,
			},
			name: '_campaign.received_background',
		});
	});

	it('returns an android journey analytics event', () => {
		// Also tests journey / notification received in background combination
		expect(
			getAnalyticsEvent({ data: androidJourneyData }, 'received_background'),
		).toMatchObject({
			attributes: pinpointJourney,
			name: '_journey.received_background',
		});
	});

	it('returns an ios campaign analytics event', () => {
		// Also tests campaign / notification received in foreground combination
		expect(
			getAnalyticsEvent({ data: iosCampaignData }, 'received_foreground'),
		).toMatchObject({
			attributes: pinpointCampaign,
			name: '_campaign.received_foreground',
		});
	});

	it('returns an ios journey analytics event', () => {
		// Also tests journey / notification received in foreground combination
		expect(
			getAnalyticsEvent({ data: iosJourneyData }, 'received_foreground'),
		).toMatchObject({
			attributes: pinpointJourney,
			name: '_journey.received_foreground',
		});
	});

	it('returns the correct event type for notifications opened', () => {
		expect(
			getAnalyticsEvent({ data: androidJourneyData }, 'opened_notification'),
		).toMatchObject({
			name: '_journey.opened_notification',
		});
		expect(
			getAnalyticsEvent({ data: iosCampaignData }, 'opened_notification'),
		).toMatchObject({
			name: '_campaign.opened_notification',
		});
	});

	it('returns null if there is no data', () => {
		expect(
			getAnalyticsEvent({ data: undefined }, 'received_background'),
		).toBeNull();
	});

	it('returns null if data is not parseable', () => {
		expect(getAnalyticsEvent({ data: {} }, 'received_background')).toBeNull();
	});
});
