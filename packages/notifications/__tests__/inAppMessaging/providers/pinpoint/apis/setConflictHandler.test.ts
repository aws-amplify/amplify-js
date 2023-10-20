// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { defaultStorage } from '@aws-amplify/core';
import {
	dispatchEvent,
	initializeInAppMessaging,
	setConflictHandler,
} from '../../../../../src/inAppMessaging/providers/pinpoint/apis';
import { processInAppMessages } from '../../../../../src/inAppMessaging/providers/pinpoint/utils';
import {
	customHandledMessage,
	inAppMessages,
	simpleInAppMessagingEvent,
} from '../../../../../__mocks__/data';
import { notifyEventListeners } from '../../../../../src/eventListeners';
import { InAppMessage } from '../../../../../src/inAppMessaging/types';

jest.mock('@aws-amplify/core');
jest.mock('@aws-amplify/core/internals/utils');
jest.mock('../../../../../src/inAppMessaging/providers/pinpoint/utils');
jest.mock('../../../../../src/eventListeners');

const mockDefaultStorage = defaultStorage as jest.Mocked<typeof defaultStorage>;
const mockNotifyEventListeners = notifyEventListeners as jest.Mock;
const mockProcessInAppMessages = processInAppMessages as jest.Mock;

describe('setConflictHandler', () => {
	beforeAll(() => {
		initializeInAppMessaging();
	});
	beforeEach(() => {
		mockDefaultStorage.setItem.mockClear();
		mockNotifyEventListeners.mockClear();
	});
	it('can register a custom conflict handler', async () => {
		const customConflictHandler = (messages: InAppMessage[]) =>
			messages.find(message => message.id === 'custom-handled') ?? messages[2];
		mockProcessInAppMessages.mockReturnValueOnce(inAppMessages);

		setConflictHandler(customConflictHandler);
		await dispatchEvent(simpleInAppMessagingEvent);

		expect(mockNotifyEventListeners).toBeCalledWith(
			'messageReceived',
			customHandledMessage
		);
	});
});
