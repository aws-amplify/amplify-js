// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { InAppMessage } from '../../../types';
import { assertIsInitialized } from '../../../utils';
import { InAppMessageConflictHandler, SetConflictHandlerInput } from '../types';

export let conflictHandler: InAppMessageConflictHandler =
	defaultConflictHandler;

/**
 * Set a conflict handler that will be used to resolve conflicts that may emerge
 * when matching events with synced messages.
 *
 * @remark
 * The conflict handler is not persisted across app restarts and so must be set again before dispatching an event for
 * any custom handling to take effect.
 * @throws validation: {@link InAppMessagingValidationErrorCode} - Thrown when the provided parameters or library
 * configuration is incorrect, or if In App messaging hasn't been initialized.
 * @param SetConflictHandlerInput: The input object that holds the conflict handler to be used.
 * @example
 * ```ts
 * // Sync messages before dispatching an event
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
 * await dispatchEvent({ name: 'test_event' });
 * ```
 */
export function setConflictHandler(input: SetConflictHandlerInput): void {
	assertIsInitialized();
	conflictHandler = input;
}

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
