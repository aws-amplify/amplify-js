// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { notifyEventListeners } from '../../../../common';
import { NotifyMessageInteractionInput } from '../types/inputs';

/**
 * Notifies the respective listener of the specified type with the message given.
 *
 * @param {NotifyMessageInteractionInput} input - The input object that holds the type and message.
 *
 *
 * @returns {void}
 *
 * @example
 * ```ts
 * onMessageRecieved((message) => {
 *   // show end users the inApp message and then notify the event
 *   notifyMessageInteraction({ type: "messageDisplayed", message });
 * });
 * ```
 */
export function notifyMessageInteraction({
	type,
	message,
}: NotifyMessageInteractionInput): void {
	notifyEventListeners(type, message);
}
