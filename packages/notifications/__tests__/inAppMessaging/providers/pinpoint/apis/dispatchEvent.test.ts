// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createMockAmplifyContext } from '@aws-amplify/core/internals/testing';
import {
	clearGlobalContext,
	setGlobalContext,
} from '@aws-amplify/core/internals/utils';
import { defaultStorage } from '@aws-amplify/core';

import {
	dispatchEvent,
	initializeInAppMessaging,
} from '../../../../../src/inAppMessaging/providers/pinpoint/apis';
import {
	getConflictHandler,
	processInAppMessages,
} from '../../../../../src/inAppMessaging/providers/pinpoint/utils';
import {
	closestExpiryMessage,
	inAppMessages,
	simpleInAppMessages,
	simpleInAppMessagingEvent,
} from '../../../../testUtils/data';
import { InAppMessagingError } from '../../../../../src/inAppMessaging/errors';
import { notifyEventListeners } from '../../../../../src/eventListeners';

jest.mock('@aws-amplify/core');
jest.mock('../../../../../src/inAppMessaging/providers/pinpoint/utils');
jest.mock('../../../../../src/eventListeners');

const mockDefaultStorage = defaultStorage as jest.Mocked<typeof defaultStorage>;
const mockGetConflictHandler = getConflictHandler as jest.Mock;
const mockNotifyEventListeners = notifyEventListeners as jest.Mock;
const mockProcessInAppMessages = processInAppMessages as jest.Mock;

describe('dispatchEvent', () => {
	beforeAll(() => {
		setGlobalContext(createMockAmplifyContext());
		initializeInAppMessaging();
	});
	beforeEach(() => {
		mockGetConflictHandler.mockReturnValue(() => inAppMessages[0]);
	});
	afterAll(() => {
		clearGlobalContext();
	});

	afterEach(() => {
		mockGetConflictHandler.mockReset();
		mockDefaultStorage.setItem.mockClear();
		mockNotifyEventListeners.mockClear();
	});
	it('gets in-app messages from store and notifies listeners', async () => {
		const [message] = inAppMessages;
		mockDefaultStorage.getItem.mockResolvedValueOnce(
			JSON.stringify(simpleInAppMessages),
		);
		mockProcessInAppMessages.mockReturnValueOnce([message]);
		await dispatchEvent(simpleInAppMessagingEvent);
		expect(mockProcessInAppMessages).toHaveBeenCalledWith(
			simpleInAppMessages,
			simpleInAppMessagingEvent,
		);
		expect(mockNotifyEventListeners).toHaveBeenCalledWith(
			'messageReceived',
			message,
		);
	});

	it('handles conflicts through default conflict handler', async () => {
		mockGetConflictHandler.mockReturnValue(() => closestExpiryMessage);
		mockDefaultStorage.getItem.mockResolvedValueOnce(
			JSON.stringify(simpleInAppMessages),
		);
		mockProcessInAppMessages.mockReturnValueOnce(inAppMessages);
		await dispatchEvent(simpleInAppMessagingEvent);
		expect(mockProcessInAppMessages).toHaveBeenCalledWith(
			simpleInAppMessages,
			simpleInAppMessagingEvent,
		);
		expect(mockNotifyEventListeners).toHaveBeenCalledWith(
			'messageReceived',
			inAppMessages[4],
		);
	});

	it('does not notify listeners if no messages are returned', async () => {
		mockProcessInAppMessages.mockReturnValueOnce([]);
		mockDefaultStorage.getItem.mockResolvedValueOnce(
			JSON.stringify(simpleInAppMessages),
		);

		await dispatchEvent(simpleInAppMessagingEvent);

		expect(mockNotifyEventListeners).not.toHaveBeenCalled();
	});

	it('logs error if storage retrieval fails', async () => {
		mockDefaultStorage.getItem.mockRejectedValueOnce(Error);
		await expect(
			dispatchEvent(simpleInAppMessagingEvent),
		).rejects.toStrictEqual(expect.any(InAppMessagingError));
	});
});
