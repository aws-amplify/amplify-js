// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PushNotificationAction } from '@aws-amplify/core/internals/utils';

import { ChannelType, UserProfile } from '../types';

import {
	IDENTIFY_USER_PATH,
	REGISTER_DEVICE_PATH,
	REMOVE_DEVICE_PATH,
} from './resolveConfig';
import { signedFetch } from './signedFetch';
import { validateUserProfile } from './validateUserProfile';

/**
 * The push-device object registered with Amazon Connect Customer Profiles.
 * Matches the backend `register-device` wire contract. The `deviceId` is the
 * stable per-install key the backend upserts on; `appVersion` is included for
 * mobile parity but is currently sent empty (unsourced) by the client.
 *
 * @internal
 */
export interface DeviceRegistration {
	token: string;
	deviceId: string;
	platform: string;
	appVersion: string;
	channelType: ChannelType;
}

/**
 * Sends a profile-only identify-user request. The backend derives `principalId`
 * from the SigV4 signer identity, so no `userId` is sent.
 *
 * @internal
 */
export const identifyUserInternal = async ({
	userProfile,
}: {
	userProfile?: UserProfile;
}): Promise<void> => {
	validateUserProfile(userProfile);
	await signedFetch(
		IDENTIFY_USER_PATH,
		{ userProfile: userProfile ?? {} },
		PushNotificationAction.IdentifyUser,
	);
};

/**
 * Registers (upserts) a push device object. The wire shape nests the device
 * fields under `device` to match the backend `register-device` contract.
 *
 * @internal
 */
export const registerDeviceInternal = async (
	device: DeviceRegistration,
): Promise<void> => {
	await signedFetch(
		REGISTER_DEVICE_PATH,
		{ device },
		PushNotificationAction.RegisterDevice,
	);
};

/**
 * De-registers a push device object. The backend gates removal on the caller's
 * server-derived `principalId`.
 *
 * @internal
 */
export const removeDeviceInternal = async (deviceId: string): Promise<void> => {
	await signedFetch(
		REMOVE_DEVICE_PATH,
		{ deviceId },
		PushNotificationAction.RemoveDevice,
	);
};
