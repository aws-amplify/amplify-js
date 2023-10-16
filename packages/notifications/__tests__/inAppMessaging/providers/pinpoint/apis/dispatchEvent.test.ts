// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { defaultStorage } from '@aws-amplify/core';
import { dispatchEvent } from '../../../../../src/inAppMessaging/providers/pinpoint/apis';
import { processInAppMessages } from '../../../../../src/inAppMessaging/providers/pinpoint/utils';
import {
	inAppMessages,
	simpleInAppMessages,
	simpleInAppMessagingEvent,
} from '../../../../../__mocks__/data';
import { InAppMessagingError } from '../../../../../src/inAppMessaging/errors';
import { notifyEventListeners } from '../../../../../src/common/eventListeners';

jest.mock('@aws-amplify/core');
jest.mock('@aws-amplify/core/internals/utils');
jest.mock('../../../../../src/inAppMessaging/providers/pinpoint/utils');
jest.mock('../../../../../src/common/eventListeners');

const mockDefaultStorage = defaultStorage as jest.Mocked<typeof defaultStorage>;
const mockNotifyEventListeners = notifyEventListeners as jest.Mock;
const mockProcessInAppMessages = processInAppMessages as jest.Mock;

describe('dispatchEvent', () => {
	beforeEach(() => {
		mockDefaultStorage.setItem.mockClear();
		mockNotifyEventListeners.mockClear();
	});
	it('gets in-app messages from store and notifies listeners', async () => {
		const [message] = inAppMessages;
		mockDefaultStorage.getItem.mockResolvedValueOnce(
			JSON.stringify(simpleInAppMessages)
		);
		mockProcessInAppMessages.mockReturnValueOnce([message]);
		await dispatchEvent(simpleInAppMessagingEvent);
		expect(mockProcessInAppMessages).toBeCalledWith(
			simpleInAppMessages,
			simpleInAppMessagingEvent
		);
		expect(mockNotifyEventListeners).toBeCalledWith('messageReceived', message);
	});

	it('handles conflicts through default conflict handler', async () => {
		mockDefaultStorage.getItem.mockResolvedValueOnce(
			JSON.stringify(simpleInAppMessages)
		);
		mockProcessInAppMessages.mockReturnValueOnce(inAppMessages);
		await dispatchEvent(simpleInAppMessagingEvent);
		expect(mockProcessInAppMessages).toBeCalledWith(
			simpleInAppMessages,
			simpleInAppMessagingEvent
		);
		expect(mockNotifyEventListeners).toBeCalledWith(
			'messageReceived',
			inAppMessages[4]
		);
	});

	it('does not notify listeners if no messages are returned', async () => {
		mockProcessInAppMessages.mockReturnValueOnce([]);
		mockDefaultStorage.getItem.mockResolvedValueOnce(
			JSON.stringify(simpleInAppMessages)
		);

		await dispatchEvent(simpleInAppMessagingEvent);

		expect(mockNotifyEventListeners).not.toBeCalled();
	});

	it('logs error if storage retrieval fails', async () => {
		mockDefaultStorage.getItem.mockRejectedValueOnce(Error);
		await expect(
			dispatchEvent(simpleInAppMessagingEvent)
		).rejects.toStrictEqual(expect.any(InAppMessagingError));
	});
});
