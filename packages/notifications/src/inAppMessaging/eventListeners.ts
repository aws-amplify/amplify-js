import {
	InAppMessage,
	InAppMessageInteractionEvent,
	OnMessageInteractionEventHandler,
	OnMessageInteractionEventListener,
	OnMessagesReceivedHandler,
	OnMessagesReceivedListener,
} from './types';

const onMessageActionListeners: Record<
	InAppMessageInteractionEvent,
	Set<OnMessageInteractionEventListener | OnMessagesReceivedListener>
> = {
	[InAppMessageInteractionEvent.MESSAGES_RECEIVED]: new Set(),
	[InAppMessageInteractionEvent.MESSAGE_DISPLAYED]: new Set(),
	[InAppMessageInteractionEvent.MESSAGE_DISMISSED]: new Set(),
	[InAppMessageInteractionEvent.MESSAGE_ACTION_TAKEN]: new Set(),
};

export const notifyMessageInteractionEventListeners = (
	message: InAppMessage | InAppMessage[],
	event: InAppMessageInteractionEvent
): void => {
	onMessageActionListeners[event].forEach(listener => {
		listener.handleEvent(message as any);
	});
};

export const addMessageInteractionEventListener = <
	Handler extends OnMessageInteractionEventHandler | OnMessagesReceivedHandler
>(
	handler: Handler,
	event: InAppMessageInteractionEvent
): Handler extends OnMessageInteractionEventHandler
	? OnMessageInteractionEventListener
	: OnMessagesReceivedListener => {
	const listener = {
		handleEvent: handler,
		remove: () => {
			onMessageActionListeners[event].delete(listener as any);
		},
	};
	onMessageActionListeners[event].add(listener as any);
	return listener as any;
};
