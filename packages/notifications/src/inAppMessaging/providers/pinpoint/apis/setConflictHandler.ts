// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { InAppMessage } from '../../../types';
import { InAppMessageConflictHandler, SetConflictHandlerInput } from '../types';

/**
 * Set a conflict handler that will be used to resolve conflicts that emerge when matching the event to the synced messages.
 * This setting is not persisted across restarts and hence needs to be called before dipatching an event.
 *
 * @param SetConflictHandlerInput: The input object that holds the conflict handler to be used.
 *
 * @returns Does not return anything.
 *
 * @example
 * ```ts
 * // Sync message before disptaching an event
 * await syncMessages();
 *
 * // Example custom conflict handler
 * const myConflictHandler = (messages) => {
 * 		// Return a random message
 * 		const randomIndex = Math.floor(Math.random() * messages.length);
 * 		return messages[randomIndex];
 *  };
 *
 * // Set the conflict handler
 * setConflictHandler(myConflictHandler);
 *
 * // Dispatch an event
 * await dispatchEvent({ name: "test_event" });
 * ```
 */
export function setConflictHandler(input: SetConflictHandlerInput): void {
	conflictHandler = input.handler;
}

export let conflictHandler: InAppMessageConflictHandler =
	defaultConflictHandler;

function defaultConflictHandler(messages: InAppMessage[]): InAppMessage {
	// default behavior is to return the message closest to expiry
	// this function assumes that messages processed by providers already filters out expired messages
	const sorted = messages.sort((a, b) => {
		const endDateA = a.metadata?.endDate;
		const endDateB = b.metadata?.endDate;
		// if both message end dates are falsy or have the same date string, treat them as equal
		if (endDateA === endDateB) {
			return 0;
		}
		// if only message A has an end date, treat it as closer to expiry
		if (endDateA && !endDateB) {
			return -1;
		}
		// if only message B has an end date, treat it as closer to expiry
		if (!endDateA && endDateB) {
			return 1;
		}
		// otherwise, compare them
		return new Date(endDateA) < new Date(endDateB) ? -1 : 1;
	});
	// always return the top sorted
	return sorted[0];
}
