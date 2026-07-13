// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { assertIsInitialized } from '../../../errors/errorHelpers';
import { getToken } from '../../../utils';
import {
	getChannelType,
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
	await identifyUserInternal({
		deviceToken: address ?? getToken(),
		channelType: getChannelType(),
		userId,
		userProfile,
		options,
	});
};
