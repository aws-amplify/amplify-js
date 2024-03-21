// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PlatformNotSupportedError } from '@aws-amplify/core/internals/utils';

import { RequestPermissions } from '../types';

/**
 * Requests notification permissions from your user. By default, Amplify requests all supported permissions but you can
 * choose not to request specific permissions. The resulting promise will resolve to true if requested permissions are
 * granted (or have previously been granted) or false otherwise. Not all specific permissions are supported by platforms
 * your React Native app can run on but will be safely ignored even on those platforms. Currently supported permissions:
 *
 *   * `alert`: When set to true, requests the ability to display notifications to the user.
 *
 *   * `sound`: When set to true, requests the ability to play a sound in response to notifications.
 *
 *   * `badge`: When set to true, requests the ability to update the app's badge.
 *
 * @throws platform: {@link PlatformNotSupportedError} - Thrown if called against an unsupported platform. Currently,
 * only React Native is supported by this API.
 * @returns A promise that resolves to true if requested permissions are granted or have already previously been
 * granted or false otherwise.
 * @example
 * ```ts
 * // Request all permissions by default
 * const arePermissionsGranted = await requestPermissions();
 *
 * @example
 * ```ts
 * // Prevent requesting specific permissions
 * const arePermissionsGranted = await requestPermissions({
 *   sound: false,
 *   badge: false
 * });
 * ```
 */
export const requestPermissions: RequestPermissions = async () => {
	throw new PlatformNotSupportedError();
};
