// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { addEventListener } from '../../../../common';
import { assertInitializationError } from '../../../utils';
import { OnMessageReceivedInput } from '../types/inputs';
import { OnMessageReceivedOutput } from '../types/outputs';

/**
 * Registers a callback that will be invoked on `messageReceived` events.
 *
 * @param {OnMessageReceivedInput} input - The input object that holds the callback handler.
 * @throws validation: {@link InAppMessagingValidationErrorCode} - Thrown when the provided parameters, library
 *  configuration or category initialization is incorrect.
 * @returns {OnMessageReceivedOutput} - An object that holds a remove method to stop listening to events.
 * @example
 * ```ts
 * onMessageReceived((message) => {
 *   // use the message
 *   console.log(message.id);
 * });
 * ```
 */
export function onMessageReceived(
	input: OnMessageReceivedInput
): OnMessageReceivedOutput {
	assertInitializationError();
	return addEventListener('messageReceived', input);
}
