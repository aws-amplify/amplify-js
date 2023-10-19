// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PlatformNotSupportedError } from '@aws-amplify/core/internals/utils';
import { PushNotificationMessage } from '../../../types';
import {
	OnNotificationReceivedInBackground,
	OnNotificationReceivedInBackgroundInput,
	OnNotificationReceivedInBackgroundOutput,
} from '../types';

/**
 * Registers a listener that will be triggered when a notification is received while app is in a background state.
 *
 * @throws platform: {@link PlatformNotSupportedError} - Thrown if called against an unsupported platform. Currently,
 * only React Native is supported by this API.
 * @param {OnNotificationReceivedInBackgroundInput} input - A callback handler to be invoked with the received
 * {@link PushNotificationMessage}.
 * @returns {OnNotificationReceivedInBackgroundOutput} - An object with a remove function to remove the listener.
 * @remarks Notifications received while app is in a quit state will start the app (as a headless JS instance running
 * on a background service on Android) in the background. Handlers registered via this function should return promises
 * if it needs to be asynchronous (e.g. to perform some network requests). The app should run in the background as long
 * as there are handlers still running (however, if they run for more than 30 seconds on iOS, subsequent tasks could
 * get deprioritized!). If it is necessary for a handler to execute while the app is in quit state, it should be
 * registered in the application entry point (e.g. index.js) since the application will not fully mount in that case.
 * @example
 * ```ts
 * // Register a listener
 * onNotificationReceivedInBackground(message => {
 *   doSomething(message);
 * });
 * ```
 * @example
 * ```ts
 * // Register multiple listeners
 * onNotificationReceivedInBackground(message => {
 *   doSomething(message);
 * });
 *
 * onNotificationReceivedInBackground(message => {
 *   doSomethingElse(message);
 * });
 * ```
 * @example
 * ```ts
 * // Register async listener
 * onNotificationReceivedInBackground(async message => {
 *   await doSomething(message);
 *   console.log(`did something with ${message}`);
 * });
 * ```
 */
export const onNotificationReceivedInBackground: OnNotificationReceivedInBackground =
	() => {
		throw new PlatformNotSupportedError();
	};
