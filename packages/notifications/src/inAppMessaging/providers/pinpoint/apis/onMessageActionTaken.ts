// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { addEventListener } from '../../../../common';
import { OnMessageActionTakenInput } from '../types/inputs';
import { OnMessageActionTakenOutput } from '../types/outputs';

/**
 * Registers a callback handler that is fired upon a message action taken event
 *
 * @param {OnMessageActionTakenInput} input - The input object that holds the callback handler.
 *
 *
 * @returns {OnMessageActionTakenOutput} - An object that holds a remove method to stop listening to events.
 *
 * @example
 * ```ts
 * onMessageActionTaken((message) => {
 *   // use the message
 * });
 * ```
 */
export function onMessageActionTaken(
	input: OnMessageActionTakenInput
): OnMessageActionTakenOutput {
	return addEventListener('messageActionTaken', input);
}
