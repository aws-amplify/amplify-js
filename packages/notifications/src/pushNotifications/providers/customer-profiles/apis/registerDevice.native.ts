// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getClientInfo } from '@aws-amplify/core/internals/utils';

import { PushNotificationError } from '../../../errors';
import {
	PushNotificationValidationErrorCode,
	assertIsInitialized,
} from '../../../errors/errorHelpers';
import { getToken } from '../../../utils';
import {
	DeviceRegistration,
	getChannelType,
	getDeviceId,
	registerDeviceInternal,
} from '../utils';
import { RegisterDevice } from '../types';

/**
 * Builds the device-registration wire object. The stable per-install `deviceId`
 * (find-or-create key) and OS-derived `channelType` / `platform` are resolved
 * internally. `appVersion` is included for mobile parity but is currently sent
 * empty (unsourced) — sourcing a real bundle version would require a native
 * bridge / third-party dependency and is deliberately deferred.
 *
 * @throws validation: {@link PushNotificationError} - `NoToken` when neither an
 *  explicit token nor a previously-received token is available.
 * @internal
 */
export const buildDeviceRegistration = async (
	token?: string,
): Promise<DeviceRegistration> => {
	const resolved = token ?? getToken();
	if (!resolved) {
		throw new PushNotificationError({
			name: PushNotificationValidationErrorCode.NoToken,
			message: 'No push notification token available.',
			recoverySuggestion:
				'Pass a token to `registerDevice`, or ensure a token has been received via `onTokenReceived` before registering the device.',
		});
	}

	return {
		token: resolved,
		deviceId: await getDeviceId(),
		platform: getClientInfo().platform ?? '',
		appVersion: '',
		channelType: getChannelType(),
	};
};

/**
 * Registers a push device with Amazon Connect Customer Profiles. The device is
 * keyed on the caller's server-derived `principalId` (from the SigV4 signer
 * identity). The SDK internally supplies the remaining device fields
 * (`deviceId`, `platform`, `appVersion`, `channelType`).
 *
 * @param {RegisterDeviceInput} input The input containing the push `token`.
 * @throws service - Thrown when the Customer Profiles endpoint responds with a
 *  non-2xx status or the request fails to complete.
 * @throws validation - Thrown when the library configuration is incorrect.
 * @returns A promise that will resolve when the operation is complete.
 */
export const registerDevice: RegisterDevice = async ({ token }) => {
	assertIsInitialized();
	await registerDeviceInternal(await buildDeviceRegistration(token));
};
