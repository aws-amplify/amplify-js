// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PlatformNotSupportedError } from '@aws-amplify/core/internals/utils';
import { PushNotificationMessage } from '../../../types';
import {
	OnNotificationOpened,
	OnNotificationOpenedInput,
	OnNotificationOpenedOutput,
} from '../types';

/**
 * Registers a listener that will be triggered when a notification is opened by user.
 *
 * @param {OnNotificationOpenedInput} input - A callback handler to be invoked with the opened
 * {@link PushNotificationMessage}.
 * @returns {OnNotificationOpenedOutput} - An object with a remove function to remove the listener.
 * @example
 * ```ts
 * // Register a listener
 * onNotificationOpened(message => {
 *   doSomething(message);
 * });
 * ```
 * @example
 * ```ts
 * // Register multiple listeners
 * onNotificationOpened(message => {
 *   doSomething(message);
 * });
 *
 * onNotificationOpened(message => {
 *   doSomethingElse(message);
 * });
 * ```
 */
export const onNotificationOpened: OnNotificationOpened = () => {
	throw new PlatformNotSupportedError();
};
