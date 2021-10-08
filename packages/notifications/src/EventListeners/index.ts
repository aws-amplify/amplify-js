import {
	InAppMessage,
	OnMessageEventHandler,
	OnMessageEventListener,
} from '../types';
import { MessageEvent } from './types';
export { MessageEvent };

const onMessageEventListeners: Record<
	MessageEvent,
	Set<OnMessageEventListener>
> = {
	[MessageEvent.MESSAGE_DISPLAYED]: new Set(),
	[MessageEvent.MESSAGE_DISMISSED]: new Set(),
	[MessageEvent.MESSAGE_ACTION_TAKEN]: new Set(),
};

export const notifyMessageEventListeners = (
	message: InAppMessage,
	messageEvent: MessageEvent
): void => {
	onMessageEventListeners[messageEvent].forEach(listener => {
		listener.handleEvent(message);
	});
};

export const addMessageEventListener = (
	handler: OnMessageEventHandler,
	messageEvent: MessageEvent
): OnMessageEventListener => {
	const listener: OnMessageEventListener = {
		handleEvent: handler,
		remove: () => {
			onMessageEventListeners[messageEvent].delete(listener);
		},
	};
	onMessageEventListeners[messageEvent].add(listener);
	return listener;
};
