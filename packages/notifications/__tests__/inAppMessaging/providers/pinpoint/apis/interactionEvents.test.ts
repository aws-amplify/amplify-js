// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { inAppMessages } from '../../../../testUtils/data';
import {
	notifyEventListeners,
	addEventListener,
} from '../../../../../src/eventListeners';
import {
	initializeInAppMessaging,
	notifyMessageInteraction,
	onMessageActionTaken,
	onMessageDismissed,
	onMessageDisplayed,
	onMessageReceived,
} from '../../../../../src/inAppMessaging/providers/pinpoint/apis';

jest.mock('../../../../../src/eventListeners');

const mockNotifyEventListeners = notifyEventListeners as jest.Mock;
const mockAddEventListener = addEventListener as jest.Mock;

describe('Interaction events', () => {
	const handler = jest.fn();
	beforeAll(() => {
		initializeInAppMessaging();
	});
	it('can be listened to by onMessageReceived', () => {
		onMessageReceived(handler);

		expect(mockAddEventListener).toHaveBeenCalledWith(
			'messageReceived',
			handler
		);
	});

	it('can be listened to by onMessageDisplayed', () => {
		onMessageDisplayed(handler);

		expect(mockAddEventListener).toHaveBeenCalledWith(
			'messageDisplayed',
			handler
		);
	});

	it('can be listened to by onMessageDismissed', () => {
		onMessageDismissed(handler);

		expect(mockAddEventListener).toHaveBeenCalledWith(
			'messageDismissed',
			handler
		);
	});

	it('can be listened to by onMessageActionTaken', () => {
		onMessageActionTaken(handler);

		expect(mockAddEventListener).toHaveBeenCalledWith(
			'messageActionTaken',
			handler
		);
	});
	it('can be notified by notifyMessageInteraction', () => {
		const [message] = inAppMessages;

		notifyMessageInteraction({
			type: 'messageReceived',
			message,
		});

		expect(mockNotifyEventListeners).toHaveBeenCalledWith(
			'messageReceived',
			message
		);
	});
});
