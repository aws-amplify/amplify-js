// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { addEventListener } from '../../../../common';
import { OnMessageDisplayedOutput } from '../types/outputs';
import { OnMessageDisplayedInput } from '../types/inputs';

/**
 * Registers a callback that will be invoked on `messageDisplayed` events.
 *
 * @param {OnMessageDisplayedInput} input - The input object that holds the callback handler.
 * @returns {OnMessageDismissedOutput} - An object that holds a remove method to stop listening to events.
 * @example
 * ```ts
 * onMessageDisplayed((message) => {
 *   // use the message
 * 	 console.log(message.id);
 * });
 * ```
 */
export function onMessageDisplayed(
	input: OnMessageDisplayedInput
): OnMessageDisplayedOutput {
	return addEventListener('messageDisplayed', input);
}
