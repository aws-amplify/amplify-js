// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Event as AWSPinpointAnalyticsEvent } from '@aws-amplify/core/internals/aws-clients/pinpoint';
import { ConsoleLogger, Hub } from '@aws-amplify/core';
import { AMPLIFY_SYMBOL } from '../../../common';
import { PushNotificationMessage } from '../../types';
import {
	AWSPinpointMessageEventSource,
	AWSPinpointMessageEvent,
} from './types';

const ANDROID_CAMPAIGN_ACTIVITY_ID_KEY =
	'pinpoint.campaign.campaign_activity_id';
const ANDROID_CAMPAIGN_ID_KEY = 'pinpoint.campaign.campaign_id';
const ANDROID_CAMPAIGN_TREATMENT_ID_KEY = 'pinpoint.campaign.treatment_id';

export const logger = new ConsoleLogger('PushNotification.AWSPinpointProvider');

export const dispatchPushNotificationEvent = (
	event: string,
	data: any,
	message?: string
) => {
	Hub.dispatch(
		'pushNotification',
		{ event, data, message },
		'PushNotification',
		AMPLIFY_SYMBOL
	);
};

export const getAnalyticsEvent = (
	{ data }: PushNotificationMessage,
	event: AWSPinpointMessageEvent
): AWSPinpointAnalyticsEvent | null => {
	if (!data) {
		return null;
	}
	const eventAttributes = getAnalyticsEventAttributes(data);
	if (!eventAttributes) {
		return null;
	}
	const { source, attributes } = eventAttributes;
	return {
		Attributes: attributes,
		EventType: `${source}.${event}`,
		Timestamp: new Date().toISOString(),
	};
};

const getAnalyticsEventAttributes = (data: PushNotificationMessage['data']) => {
	if (data.hasOwnProperty(ANDROID_CAMPAIGN_ID_KEY)) {
		return {
			source: AWSPinpointMessageEventSource.CAMPAIGN,
			attributes: {
				campaign_activity_id: data[ANDROID_CAMPAIGN_ACTIVITY_ID_KEY],
				campaign_id: data[ANDROID_CAMPAIGN_ID_KEY],
				treatment_id: data[ANDROID_CAMPAIGN_TREATMENT_ID_KEY],
			},
		};
	}
	const pinpoint =
		typeof data.pinpoint === 'string'
			? JSON.parse(data.pinpoint)
			: data.pinpoint;
	if (pinpoint?.campaign) {
		return {
			source: AWSPinpointMessageEventSource.CAMPAIGN,
			attributes: pinpoint.campaign,
		};
	}
	if (pinpoint?.journey) {
		return {
			source: AWSPinpointMessageEventSource.JOURNEY,
			attributes: pinpoint.journey,
		};
	}
};
