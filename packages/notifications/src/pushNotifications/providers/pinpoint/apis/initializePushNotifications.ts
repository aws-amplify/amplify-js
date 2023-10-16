// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PlatformNotSupportedError } from '@aws-amplify/core/internals/utils';
import { InitializePushNotifications } from '../types';

/**
 * Initialize and set up the push notification category. The category must be first initialized before all other
 * functionalities become available.
 *
 * @throws platform: {@link PlatformNotSupportedError} - Thrown if called against an unsupported platform. Currently,
 * only React Native is supported by this API.
 * @remarks
 * It is recommended that this be called as early in your app as possible at the root of your application to allow
 * background processing of notifications.
 * @example
 * ```ts
 * Amplify.configure(config);
 * initializePushNotifications();
 * ```
 */
export const initializePushNotifications: InitializePushNotifications = () => {
	throw new PlatformNotSupportedError();
};
