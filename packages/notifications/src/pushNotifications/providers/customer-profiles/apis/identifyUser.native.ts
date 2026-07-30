// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { identifyUserInternal } from '../utils/identifyUserInternal';
import { IdentifyUser } from '../types';

/**
 * Sends profile information about a user to Amazon Connect Customer Profiles.
 *
 * On React Native this is profile-only and no longer registers a device — the
 * backend derives `principalId` server-side from the SigV4 signer identity, so
 * no `userId` is sent. Use `registerDevice` / `removeDevice` for push device
 * lifecycle.
 *
 * Intentionally does NOT call `assertIsInitialized`: identify is a pure SigV4
 * HTTP call whose only prerequisites (endpoint/region + Identity Pool
 * credentials) are validated by `signedFetch` → `resolveConfig` /
 * `resolveCredentials`, so it is safe to call before `initializePushNotifications`.
 * (This native override exists only to drop the web build's device-registration
 * step; the request shape is otherwise identical to the web `identifyUser`.)
 *
 * @param {IdentifyUserInput} input The input object used to construct the request
 *  sent to the Amazon Connect Customer Profiles endpoint.
 * @throws service - Thrown when the Customer Profiles endpoint responds with a
 *  non-2xx status or the request fails to complete.
 * @throws validation - Thrown when the provided parameters or library
 *  configuration is incorrect.
 * @returns A promise that will resolve when the operation is complete.
 */
export const identifyUser: IdentifyUser = async ({ userProfile }) => {
	await identifyUserInternal({ userProfile });
};
