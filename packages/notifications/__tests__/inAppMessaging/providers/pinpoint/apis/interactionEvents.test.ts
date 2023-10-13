// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { inAppMessages } from '../../../../../__mocks__/data';
import {
	notifyEventListeners,
	addEventListener,
} from '../../../../../src/common';
import {
	initializeInAppMessaging,
	notifyMessageInteraction,
	onMessageActionTaken,
	onMessageDismissed,
	onMessageDisplayed,
	onMessageReceived,
} from '../../../../../src/inAppMessaging/providers/pinpoint/apis';

jest.mock('../../../../../src/common/eventListeners');

const mockNotifyEventListeners = notifyEventListeners as jest.Mock;
const mockAddEventListener = addEventListener as jest.Mock;

describe('Interaction events', () => {
	const handler = jest.fn();
	beforeAll(() => {
		initializeInAppMessaging();
	});
	it('can be listened to by onMessageReceived', () => {
		onMessageReceived(handler);

		expect(mockAddEventListener).toBeCalledWith('messageReceived', handler);
	});

	it('can be listened to by onMessageDisplayed', () => {
		onMessageDisplayed(handler);

		expect(mockAddEventListener).toBeCalledWith('messageDisplayed', handler);
	});

	it('can be listened to by onMessageDismissed', () => {
		onMessageDismissed(handler);

		expect(mockAddEventListener).toBeCalledWith('messageDismissed', handler);
	});

	it('can be listened to by onMessageActionTaken', () => {
		onMessageActionTaken(handler);

		expect(mockAddEventListener).toBeCalledWith('messageActionTaken', handler);
	});
	it('can be notified by notifyMessageInteraction', () => {
		const [message] = inAppMessages;

		notifyMessageInteraction({
			type: 'messageReceived',
			message,
		});

		expect(mockNotifyEventListeners).toBeCalledWith('messageReceived', message);
	});
});
