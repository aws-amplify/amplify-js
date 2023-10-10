// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	pinpointInAppMessage,
	simpleInAppMessagingEvent,
} from '../../../__mocks__/data';
import { processInAppMessages } from '../../../src/inAppMessaging/providers/pinpoint/utils/processInAppMessages';
import { cloneDeep } from 'lodash';
import {
	isBeforeEndDate,
	matchesAttributes,
	matchesEventType,
	matchesMetrics,
} from '../../../src/inAppMessaging/providers/pinpoint/utils/helpers';

jest.mock('@aws-amplify/core');
jest.mock('@aws-amplify/core/internals/utils');
jest.mock('../../../src/inAppMessaging/providers/pinpoint/utils/helpers');

const mockIsBeforeEndDate = isBeforeEndDate as jest.Mock;
const mockMatchesAttributes = matchesAttributes as jest.Mock;
const mockMatchesEventType = matchesEventType as jest.Mock;
const mockMatchesMetrics = matchesMetrics as jest.Mock;

// TODO(V6): Add tests for session cap etc
describe('processInAppMessages', () => {
	const messages = [
		cloneDeep(pinpointInAppMessage),
		{ ...cloneDeep(pinpointInAppMessage), CampaignId: 'uuid-2', Priority: 3 },
		{ ...cloneDeep(pinpointInAppMessage), CampaignId: 'uuid-3', Priority: 1 },
		{ ...cloneDeep(pinpointInAppMessage), CampaignId: 'uuid-4', Priority: 2 },
	];
	beforeEach(() => {
		mockMatchesEventType.mockReturnValue(true);
		mockMatchesAttributes.mockReturnValue(true);
		mockMatchesMetrics.mockReturnValue(true);
		mockIsBeforeEndDate.mockReturnValue(true);
	});

	test('filters in-app messages from Pinpoint by criteria', async () => {
		mockMatchesEventType.mockReturnValueOnce(false);
		mockMatchesAttributes.mockReturnValueOnce(false);
		mockMatchesMetrics.mockReturnValueOnce(false);
		const [result] = await processInAppMessages(
			messages,
			simpleInAppMessagingEvent
		);
		expect(result.id).toBe('uuid-4');
	});

	test('filters in-app messages from Pinpoint by criteria', async () => {
		const [result] = await processInAppMessages(
			messages,
			simpleInAppMessagingEvent
		);
		expect(result.id).toBe('uuid-3');
	});
});
