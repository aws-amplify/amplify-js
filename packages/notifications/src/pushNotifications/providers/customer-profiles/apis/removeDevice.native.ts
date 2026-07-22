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
 * @throws service - Thrown when the Customer Profiles endpoint responds with a
 *  non-2xx status or the request fails to complete.
 * @throws validation - Thrown when the library configuration is incorrect.
 * @returns A promise that will resolve when the operation is complete.
 */
export const removeDevice: RemoveDevice = async () => {
	assertIsInitialized();
	await removeDeviceInternal(await getDeviceId());
};
