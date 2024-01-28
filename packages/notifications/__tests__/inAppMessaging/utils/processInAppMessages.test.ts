// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	pinpointInAppMessage,
	simpleInAppMessagingEvent,
} from '../../testUtils/data';
import {
	incrementMessageCounts,
	processInAppMessages,
} from '../../../src/inAppMessaging/providers/pinpoint/utils';
import { cloneDeep } from 'lodash';
import {
	isBeforeEndDate,
	matchesAttributes,
	matchesEventType,
	matchesMetrics,
} from '../../../src/inAppMessaging/providers/pinpoint/utils/helpers';
import { initializeInAppMessaging } from '../../../src/inAppMessaging/providers/pinpoint/apis';

jest.mock('@aws-amplify/core');
jest.mock('@aws-amplify/core/internals/utils', () => {
	const originalModule = jest.requireActual(
		'@aws-amplify/core/internals/utils'
	);
	return {
		...originalModule,
		getClientInfo: jest.fn().mockImplementation(() => ({
			platform: 'android',
		})),
	};
});
jest.mock('../../../src/inAppMessaging/providers/pinpoint/utils/helpers');

const mockIsBeforeEndDate = isBeforeEndDate as jest.Mock;
const mockMatchesAttributes = matchesAttributes as jest.Mock;
const mockMatchesEventType = matchesEventType as jest.Mock;
const mockMatchesMetrics = matchesMetrics as jest.Mock;

describe('processInAppMessages', () => {
	const messages = [
		cloneDeep(pinpointInAppMessage),
		{ ...cloneDeep(pinpointInAppMessage), CampaignId: 'uuid-2', Priority: 3 },
		{
			...cloneDeep(pinpointInAppMessage),
			CampaignId: 'uuid-3',
			Priority: 1,
			SessionCap: 1,
		},
		{
			...cloneDeep(pinpointInAppMessage),
			CampaignId: 'uuid-4',
			Priority: 2,
			SessionCap: 2,
		},
	];
	beforeAll(() => {
		initializeInAppMessaging();
	});
	beforeEach(() => {
		mockMatchesEventType.mockReturnValue(true);
		mockMatchesAttributes.mockReturnValue(true);
		mockMatchesMetrics.mockReturnValue(true);
		mockIsBeforeEndDate.mockReturnValue(true);
	});

	it('filters in-app messages from Pinpoint by criteria', async () => {
		mockMatchesEventType.mockReturnValueOnce(false);
		mockMatchesAttributes.mockReturnValueOnce(false);
		mockMatchesMetrics.mockReturnValueOnce(false);
		const [result] = await processInAppMessages(
			messages,
			simpleInAppMessagingEvent
		);
		expect(result.id).toBe('uuid-4');
	});

	it('filters in-app messages from Pinpoint by priority', async () => {
		const [result] = await processInAppMessages(
			messages,
			simpleInAppMessagingEvent
		);
		expect(result.id).toBe('uuid-3');
	});

	it('filters in-app messages based on session counts', async () => {
		// simulate incrementing the counts as this happens when a message is displayed
		// increment it twice to exceed it's session cap
		await incrementMessageCounts(messages[2].CampaignId!);
		await incrementMessageCounts(messages[2].CampaignId!);

		const [result] = await processInAppMessages(
			messages,
			simpleInAppMessagingEvent
		);
		expect(result.id).toBe('uuid-4');
	});
});
