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
