/*
 * Copyright 2017-2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import {
	InAppMessage,
	InAppMessageInteractionEvent,
	OnMessageInteractionEventHandler,
	OnMessageInteractionEventListener,
} from './types';

const onMessageActionListeners: Record<
	InAppMessageInteractionEvent,
	Set<OnMessageInteractionEventListener>
> = {
	[InAppMessageInteractionEvent.MESSAGE_RECEIVED]: new Set(),
	[InAppMessageInteractionEvent.MESSAGE_DISPLAYED]: new Set(),
	[InAppMessageInteractionEvent.MESSAGE_DISMISSED]: new Set(),
	[InAppMessageInteractionEvent.MESSAGE_ACTION_TAKEN]: new Set(),
};

export const notifyMessageInteractionEventListeners = (
	message: InAppMessage,
	event: InAppMessageInteractionEvent
): void => {
	onMessageActionListeners[event].forEach(listener => {
		listener.handleEvent(message);
	});
};

export const addMessageInteractionEventListener = (
	handler: OnMessageInteractionEventHandler,
	event: InAppMessageInteractionEvent
): OnMessageInteractionEventListener => {
	const listener = {
		handleEvent: handler,
		remove: () => {
			onMessageActionListeners[event].delete(listener);
		},
	};
	onMessageActionListeners[event].add(listener);
	return listener;
};
