// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PinpointAnalyticsEvent } from '@aws-amplify/core/internals/providers/pinpoint';
import { AnalyticsEventAttributes, PinpointMessageEvent } from '../types';
import { PushNotificationMessage } from '../../../types';

const ANDROID_CAMPAIGN_ACTIVITY_ID_KEY =
	'pinpoint.campaign.campaign_activity_id';
const ANDROID_CAMPAIGN_ID_KEY = 'pinpoint.campaign.campaign_id';
const ANDROID_CAMPAIGN_TREATMENT_ID_KEY = 'pinpoint.campaign.treatment_id';

/**
 * @internal
 */
export const getAnalyticsEvent = (
	{ data }: PushNotificationMessage,
	event: PinpointMessageEvent
): PinpointAnalyticsEvent | null => {
	if (!data) {
		return null;
	}
	const eventAttributes = getAnalyticsEventAttributes(data);
	if (!eventAttributes) {
		return null;
	}
	const { source, attributes } = eventAttributes;
	return {
		attributes,
		name: `${source}.${event}`,
	};
};

const getAnalyticsEventAttributes = (
	data: PushNotificationMessage['data']
): AnalyticsEventAttributes | undefined => {
	if (!data) {
		return;
	}
	if (data.hasOwnProperty(ANDROID_CAMPAIGN_ID_KEY)) {
		return {
			source: '_campaign',
			attributes: {
				campaign_activity_id: data[ANDROID_CAMPAIGN_ACTIVITY_ID_KEY] as string,
				campaign_id: data[ANDROID_CAMPAIGN_ID_KEY] as string,
				treatment_id: data[ANDROID_CAMPAIGN_TREATMENT_ID_KEY] as string,
			},
		};
	}
	const pinpoint =
		typeof data.pinpoint === 'string'
			? JSON.parse(data.pinpoint)
			: data.pinpoint;
	if (pinpoint?.campaign) {
		return {
			source: '_campaign',
			attributes: pinpoint.campaign,
		};
	}
	if (pinpoint?.journey) {
		return {
			source: '_journey',
			attributes: pinpoint.journey,
		};
	}
};
