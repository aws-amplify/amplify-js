// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { notifyEventListeners } from '../../../../common';
import { NotifyMessageInteractionInput } from '../types/inputs';

/**
 * Notifies the respective listener of the specified type with the message given.
 *
 * @param {NotifyMessageInteractionInput} input - The input object that holds the type and message.
 * @example
 * ```ts
 * onMessageRecieved((message) => {
 *   // Show end users the In-App message and notify event listeners
 *   notifyMessageInteraction({ type: 'messageDisplayed', message });
 * });
 * ```
 */
export function notifyMessageInteraction({
	type,
	message,
}: NotifyMessageInteractionInput): void {
	notifyEventListeners(type, message);
}
