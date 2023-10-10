// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { addEventListener } from '../../../../common';
import { OnMessageDismissedOutput } from '../types/outputs';
import { OnMessageDismissedInput } from '../types/inputs';

/**
 * Registers a callback handler that is fired upon a message dismissed event
 *
 * @param {OnMessageDismissedInput} input - The input object that holds the callback handler.
 *
 *
 * @returns {OnMessageDismissedOutput} - An object that holds a remove method to stop listening to events.
 *
 * @example
 * ```ts
 * onMessageDismissed((message) => {
 *   // use the message
 * });
 * ```
 */
export function onMessageDismissed(
	input: OnMessageDismissedInput
): OnMessageDismissedOutput {
	return addEventListener('messageDismissed', input);
}
