/*
 * Copyright 2017-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
import { InAppMessageInteractionEvent } from '../../src/InAppMessaging';
import { inAppMessages } from '../../__mocks__/data';

describe('Interaction event listeners', () => {
	const messageReceivedHandler = jest.fn();
	const messageDisplayedHandler = jest.fn();
	const messageDismissedHandler = jest.fn();
	const messageActionTakenHandler = jest.fn();
	const [message] = inAppMessages;
	let addMessageInteractionEventListener,
		notifyMessageInteractionEventListeners;
	beforeEach(() => {
		jest.resetModules();
		jest.clearAllMocks();
		({
			addMessageInteractionEventListener,
			notifyMessageInteractionEventListeners,
		} = require('../../src/InAppMessaging/eventListeners'));
	});

	test('can be added', () => {
		const listener = addMessageInteractionEventListener(
			messageReceivedHandler,
			InAppMessageInteractionEvent.MESSAGE_RECEIVED
		);

		expect(listener).toBeDefined();
	});

	test('can be notified', () => {
		addMessageInteractionEventListener(
			messageReceivedHandler,
			InAppMessageInteractionEvent.MESSAGE_RECEIVED
		);
		notifyMessageInteractionEventListeners(
			message,
			InAppMessageInteractionEvent.MESSAGE_RECEIVED
		);

		expect(messageReceivedHandler).toBeCalled();
	});

	test('can be removed', () => {
		const listener = addMessageInteractionEventListener(
			messageReceivedHandler,
			InAppMessageInteractionEvent.MESSAGE_RECEIVED
		);

		listener.remove();
		notifyMessageInteractionEventListeners(
			message,
			InAppMessageInteractionEvent.MESSAGE_RECEIVED
		);

		expect(messageReceivedHandler).not.toBeCalled();
	});

	test('can be added in multiples', () => {
		addMessageInteractionEventListener(
			messageDisplayedHandler,
			InAppMessageInteractionEvent.MESSAGE_DISPLAYED
		);
		addMessageInteractionEventListener(
			messageDisplayedHandler,
			InAppMessageInteractionEvent.MESSAGE_DISPLAYED
		);
		addMessageInteractionEventListener(
			messageDismissedHandler,
			InAppMessageInteractionEvent.MESSAGE_DISMISSED
		);
		addMessageInteractionEventListener(
			messageActionTakenHandler,
			InAppMessageInteractionEvent.MESSAGE_ACTION_TAKEN
		);
		notifyMessageInteractionEventListeners(
			message,
			InAppMessageInteractionEvent.MESSAGE_RECEIVED
		);
		notifyMessageInteractionEventListeners(
			message,
			InAppMessageInteractionEvent.MESSAGE_DISPLAYED
		);
		notifyMessageInteractionEventListeners(
			message,
			InAppMessageInteractionEvent.MESSAGE_ACTION_TAKEN
		);

		// no listener added
		expect(messageReceivedHandler).toBeCalledTimes(0);
		// two listeners added
		expect(messageDisplayedHandler).toBeCalledTimes(2);
		// listener added but not notified
		expect(messageDismissedHandler).toBeCalledTimes(0);
		// one listener added
		expect(messageActionTakenHandler).toBeCalledTimes(1);
	});
});
