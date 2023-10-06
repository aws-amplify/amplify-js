// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { defaultStorage } from '@aws-amplify/core';
import {
	dispatchEvent,
	setConflictHandler,
} from '../../../../../src/inAppMessaging/providers/pinpoint/apis';
import { processInAppMessages } from '../../../../../src/inAppMessaging/providers/pinpoint/utils';
import {
	closestExpiryMessage,
	customHandledMessage,
	inAppMessages,
	simpleInAppMessagingEvent,
} from '../../../../../__mocks__/data';
import { notifyEventListeners } from '../../../../../src/common/eventListeners';

jest.mock('@aws-amplify/core');
jest.mock('@aws-amplify/core/internals/utils');
jest.mock('../../../../../src/inAppMessaging/providers/pinpoint/utils');
jest.mock('../../../../../src/common/eventListeners');

const mockDefaultStorage = defaultStorage as jest.Mocked<typeof defaultStorage>;
const mockNotifyEventListeners = notifyEventListeners as jest.Mock;
const mockProcessInAppMessages = processInAppMessages as jest.Mock;

describe('Conflict handling', () => {
	beforeEach(() => {
		mockDefaultStorage.setItem.mockClear();
		mockNotifyEventListeners.mockClear();
	});
	test('has a default implementation', async () => {
		mockProcessInAppMessages.mockReturnValueOnce(inAppMessages);
		await dispatchEvent(simpleInAppMessagingEvent);
		expect(mockNotifyEventListeners).toBeCalledWith(
			'messageReceived',
			closestExpiryMessage
		);
	});

	test('can be customized through setConflictHandler', async () => {
		const customConflictHandler = messages =>
			messages.find(message => message.id === 'custom-handled');
		mockProcessInAppMessages.mockReturnValueOnce(inAppMessages);

		setConflictHandler(customConflictHandler);
		await dispatchEvent(simpleInAppMessagingEvent);

		expect(mockNotifyEventListeners).toBeCalledWith(
			'messageReceived',
			customHandledMessage
		);
	});
});
