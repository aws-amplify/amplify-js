// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { EventListener, EventListenerRemover, EventType } from './types';

const eventListeners: Record<string, Set<EventListener<Function>>> = {};

export const notifyEventListeners = (type: EventType, ...args: any[]): void => {
	eventListeners[type]?.forEach(listener => {
		listener.handleEvent(...args);
	});
};

export const notifyEventListenersAndAwaitHandlers = (
	type: EventType,
	...args: any[]
): Promise<void[]> =>
	Promise.all<void>(
		Array.from(eventListeners[type] ?? []).map(async listener => {
			try {
				await listener.handleEvent(...args);
			} catch (err) {
				throw err;
			}
		})
	);

export const addEventListener = <EventHandler extends Function>(
	type: EventType,
	handler: EventHandler
): EventListenerRemover => {
	// If there is no listener set for the event type, just create it
	if (!eventListeners[type]) {
		eventListeners[type] = new Set<EventListener<EventHandler>>();
	}
	const listener = {
		handleEvent: handler,
		remove: () => {
			eventListeners[type].delete(listener);
		},
	};
	eventListeners[type].add(listener);
	return {
		remove: () => listener.remove(),
	};
};
