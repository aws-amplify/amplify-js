// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6, fetchAuthSession } from '@aws-amplify/core';
import { listDevices } from '../utils/clients/CognitoIdentityProvider';
import { AuthError } from '../../../errors/AuthError';
import {
	DeviceType,
	ListDevicesCommandInput,
} from '../utils/clients/CognitoIdentityProvider/types';
import { AWSAuthDevice } from '../../../types/models';
import { assertAuthTokens } from '../utils/types';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';

// Cognito Documentation for max device
// tslint:disable-next-line:max-line-length
// https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_ListDevices.html#API_ListDevices_RequestSyntax
const MAX_DEVICES = 60;

/**
 * Fetch devices associated with an authenticated user
 *
 * @returns {AWSAuthDevice[]}
 * @throws validation: {@link InvalidAuthTokens}
 * @throws validation: {@link ListDevicesException}
 *
 * @throws {@link PasswordResetRequiredException}
 *
 * @throws {@link NotAuthorizedException}
 */
export async function fetchDevices(): Promise<AWSAuthDevice[]> {
	const session = await fetchAuthSession({});
	assertAuthTokens(session.tokens);

	const requestParams: ListDevicesCommandInput = {
		AccessToken: session.tokens.accessToken.toString(),
		Limit: MAX_DEVICES,
	};

	const authConfig = AmplifyV6.getConfig().Auth;
	const region = getRegion(authConfig?.userPoolId);

	const res = await listDevices({ region }, requestParams);
	const devices: DeviceType[] = res.Devices ?? [];

	return devices.map(device => {
		if (device.DeviceKey && device.DeviceAttributes) {
			let deviceName: string | undefined;
			const deviceInfo: AWSAuthDevice = {
				deviceId: device.DeviceKey,
				deviceName: '',
				attributes: device.DeviceAttributes.reduce((attrs, { Name, Value }) => {
					if (!!Name && !!Value) {
						if (Name === 'device_name') deviceName = Value;
						attrs[Name] = Value;
					}
					return attrs;
				}, {}),
			};
			if (!!deviceName) {
				deviceInfo.deviceName = deviceName;
			}
			if (device.DeviceCreateDate)
				deviceInfo.createDate = device.DeviceCreateDate;
			if (device.DeviceLastAuthenticatedDate)
				deviceInfo.lastAuthenticatedDate = device.DeviceLastAuthenticatedDate;
			if (device.DeviceLastModifiedDate)
				deviceInfo.lastModifiedDate = device.DeviceLastModifiedDate;
			return deviceInfo;
		} else {
			throw new AuthError({
				name: 'ListDevicesException',
				message: `DeviceKey or DeviceAttributes was undefined`,
			});
		}
	});
}
