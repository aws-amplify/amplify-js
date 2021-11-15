import { Amplify, ConsoleLogger, Hub } from '@aws-amplify/core';
import { InAppMessageCampaign as PinpointInAppMessage } from '@aws-sdk/client-pinpoint';
import isEmpty from 'lodash/isEmpty';
import {
	InAppMessage,
	InAppMessageAction,
	InAppMessageContent,
	InAppMessageTextAlign,
	InAppMessagingEvent,
} from '../../types';
import { AWSPinpointMessageEvent, MetricsComparator } from './types';

const AMPLIFY_SYMBOL = (
	typeof Symbol !== 'undefined' && typeof Symbol.for === 'function'
		? Symbol.for('amplify_default')
		: '@@amplify_default'
) as Symbol;
const DELIVERY_TYPE = 'IN_APP_MESSAGE';

let eventNameMemo = {};
let eventAttributesMemo = {};
let eventMetricsMemo = {};

export const logger = new ConsoleLogger('AWSPinpointProvider');

export const dispatchInAppMessagingEvent = (
	event: string,
	data: any,
	message?: string
) => {
	Hub.dispatch(
		'inAppMessaging',
		{ event, data, message },
		'InAppMessaging',
		AMPLIFY_SYMBOL
	);
};

export const recordAnalyticsEvent = (
	event: AWSPinpointMessageEvent,
	message: InAppMessage
) => {
	if (!message) {
		logger.debug(
			'Unable to record analytics event - no InAppMessage was received'
		);
		return;
	}
	if (Amplify.Analytics && typeof Amplify.Analytics.record === 'function') {
		const { id, metadata } = message;
		Amplify.Analytics.record({
			name: event,
			attributes: {
				campaign_id: id,
				delivery_type: DELIVERY_TYPE,
				treatment_id: metadata?.treatmentId,
			},
		});
	} else {
		logger.debug('Analytics module is not registered into Amplify');
	}
};

export const getStartOfDay = (): string => {
	const now = new Date();
	now.setHours(0, 0, 0, 0);
	return now.toISOString();
};

export const matchesEventType = (
	{ CampaignId, Schedule }: PinpointInAppMessage,
	{ name: eventType }: InAppMessagingEvent
) => {
	const { EventType } = Schedule?.EventFilter?.Dimensions;
	const memoKey = `${CampaignId}:${eventType}`;
	if (!eventNameMemo.hasOwnProperty(memoKey)) {
		eventNameMemo[memoKey] = !!EventType?.Values.includes(eventType);
	}
	return eventNameMemo[memoKey];
};

export const matchesAttributes = (
	{ CampaignId, Schedule }: PinpointInAppMessage,
	{ attributes }: InAppMessagingEvent
): boolean => {
	const { Attributes } = Schedule?.EventFilter?.Dimensions;
	if (isEmpty(Attributes)) {
		// if message does not have attributes defined it does not matter what attributes are on the event
		return true;
	}
	if (isEmpty(attributes)) {
		// if message does have attributes but the event does not then it always fails the check
		return false;
	}
	const memoKey = `${CampaignId}:${JSON.stringify(attributes)}`;
	if (!eventAttributesMemo.hasOwnProperty(memoKey)) {
		eventAttributesMemo[memoKey] = Object.entries(Attributes).every(
			([key, { Values }]) => Values.includes(attributes[key])
		);
	}
	return eventAttributesMemo[memoKey];
};

export const matchesMetrics = (
	{ CampaignId, Schedule }: PinpointInAppMessage,
	{ metrics }: InAppMessagingEvent
): boolean => {
	const { Metrics } = Schedule?.EventFilter?.Dimensions;
	if (isEmpty(Metrics)) {
		// if message does not have metrics defined it does not matter what metrics are on the event
		return true;
	}
	if (isEmpty(metrics)) {
		// if message does have metrics but the event does not then it always fails the check
		return false;
	}
	const memoKey = `${CampaignId}:${JSON.stringify(metrics)}`;
	if (!eventMetricsMemo.hasOwnProperty(memoKey)) {
		eventMetricsMemo[memoKey] = Object.entries(Metrics).every(
			([key, { ComparisonOperator, Value }]) => {
				const compare = getComparator(ComparisonOperator);
				// if there is some unknown comparison operator, treat as a comparison failure
				return compare ? compare(Value, metrics[key]) : false;
			}
		);
	}
	return eventMetricsMemo[memoKey];
};

export const getComparator = (operator: string): MetricsComparator => {
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
			return null;
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
		0
	);
	end.setHours(
		Number.parseInt(endHours, 10),
		Number.parseInt(endMinutes, 10),
		0,
		0
	);

	// if quiet time includes midnight, bump the end time to the next day
	if (start > end) {
		end.setDate(end.getDate() + 1);
	}

	const isQuietTime = now >= start && now <= end;
	if (isQuietTime) {
		logger.debug('message filtered due to quiet time', message);
	}
	return isQuietTime;
};

export const clearMemo = () => {
	eventNameMemo = {};
	eventAttributesMemo = {};
	eventMetricsMemo = {};
};

export const extractContent = ({
	InAppMessage: message,
}: PinpointInAppMessage): InAppMessageContent[] => {
	return (
		message?.Content?.map((content) => {
			const {
				BackgroundColor,
				BodyConfig,
				HeaderConfig,
				ImageUrl,
				PrimaryBtn,
				SecondaryBtn,
			} = content;
			const defaultPrimaryButton = PrimaryBtn?.DefaultConfig;
			const defaultSecondaryButton = SecondaryBtn?.DefaultConfig;
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
					content: HeaderConfig.Header,
					style: {
						color: HeaderConfig.TextColor,
						textAlign:
							HeaderConfig.Alignment.toLowerCase() as InAppMessageTextAlign,
					},
				};
			}
			if (BodyConfig) {
				extractedContent.body = {
					content: BodyConfig.Body,
					style: {
						color: BodyConfig.TextColor,
						textAlign:
							BodyConfig.Alignment.toLowerCase() as InAppMessageTextAlign,
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
					title: defaultPrimaryButton.Text,
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
					title: defaultSecondaryButton.Text,
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
	InAppMessage,
	Priority,
	Schedule,
	TreatmentId,
}: PinpointInAppMessage): InAppMessage['metadata'] => ({
	customData: InAppMessage?.CustomConfig,
	endDate: Schedule?.EndDate,
	priority: Priority,
	treatmentId: TreatmentId,
});
