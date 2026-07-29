// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { assertIsInitialized } from '../../../errors/errorHelpers';
import { getDeviceId, removeDeviceInternal } from '../utils';
import { RemoveDevice } from '../types';

/**
 * De-registers the current push device from Amazon Connect Customer Profiles.
 * The stable per-install `deviceId` is resolved internally, and the backend
 * gates removal on the caller's server-derived `principalId` (so a device can
 * only be removed by the principal it is registered to). The persisted
 * `deviceId` is intentionally NOT cleared — it is stable per install.
 *
 * @remarks
 * Call this API while the user is still signed in — de-registration is signed
 * with the current credentials, and the backend only removes a device that the
 * calling principal owns. Once `signOut` has completed those credentials are
 * gone and the caller signs as a new guest identity, so a removal at that point
 * cannot de-register the signed-in user's device. To stop delivery to a device
 * on sign-out, await `removeDevice()` **before** calling `signOut()`.
 *
 * @throws service - Thrown when the Customer Profiles endpoint responds with a
 *  non-2xx status or the request fails to complete.
 * @throws validation - Thrown when the library configuration is incorrect.
 * @returns A promise that will resolve when the operation is complete.
 * @example
 * ```ts
 * // de-register the device before ending the session
 * await removeDevice();
 * await signOut();
 * ```
 */
export const removeDevice: RemoveDevice = async () => {
	assertIsInitialized();
	await removeDeviceInternal(await getDeviceId());
};
