// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { notifyEventListeners } from '~/src/eventListeners';
import { assertIsInitialized } from '~/src/inAppMessaging/utils';
import { NotifyMessageInteractionInput } from '~/src/inAppMessaging/providers/pinpoint/types/inputs';
import { InAppMessagingValidationErrorCode } from '~/src/inAppMessaging/errors';

/**
 * Notifies the respective listener of the specified type with the message given.
 *
 * @param {NotifyMessageInteractionInput} input - The input object that holds the type and message.
 * @throws validation: {@link InAppMessagingValidationErrorCode} - Thrown when the provided parameters or library
 * configuration is incorrect, or if In App messaging hasn't been initialized.
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
	assertIsInitialized();
	notifyEventListeners(type, message);
}
