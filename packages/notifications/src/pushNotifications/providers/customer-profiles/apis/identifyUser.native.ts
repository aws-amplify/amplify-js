// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { assertIsInitialized } from '../../../errors/errorHelpers';
import { getToken } from '../../../utils';
import {
	getChannelType,
	getDeviceId,
	getInflightDeviceRegistration,
	identifyUserInternal,
} from '../utils';
import { IdentifyUser } from '../types';

export const identifyUser: IdentifyUser = async ({
	userId,
	userProfile,
	options,
}) => {
	assertIsInitialized();
	const { address } = options ?? {};
	const inflightDeviceRegistration = getInflightDeviceRegistration();
	if (inflightDeviceRegistration) {
		// wait for successful device registration before associating the user with their device
		await inflightDeviceRegistration;
	}
	// Resolve the stable per-install deviceId in the native layer (find-or-create
	// key) and inject it into `options` so the engine never imports getDeviceId.
	const deviceId = options?.deviceId ?? (await getDeviceId());
	await identifyUserInternal({
		deviceToken: address ?? getToken(),
		channelType: getChannelType(),
		userId,
		userProfile,
		options: { ...options, deviceId },
	});
};
