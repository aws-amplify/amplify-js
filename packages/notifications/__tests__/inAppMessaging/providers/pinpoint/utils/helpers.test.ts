// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type { InAppMessageCampaign as PinpointInAppMessage } from '@aws-amplify/core/internals/aws-clients/pinpoint';
import cloneDeep from 'lodash/cloneDeep';

import {
	clearMemo,
	extractContent,
	extractMetadata,
	getStartOfDay,
	isBeforeEndDate,
	mapOSPlatform,
	matchesAttributes,
	matchesEventType,
	matchesMetrics,
} from '../../../../../src/inAppMessaging/providers/pinpoint/utils/helpers';

import {
	extractedContent,
	extractedMetadata,
	pinpointInAppMessage,
	browserConfigTestCases,
	browserButtonOverrides,
} from '../../../../testUtils/data';
import {  InAppMessagingEvent } from '../../../../../src/inAppMessaging/types';
import {
	mergeExpectedContentWithExpectedOverride,
	mergeInAppMessageWithOverrides,
} from '../../../../testUtils/mergeInAppMessageWithOverrides';

jest.mock('@aws-amplify/core');
jest.mock('@aws-amplify/core/internals/providers/pinpoint');
jest.mock('../../../../../src/inAppMessaging/providers/pinpoint/utils');

jest.mock('@aws-amplify/core/internals/utils', () => {
	const originalModule = jest.requireActual(
		'@aws-amplify/core/internals/utils',
	);
	return {
		...originalModule,
		getClientInfo: jest.fn(), // Setup as a Jest mock function without implementation
	};
});

const HOUR_IN_MS = 1000 * 60 * 60;

describe('InAppMessaging Provider Utils', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('getStartOfDay returns a date string for the start of day', () => {
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

		it('checks if an event name matches a Pinpoint message', () => {
			const clickEvent: InAppMessagingEvent = { name: 'clicked' };
			const swipeEvent: InAppMessagingEvent = { name: 'swiped' };
			const dragEvent: InAppMessagingEvent = { name: 'dragged' };

			expect(matchesEventType(message, clickEvent)).toBe(true);
			expect(matchesEventType(message, swipeEvent)).toBe(true);
			expect(matchesEventType(message, dragEvent)).toBe(false);
		});

		it('memoizes matches', () => {
			const clickEvent: InAppMessagingEvent = { name: 'clicked' };
			message!.Schedule!.EventFilter!.Dimensions!.EventType!.Values = [
				'clicked',
			];

			expect(matchesEventType(message, clickEvent)).toBe(true);

			// This is a contrived way of validating the memo logic and should never happen in practice
			message!.Schedule!.EventFilter!.Dimensions!.EventType!.Values = [];

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

		it('checks if event attributes matches a Pinpoint message', () => {
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

			message!.Schedule!.EventFilter!.Dimensions!.Attributes = {
				favoriteFood: { Values: ['pizza', 'sushi'] },
				favoriteAnimal: { Values: ['dog', 'giraffe'] },
			};

			expect(matchesAttributes(message, matchingEvent)).toBe(true);
			expect(matchesAttributes(message, nonMatchingEvent)).toBe(false);
			expect(matchesAttributes(message, missingAttributesEvent)).toBe(false);
			expect(matchesAttributes(message, noAttributesEvent)).toBe(false);
		});

		it('memoizes matches', () => {
			const event: InAppMessagingEvent = {
				name: 'action.taken',
				attributes: { favoriteFood: 'sushi' },
			};
			message!.Schedule!.EventFilter!.Dimensions!.Attributes = {
				favoriteFood: { Values: ['pizza', 'sushi'] },
			};

			expect(matchesAttributes(message, event)).toBe(true);

			// This is a contrived way of validating the memo logic and should never happen in practice
			message!.Schedule!.EventFilter!.Dimensions!.Attributes = {
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

		it('checks if event metrics matches a Pinpoint message', () => {
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

			message!.Schedule!.EventFilter!.Dimensions!.Metrics = {
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

			message!.Schedule!.EventFilter!.Dimensions!.Metrics = {
				lotSize: { ComparisonOperator: 'GREATER_OR_LESS_THAN', Value: 1000 },
			};

			expect(matchesMetrics(message, matchingEvent)).toBe(false);
		});

		it('memoizes matches', () => {
			const event: InAppMessagingEvent = {
				name: 'action.taken',
				metrics: { lotSize: 2000 },
			};
			message!.Schedule!.EventFilter!.Dimensions!.Metrics = {
				lotSize: { ComparisonOperator: 'GREATER_THAN', Value: 1000 },
			};

			expect(matchesMetrics(message, event)).toBe(true);

			// This is a contrived way of validating the memo logic and should never happen in practice
			message!.Schedule!.EventFilter!.Dimensions!.Metrics = {
				lotSize: { ComparisonOperator: 'LESS_THAN', Value: 1000 },
			};

			expect(matchesMetrics(message, event)).toBe(true);

			clearMemo();

			expect(matchesMetrics(message, event)).toBe(false);
		});
	});

	it('isBeforeEndDate checks if a message is still not yet at its end', () => {
		const message = cloneDeep(pinpointInAppMessage);

		expect(isBeforeEndDate(message)).toBe(false);

		// Set the end date to 24 hours from now
		message!.Schedule!.EndDate = new Date(
			new Date().getTime() + HOUR_IN_MS * 24,
		).toISOString();

		expect(isBeforeEndDate(message)).toBe(true);

		message!.Schedule!.EndDate = undefined;

		expect(isBeforeEndDate(message)).toBe(true);
	});

	it('extractContent extracts Pinpoint content into a normalized shape', () => {
		const message = cloneDeep(pinpointInAppMessage);

		expect(extractContent(message)).toStrictEqual(extractedContent);
	});

	it('extractMetadata extracts Pinpoint metadata into a flat object', () => {
		const message = cloneDeep(pinpointInAppMessage);

		expect(extractMetadata(message)).toStrictEqual(extractedMetadata);
	});

	describe('mapOSPlatform method (running in a browser)', () => {
		browserConfigTestCases.forEach(({ os, expectedPlatform }) => {
			test(`correctly maps OS "${os}" to ConfigPlatformType "${expectedPlatform}"`, () => {
				const result = mapOSPlatform(os);
				expect(result).toBe(expectedPlatform);
			});
		});
	});

	describe('extractContent with overrides (running in a browser)', () => {
		browserButtonOverrides.forEach(
			({ buttonOverrides, configPlatform, mappedPlatform }) => {
				const message = mergeInAppMessageWithOverrides(
					pinpointInAppMessage,
					mappedPlatform,
					buttonOverrides,
				);
				const expectedContent = mergeExpectedContentWithExpectedOverride(
					extractedContent[0],
					buttonOverrides,
				);

				test(`correctly extracts content for ${configPlatform}`, () => {
					const utils = require('@aws-amplify/core/internals/utils');
					// Dynamically override the mock for getClientInfo
					utils.getClientInfo.mockImplementation(() => ({
						platform: configPlatform,
					}));

					const [firstContent] = extractContent(message);
					expect(firstContent.primaryButton).toStrictEqual(
						expectedContent.primaryButton,
					);
					expect(firstContent.secondaryButton).toStrictEqual(
						expectedContent.secondaryButton,
					);
				});
			},
		);
	});
});
