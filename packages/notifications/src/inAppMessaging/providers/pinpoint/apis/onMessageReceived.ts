// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { addEventListener } from '../../../../common';
import { OnMessageReceivedInput } from '../types/inputs';
import { OnMessageReceivedOutput } from '../types/outputs';

/**
 * Registers a callback handler that is fired upon a message received event
 *
 * @param {OnMessageReceivedInput} input - The input object that holds the callback handler.
 *
 *
 * @returns {OnMessageReceivedOutput} - An object that holds a remove method to stop listening to events.
 *
 * @example
 * ```ts
 * onMessageReceived((message) => {
 *   // use the message
 * });
 * ```
 */
export function onMessageReceived(
	input: OnMessageReceivedInput
): OnMessageReceivedOutput {
	return addEventListener('messageReceived', input);
}
