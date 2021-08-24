import { ConsoleLogger, Hub } from '@aws-amplify/core';
import isEmpty from 'lodash/isEmpty';
import {
	ComparisonOperator,
	InAppMessage,
	MetricsComparator,
	NotificationEvent,
} from '../../types';

const AMPLIFY_SYMBOL = (typeof Symbol !== 'undefined' &&
typeof Symbol.for === 'function'
	? Symbol.for('amplify_default')
	: '@@amplify_default') as Symbol;

export const logger = new ConsoleLogger('AWSPinpointProvider');

export const dispatchNotificationEvent = (
	event: string,
	data: any,
	message?: string
) => {
	Hub.dispatch(
		'notification',
		{ event, data, message },
		'Notification',
		AMPLIFY_SYMBOL
	);
};

export const getStartOfDay = (): string => {
	const now = new Date();
	now.setHours(0, 0, 0, 0);
	return now.toISOString();
};

export const matchesEventType = (
	{ Schedule }: InAppMessage,
	{ name: eventType }: NotificationEvent
) => {
	const { EventType } = Schedule.EventFilter.Dimensions;
	return EventType && EventType.Values.includes(eventType);
};

export const matchesAttributes = (
	{ Schedule }: InAppMessage,
	{ attributes }: NotificationEvent
) => {
	const { Attributes } = Schedule.EventFilter.Dimensions;
	if (isEmpty(Attributes)) {
		// if message does not have attributes defined it does not matter what attributes are on the event
		return true;
	}
	if (isEmpty(attributes)) {
		// if message does have attributes but the event does not then it always fails the check
		return false;
	}
	return Object.entries(Attributes).every(([key, { Values }]) =>
		Values.includes(attributes[key])
	);
};

export const matchesMetrics = (
	{ Schedule }: InAppMessage,
	{ metrics }: NotificationEvent
) => {
	const { Metrics } = Schedule.EventFilter.Dimensions;
	if (isEmpty(Metrics)) {
		// if message does not have metrics defined it does not matter what metrics are on the event
		return true;
	}
	if (isEmpty(metrics)) {
		// if message does have metrics but the event does not then it always fails the check
		return false;
	}
	return Object.entries(Metrics).every(
		([key, { ComparisonOperator, Value }]) => {
			const compare = getComparator(ComparisonOperator);
			return compare(Value, metrics[key]);
		}
	);
};

export const getComparator = (
	operator: ComparisonOperator
): MetricsComparator => {
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
	}
};

export const isBeforeEndDate = ({ Schedule }: InAppMessage) => {
	return new Date() < new Date(Schedule.EndDate);
};

export const isQuietTime = (message: InAppMessage): boolean => {
	const { Schedule } = message;
	if (!Schedule.QuietTime) {
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

	start.setHours(startHours, startMinutes, 0, 0);
	end.setHours(endHours, endMinutes, 0, 0);

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
