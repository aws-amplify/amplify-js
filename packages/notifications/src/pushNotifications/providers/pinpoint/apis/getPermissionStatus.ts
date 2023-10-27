// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PlatformNotSupportedError } from '@aws-amplify/core/internals/utils';
import { GetPermissionStatus, GetPermissionStatusOutput } from '../types';

/**
 * Returns a string representing the current status of user permissions to display push notifications. The possible
 * statuses are as follows:
 *
 *   * `'shouldRequest'` - No permissions have been requested yet. It is idiomatic at this time to simply request for
 *   permissions from the user.
 *
 *   * `'shouldExplainThenRequest'` - It is recommended at this time to provide some context or rationale to the user
 *   explaining why you want to send them push notifications before requesting for permissions.
 *
 *   * `'granted'` - Permissions have been granted by the user. No further actions are needed and their app is ready to
 *   display notifications.
 *
 *   * `'denied'` - Permissions have been denied by the user. Further attempts to request permissions will no longer
 *   trigger a permission dialog. Your app should now either degrade gracefully or prompt your user to grant the
 *   permissions needed in their device settings.
 *
 * @throws platform: {@link PlatformNotSupportedError} - Thrown if called against an unsupported platform. Currently,
 * only React Native is supported by this API.
 * @return {Promise<GetPermissionStatusOutput>} a promise resolving to a string representing the current status of user
 * selected notification permissions.
 * @example
 * ```ts
 * const permissionStatus = await getPermissionStatus();
 */
export const getPermissionStatus: GetPermissionStatus = async () => {
	throw new PlatformNotSupportedError();
};
