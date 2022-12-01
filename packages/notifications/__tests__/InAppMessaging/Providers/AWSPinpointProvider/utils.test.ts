// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { InAppMessageCampaign as PinpointInAppMessage } from '@aws-sdk/client-pinpoint';
import { Amplify, ConsoleLogger, Hub } from '@aws-amplify/core';
import cloneDeep from 'lodash/cloneDeep';

import { InAppMessagingEvent } from '../../../../src/InAppMessaging';
import { AWSPinpointMessageEvent } from '../../../../src/InAppMessaging/Providers/AWSPinpointProvider/types';
import {
	clearMemo,
	dispatchInAppMessagingEvent,
	extractContent,
	extractMetadata,
	getStartOfDay,
	isBeforeEndDate,
	isQuietTime,
	matchesAttributes,
	matchesEventType,
	matchesMetrics,
	recordAnalyticsEvent,
} from '../../../../src/InAppMessaging/Providers/AWSPinpointProvider/utils';

import {
	inAppMessages,
	extractedContent,
	extractedMetadata,
	pinpointInAppMessage,
} from '../../../../__mocks__/data';

jest.mock('@aws-amplify/core');

const HOUR_IN_MS = 1000 * 60 * 60;

const loggerDebugSpy = jest.spyOn(ConsoleLogger.prototype, 'debug');

describe('AWSPinpoint InAppMessaging Provider Utils', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('dispatchInAppMessagingEvent dispatches Hub event', () => {
		const event = 'foo';
		const data = { bar: 'baz' };
		const message = 'qux';

		dispatchInAppMessagingEvent(event, data, message);

		expect(Hub.dispatch).toBeCalledWith(
			'inAppMessaging',
			{ event, data, message },
			'InAppMessaging',
			expect.anything() // expect.any(Symbol) is fixed in a later Jest version
		);
	});

	describe('recordAnalyticsEvent', () => {
		Amplify.Analytics = { record: jest.fn() };
		const [message] = inAppMessages;

		test('records an analytics event', () => {
			Amplify.Analytics = { record: jest.fn() };

			recordAnalyticsEvent(AWSPinpointMessageEvent.MESSAGE_DISPLAYED, message);

			expect(Amplify.Analytics.record).toBeCalledWith({
				name: AWSPinpointMessageEvent.MESSAGE_DISPLAYED,
				attributes: {
					campaign_id: 'top-banner',
					delivery_type: 'IN_APP_MESSAGE',
					treatment_id: 'T1',
				},
			});
		});

		test('does not try to record an event without a message', () => {
			recordAnalyticsEvent(AWSPinpointMessageEvent.MESSAGE_DISPLAYED, null);

			expect(loggerDebugSpy).toBeCalledWith(
				expect.stringContaining('Unable to record')
			);
			expect(Amplify.Analytics.record).not.toBeCalled();
		});

		test('does not try to record an event without a message', () => {
			Amplify.Analytics = null;

			recordAnalyticsEvent(AWSPinpointMessageEvent.MESSAGE_DISPLAYED, message);

			expect(loggerDebugSpy).toBeCalledWith(
				expect.stringContaining('module is not registered')
			);
		});
	});

	test('getStartOfDay returns a date string for the start of day', () => {
		const dateString = getStartOfDay();
		const date = new Date(dateString);

		expect(date.getHours()).toBe(0);
		expect(date.getMinutes()).toBe(0);
		expect(date.getSeconds()).toBe(0);
		expect(date.getMilliseconds()).toBe(0);
	});

	describe('matchesEventType', () => {
		let message: PinpointInAppMessage;
		beforeEach(() => {
			message = cloneDeep(pinpointInAppMessage);
			clearMemo();
		});

		test('checks if an event name matches a Pinpoint message', () => {
			const clickEvent: InAppMessagingEvent = { name: 'clicked' };
			const swipeEvent: InAppMessagingEvent = { name: 'swiped' };
			const dragEvent: InAppMessagingEvent = { name: 'dragged' };

			expect(matchesEventType(message, clickEvent)).toBe(true);
			expect(matchesEventType(message, swipeEvent)).toBe(true);
			expect(matchesEventType(message, dragEvent)).toBe(false);
		});

		test('memoizes matches', () => {
			const clickEvent: InAppMessagingEvent = { name: 'clicked' };
			message.Schedule.EventFilter.Dimensions.EventType.Values = ['clicked'];

			expect(matchesEventType(message, clickEvent)).toBe(true);

			// This is a contrived way of validating the memo logic and should never happen in practice
			message.Schedule.EventFilter.Dimensions.EventType.Values = [];

			expect(matchesEventType(message, clickEvent)).toBe(true);

			clearMemo();

			expect(matchesEventType(message, clickEvent)).toBe(false);
		});
	});

	describe('matchesAttributes', () => {
		let message: PinpointInAppMessage;
		beforeEach(() => {
			message = cloneDeep(pinpointInAppMessage);
			clearMemo();
		});

		test('checks if event attributes matches a Pinpoint message', () => {
			const matchingEvent: InAppMessagingEvent = {
				name: 'action.taken',
				attributes: {
					favoriteFood: 'pizza',
					favoriteAnimal: 'dog',
					favoriteHobby: 'skydiving',
				},
			};
			const nonMatchingEvent: InAppMessagingEvent = {
				name: 'action.taken',
				attributes: {
					favoriteFood: 'pizza',
					favoriteAnimal: 'monkey',
				},
			};
			const missingAttributesEvent: InAppMessagingEvent = {
				name: 'action.taken',
				attributes: { favoriteFood: 'sushi' },
			};
			const noAttributesEvent: InAppMessagingEvent = { name: 'action.taken' };

			// Everything matches if there are no attributes on the message
			expect(matchesAttributes(message, matchingEvent)).toBe(true);
			expect(matchesAttributes(message, nonMatchingEvent)).toBe(true);
			expect(matchesAttributes(message, missingAttributesEvent)).toBe(true);
			expect(matchesAttributes(message, noAttributesEvent)).toBe(true);

			clearMemo();

			message.Schedule.EventFilter.Dimensions.Attributes = {
				favoriteFood: { Values: ['pizza', 'sushi'] },
				favoriteAnimal: { Values: ['dog', 'giraffe'] },
			};

			expect(matchesAttributes(message, matchingEvent)).toBe(true);
			expect(matchesAttributes(message, nonMatchingEvent)).toBe(false);
			expect(matchesAttributes(message, missingAttributesEvent)).toBe(false);
			expect(matchesAttributes(message, noAttributesEvent)).toBe(false);
		});

		test('memoizes matches', () => {
			const event: InAppMessagingEvent = {
				name: 'action.taken',
				attributes: { favoriteFood: 'sushi' },
			};
			message.Schedule.EventFilter.Dimensions.Attributes = {
				favoriteFood: { Values: ['pizza', 'sushi'] },
			};

			expect(matchesAttributes(message, event)).toBe(true);

			// This is a contrived way of validating the memo logic and should never happen in practice
			message.Schedule.EventFilter.Dimensions.Attributes = {
				favoriteFood: { Values: ['pizza'] },
			};

			expect(matchesAttributes(message, event)).toBe(true);

			clearMemo();

			expect(matchesAttributes(message, event)).toBe(false);
		});
	});

	describe('matchesMetrics', () => {
		let message: PinpointInAppMessage;
		beforeEach(() => {
			message = cloneDeep(pinpointInAppMessage);
			clearMemo();
		});

		test('checks if event metrics matches a Pinpoint message', () => {
			const matchingEvent: InAppMessagingEvent = {
				name: 'action.taken',
				metrics: {
					lotSize: 2000,
					yearBuilt: 2000,
					bedrooms: 3,
					bathrooms: 2,
					listPrice: 600000,
					viewed: 300,
				},
			};
			const nonMatchingEvent: InAppMessagingEvent = {
				name: 'action.taken',
				metrics: {
					lotSize: 2000,
					yearBuilt: 2000,
					bedrooms: 3,
					bathrooms: 2,
					listPrice: 700000,
				},
			};
			const missingMetricsEvent: InAppMessagingEvent = {
				name: 'action.taken',
				metrics: {
					lotSize: 2000,
					yearBuilt: 2000,
				},
			};
			const noMetricsEvent: InAppMessagingEvent = { name: 'action.taken' };

			// Everything matches if there are no metrics on the message
			expect(matchesMetrics(message, matchingEvent)).toBe(true);
			expect(matchesMetrics(message, nonMatchingEvent)).toBe(true);
			expect(matchesMetrics(message, missingMetricsEvent)).toBe(true);
			expect(matchesMetrics(message, noMetricsEvent)).toBe(true);

			clearMemo();

			message.Schedule.EventFilter.Dimensions.Metrics = {
				lotSize: { ComparisonOperator: 'GREATER_THAN', Value: 1000 },
				yearBuilt: { ComparisonOperator: 'EQUAL', Value: 2000 },
				bedrooms: { ComparisonOperator: 'LESS_THAN_OR_EQUAL', Value: 3 },
				bathrooms: { ComparisonOperator: 'GREATER_THAN_OR_EQUAL', Value: 1 },
				listPrice: { ComparisonOperator: 'LESS_THAN', Value: 700000 },
			};

			expect(matchesMetrics(message, matchingEvent)).toBe(true);
			expect(matchesMetrics(message, nonMatchingEvent)).toBe(false);
			expect(matchesMetrics(message, missingMetricsEvent)).toBe(false);
			expect(matchesMetrics(message, noMetricsEvent)).toBe(false);

			clearMemo();

			message.Schedule.EventFilter.Dimensions.Metrics = {
				lotSize: { ComparisonOperator: 'GREATER_OR_LESS_THAN', Value: 1000 },
			};

			expect(matchesMetrics(message, matchingEvent)).toBe(false);
		});

		test('memoizes matches', () => {
			const event: InAppMessagingEvent = {
				name: 'action.taken',
				metrics: { lotSize: 2000 },
			};
			message.Schedule.EventFilter.Dimensions.Metrics = {
				lotSize: { ComparisonOperator: 'GREATER_THAN', Value: 1000 },
			};

			expect(matchesMetrics(message, event)).toBe(true);

			// This is a contrived way of validating the memo logic and should never happen in practice
			message.Schedule.EventFilter.Dimensions.Metrics = {
				lotSize: { ComparisonOperator: 'LESS_THAN', Value: 1000 },
			};

			expect(matchesMetrics(message, event)).toBe(true);

			clearMemo();

			expect(matchesMetrics(message, event)).toBe(false);
		});
	});

	test('isBeforeEndDate checks if a message is still not yet at its end', () => {
		const message = cloneDeep(pinpointInAppMessage);

		expect(isBeforeEndDate(message)).toBe(false);

		// Set the end date to 24 hours from now
		message.Schedule.EndDate = new Date(
			new Date().getTime() + HOUR_IN_MS * 24
		).toISOString();

		expect(isBeforeEndDate(message)).toBe(true);

		message.Schedule.EndDate = null;

		expect(isBeforeEndDate(message)).toBe(true);
	});

	test('extractContent extracts Pinpoint content into a normalized shape', () => {
		const message = cloneDeep(pinpointInAppMessage);

		expect(extractContent(message)).toStrictEqual(extractedContent);
	});

	test('extractMetadata extracts Pinpoint metadata into a flat object', () => {
		const message = cloneDeep(pinpointInAppMessage);

		expect(extractMetadata(message)).toStrictEqual(extractedMetadata);
	});
});
