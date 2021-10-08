import {
	InAppMessage,
	OnMessageEventHandler,
	OnMessageEventListener,
	OnMessagesReceivedHandler,
	OnMessagesReceivedListener,
} from '../inAppMessaging/types';
import { MessageEvent } from './types';
export { MessageEvent };

const onMessageEventListeners: Record<
	MessageEvent,
	Set<OnMessageEventListener | OnMessagesReceivedListener>
> = {
	[MessageEvent.MESSAGES_RECEIVED]: new Set(),
	[MessageEvent.MESSAGE_DISPLAYED]: new Set(),
	[MessageEvent.MESSAGE_DISMISSED]: new Set(),
	[MessageEvent.MESSAGE_ACTION_TAKEN]: new Set(),
};

export const notifyMessageEventListeners = (
	message: InAppMessage | InAppMessage[],
	messageEvent: MessageEvent
): void => {
	onMessageEventListeners[messageEvent].forEach(listener => {
		listener.handleEvent(message as any);
	});
};

export const addMessageEventListener = <
	Handler extends OnMessageEventHandler | OnMessagesReceivedHandler
>(
	handler: Handler,
	messageEvent: MessageEvent
): Handler extends OnMessageEventHandler
	? OnMessageEventListener
	: OnMessagesReceivedListener => {
	const listener = {
		handleEvent: handler,
		remove: () => {
			onMessageEventListeners[messageEvent].delete(listener as any);
		},
	};
	onMessageEventListeners[messageEvent].add(listener as any);
	return listener as any;
};
