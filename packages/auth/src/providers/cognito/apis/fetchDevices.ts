// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6, fetchAuthSession } from '@aws-amplify/core';
import { listDevices } from '../utils/clients/CognitoIdentityProvider';
import { AuthError } from '../../../errors/AuthError';
import {
	DeviceType,
	ListDevicesCommandInput,
} from '../utils/clients/CognitoIdentityProvider/types';
import { AuthDevice } from '../../../types';

// Cognito Documentation for max device
// tslint:disable-next-line:max-line-length
// https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_ListDevices.html#API_ListDevices_RequestSyntax
const MAX_DEVICES = 60;

/**
 * Fetch devices associated with an authenticated user
 *
 * @returns AuthDevice[]
 * @throws validation: {@link AuthError}
 *
 */
export async function fetchDevices(): Promise<AuthDevice[]> {
	const session = await fetchAuthSession({});
	if (!session.tokens) {
		throw new AuthError({
			name: 'UserNotLoggedIn',
			message: 'Devices can only be fetched for authenticated users',
			recoverySuggestion:
				'Make sure to log the user in before listing the devices associated with that user',
		});
	}
	const requestParams: ListDevicesCommandInput = {
		AccessToken: session.tokens.accessToken.toString(),
		Limit: MAX_DEVICES,
	};

	const authConfig = AmplifyV6.getConfig().Auth;
	const userPoolId = authConfig?.userPoolId;
	if (!userPoolId) {
		throw new AuthError({
			name: 'AuthConfigException',
			message: 'Cannot list devices without an userPoolId',
			recoverySuggestion:
				'Make sure a valid userPoolId is given in the config.',
		});
	}

	const region = userPoolId.split('_')[0];
	const res = await listDevices({ region }, requestParams);
	const devices: DeviceType[] = res.Devices ?? [];

	return devices.map(device => {
		const deviceInfo: AuthDevice = {
			deviceId: device.DeviceKey,
		};
		const deviceName = device.DeviceAttributes.find(
			({ Name }) => Name === 'device_name'
		);

		if (deviceName) deviceInfo.deviceName = deviceName.Value;
		return deviceInfo;
	});
}
