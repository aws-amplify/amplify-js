// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger } from '@aws-amplify/core';
import {
	InAppMessagingAction,
	getClientInfo,
} from '@aws-amplify/core/internals/utils';
import type {
	InAppMessageButton,
	InAppMessageCampaign as PinpointInAppMessage,
} from '@aws-amplify/core/internals/aws-clients/pinpoint';
import isEmpty from 'lodash/isEmpty.js';
import { record as recordCore } from '@aws-amplify/core/internals/providers/pinpoint';

import {
	InAppMessage,
	InAppMessageAction,
	InAppMessageContent,
	InAppMessageLayout,
	InAppMessageTextAlign,
	InAppMessagingEvent,
} from '../../../types';
import { MetricsComparator, PinpointMessageEvent } from '../types';
import { ButtonConfigPlatform } from '../../../types/message';

import { resolveConfig } from './resolveConfig';
import { resolveCredentials } from './resolveCredentials';
import { CATEGORY } from './constants';
import { getInAppMessagingUserAgentString } from './userAgent';

const DELIVERY_TYPE = 'IN_APP_MESSAGE';

let eventNameMemo: Record<string, boolean> = {};
let eventAttributesMemo: Record<string, boolean> = {};
let eventMetricsMemo: Record<string, boolean> = {};

export const logger = new ConsoleLogger('InAppMessaging.Pinpoint.Utils');

export const recordAnalyticsEvent = (
	event: PinpointMessageEvent,
	message: InAppMessage,
) => {
	const { appId, region } = resolveConfig();

	const { id, metadata } = message;
	resolveCredentials()
		.then(({ credentials, identityId }) => {
			recordCore({
				appId,
				category: CATEGORY,
				credentials,
				event: {
					name: event,
					attributes: {
						// only include campaign_id field if we have one
						...(id && { campaign_id: id }),
						delivery_type: DELIVERY_TYPE,
						treatment_id: metadata?.treatmentId,
					},
				},
				identityId,
				region,
				userAgentValue: getInAppMessagingUserAgentString(
					InAppMessagingAction.NotifyMessageInteraction,
				),
			});
		})
		.catch(e => {
			// An error occured while fetching credentials or persisting the event to the buffer
			logger.warn('Failed to record event.', e);
		});
};

export const getStartOfDay = (): string => {
	const now = new Date();
	now.setHours(0, 0, 0, 0);

	return now.toISOString();
};

export const matchesEventType = (
	{ CampaignId, Schedule }: PinpointInAppMessage,
	{ name: eventType }: InAppMessagingEvent,
) => {
	const { EventType } = Schedule?.EventFilter?.Dimensions ?? {};
	const memoKey = `${CampaignId}:${eventType}`;
	if (!Object.prototype.hasOwnProperty.call(eventNameMemo, memoKey)) {
		eventNameMemo[memoKey] = !!EventType?.Values?.includes(eventType);
	}

	return eventNameMemo[memoKey];
};

export const matchesAttributes = (
	{ CampaignId, Schedule }: PinpointInAppMessage,
	{ attributes = {} }: InAppMessagingEvent,
): boolean => {
	const { Attributes } = Schedule?.EventFilter?.Dimensions ?? {};
	if (isEmpty(Attributes)) {
		// if message does not have attributes defined it does not matter what attributes are on the event
		return true;
	}
	if (isEmpty(attributes)) {
		// if message does have attributes but the event does not then it always fails the check
		return false;
	}
	const memoKey = `${CampaignId}:${JSON.stringify(attributes)}`;
	if (!Object.prototype.hasOwnProperty.call(eventAttributesMemo, memoKey)) {
		eventAttributesMemo[memoKey] =
			!Attributes ||
			Object.entries(Attributes).every(([key, { Values }]) =>
				Values?.includes(attributes[key]),
			);
	}

	return eventAttributesMemo[memoKey];
};

export const matchesMetrics = (
	{ CampaignId, Schedule }: PinpointInAppMessage,
	{ metrics = {} }: InAppMessagingEvent,
): boolean => {
	const { Metrics } = Schedule?.EventFilter?.Dimensions ?? {};
	if (isEmpty(Metrics)) {
		// if message does not have metrics defined it does not matter what metrics are on the event
		return true;
	}
	if (isEmpty(metrics)) {
		// if message does have metrics but the event does not then it always fails the check
		return false;
	}
	const memoKey = `${CampaignId}:${JSON.stringify(metrics)}`;
	if (!Object.prototype.hasOwnProperty.call(eventMetricsMemo, memoKey)) {
		eventMetricsMemo[memoKey] =
			!Metrics ||
			Object.entries(Metrics).every(([key, { ComparisonOperator, Value }]) => {
				const compare = getComparator(ComparisonOperator);

				// if there is some unknown comparison operator, treat as a comparison failure
				return compare && !!Value ? compare(Value, metrics[key]) : false;
			});
	}

	return eventMetricsMemo[memoKey];
};

export const getComparator = (
	operator?: string,
): MetricsComparator | undefined => {
	switch (operator) {
		case 'EQUAL':
			return (metricsVal, eventVal) => metricsVal === eventVal;
		case 'GREATER_THAN':
			return (metricsVal, eventVal) => metricsVal < eventVal;
		case 'GREATER_THAN_OR_EQUAL':
			return (metricsVal, eventVal) => metricsVal <= eventVal;
		case 'LESS_THAN':
			return (metricsVal, eventVal) => metricsVal > eventVal;
		case 'LESS_THAN_OR_EQUAL':
			return (metricsVal, eventVal) => metricsVal >= eventVal;
		default:
			return undefined;
	}
};

export const isBeforeEndDate = ({
	Schedule,
}: PinpointInAppMessage): boolean => {
	if (!Schedule?.EndDate) {
		return true;
	}

	return new Date() < new Date(Schedule.EndDate);
};

export const isQuietTime = (message: PinpointInAppMessage): boolean => {
	const { Schedule } = message;
	if (!Schedule?.QuietTime) {
		return false;
	}

	const pattern = /^[0-2]\d:[0-5]\d$/; // basic sanity check, not a fully featured HH:MM validation
	const { Start, End } = Schedule.QuietTime;
	if (
		!Start ||
		!End ||
		Start === End ||
		!pattern.test(Start) ||
		!pattern.test(End)
	) {
		return false;
	}

	const now = new Date();
	const start = new Date(now);
	const end = new Date(now);
	const [startHours, startMinutes] = Start.split(':');
	const [endHours, endMinutes] = End.split(':');

	start.setHours(
		Number.parseInt(startHours, 10),
		Number.parseInt(startMinutes, 10),
		0,
		0,
	);
	end.setHours(
		Number.parseInt(endHours, 10),
		Number.parseInt(endMinutes, 10),
		0,
		0,
	);

	// if quiet time includes midnight, bump the end time to the next day
	if (start > end) {
		end.setDate(end.getDate() + 1);
	}

	const isDuringQuietTime = now >= start && now <= end;
	if (isDuringQuietTime) {
		logger.debug('message filtered due to quiet time', message);
	}

	return isDuringQuietTime;
};

export const clearMemo = () => {
	eventNameMemo = {};
	eventAttributesMemo = {};
	eventMetricsMemo = {};
};

// in the pinpoint console when a message is created with a Modal or Full Screen layout,
// it is assigned a layout value of MOBILE_FEED or OVERLAYS respectively in the message payload.
// In the future, Pinpoint will be updating the layout values in the aforementioned scenario
// to MODAL and FULL_SCREEN.
//
// This utility acts as a safeguard to ensure that:
// - 1. the usage of MOBILE_FEED and OVERLAYS as values for message layouts are not leaked
//      outside the Pinpoint provider
// - 2. Amplify correctly handles the legacy layout values from Pinpoint after they are updated

export const interpretLayout = (
	layout: NonNullable<PinpointInAppMessage['InAppMessage']>['Layout'],
): InAppMessageLayout => {
	if (layout === 'MOBILE_FEED') {
		return 'MODAL';
	}

	if (layout === 'OVERLAYS') {
		return 'FULL_SCREEN';
	}

	// cast as PinpointInAppMessage['InAppMessage']['Layout'] allows `string` as a value
	return layout as InAppMessageLayout;
};

export const extractContent = ({
	InAppMessage: message,
}: PinpointInAppMessage): InAppMessageContent[] => {
	const clientInfo = getClientInfo();
	const configPlatform = mapOSPlatform(clientInfo?.platform);

	return (
		message?.Content?.map(content => {
			const {
				BackgroundColor,
				BodyConfig,
				HeaderConfig,
				ImageUrl,
				PrimaryBtn,
				SecondaryBtn,
			} = content;

			const defaultPrimaryButton = getButtonConfig(configPlatform, PrimaryBtn);
			const defaultSecondaryButton = getButtonConfig(
				configPlatform,
				SecondaryBtn,
			);

			const extractedContent: InAppMessageContent = {};
			if (BackgroundColor) {
				extractedContent.container = {
					style: {
						backgroundColor: BackgroundColor,
					},
				};
			}
			if (HeaderConfig) {
				extractedContent.header = {
					// Default to empty string in rare cases we don't have a Header value
					content: HeaderConfig.Header ?? '',
					style: {
						color: HeaderConfig.TextColor,
						textAlign:
							HeaderConfig.Alignment?.toLowerCase() as InAppMessageTextAlign,
					},
				};
			}
			if (BodyConfig) {
				extractedContent.body = {
					// Default to empty string in rare cases we don't have a Body value
					content: BodyConfig.Body ?? '',
					style: {
						color: BodyConfig.TextColor,
						textAlign:
							BodyConfig.Alignment?.toLowerCase() as InAppMessageTextAlign,
					},
				};
			}
			if (ImageUrl) {
				extractedContent.image = {
					src: ImageUrl,
				};
			}
			if (defaultPrimaryButton) {
				extractedContent.primaryButton = {
					// Default to empty string in rare cases we don't have a Text value
					title: defaultPrimaryButton.Text ?? '',
					action: defaultPrimaryButton.ButtonAction as InAppMessageAction,
					url: defaultPrimaryButton.Link,
					style: {
						backgroundColor: defaultPrimaryButton.BackgroundColor,
						borderRadius: defaultPrimaryButton.BorderRadius,
						color: defaultPrimaryButton.TextColor,
					},
				};
			}
			if (defaultSecondaryButton) {
				extractedContent.secondaryButton = {
					// Default to empty string in rare cases we don't have a Text value
					title: defaultSecondaryButton.Text ?? '',
					action: defaultSecondaryButton.ButtonAction as InAppMessageAction,
					url: defaultSecondaryButton.Link,
					style: {
						backgroundColor: defaultSecondaryButton.BackgroundColor,
						borderRadius: defaultSecondaryButton.BorderRadius,
						color: defaultSecondaryButton.TextColor,
					},
				};
			}

			return extractedContent;
		}) ?? []
	);
};

export const extractMetadata = ({
	InAppMessage: inAppMessage,
	Priority,
	Schedule,
	TreatmentId,
}: PinpointInAppMessage): InAppMessage['metadata'] => ({
	customData: inAppMessage?.CustomConfig,
	endDate: Schedule?.EndDate,
	priority: Priority,
	treatmentId: TreatmentId,
});

export const mapOSPlatform = (os?: string): ButtonConfigPlatform => {
	if (!os) return 'DefaultConfig';
	// Check if running in a web browser
	if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
		return 'Web';
	}
	// Native environment checks
	switch (os) {
		case 'android':
			return 'Android';
		case 'ios':
			return 'IOS';
		default:
			return 'DefaultConfig';
	}
};

const getButtonConfig = (
	configPlatform: ButtonConfigPlatform,
	button?: InAppMessageButton,
): InAppMessageButton['DefaultConfig'] | undefined => {
	if (!button?.DefaultConfig) {
		return;
	}
	if (!configPlatform || !button?.[configPlatform]) {
		return button?.DefaultConfig;
	}

	return {
		...button.DefaultConfig,
		...button[configPlatform],
	};
};
