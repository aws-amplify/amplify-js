// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { addEventListener } from '../../../../eventListeners';
import { OnMessageDismissedOutput } from '../types/outputs';
import { OnMessageDismissedInput } from '../types/inputs';
import { assertIsInitialized } from '../../../utils';

/**
 * Registers a callback that will be invoked on `messageDismissed` events.
 *
 * @param {OnMessageDismissedInput} input - The input object that holds the callback handler.
 * @throws validation: {@link InAppMessagingValidationErrorCode} - Thrown when the provided parameters or library
 * configuration is incorrect, or if In App messaging hasn't been initialized.
 * @returns {OnMessageDismissedOutput} - An object that holds a remove method to stop listening to events.
 * @example
 * ```ts
 * onMessageDismissed((message) => {
 *   // use the message
 *   console.log(message.id);
 * });
 * ```
 */
export function onMessageDismissed(
	input: OnMessageDismissedInput
): OnMessageDismissedOutput {
	assertIsInitialized();
	return addEventListener('messageDismissed', input);
}
