// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { assertTokenProviderConfig } from '@aws-amplify/core/internals/utils';
import { fetchAuthSession } from '../../../';
import { FetchDevicesOutput } from '../types';
import { listDevices } from '../utils/clients/CognitoIdentityProvider';
import { DeviceType } from '../utils/clients/CognitoIdentityProvider/types';
import { assertAuthTokens } from '../utils/types';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';
import { ListDevicesException } from '../types/errors';

// Cognito Documentation for max device
// tslint:disable-next-line:max-line-length
// https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_ListDevices.html#API_ListDevices_RequestSyntax
const MAX_DEVICES = 60;

/**
 * Fetches devices that have been registered using {@link registerDevice} for an authenticated user.
 *
 * @returns FetchDevicesOutput
 * @throws {@link ListDevicesException}
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function fetchDevices(): Promise<FetchDevicesOutput> {
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);

	const { tokens } = await fetchAuthSession();
	assertAuthTokens(tokens);

	const response = await listDevices(
		{ region: getRegion(authConfig.userPoolId) },
		{
			AccessToken: tokens.accessToken.toString(),
			Limit: MAX_DEVICES,
		}
	);
	return _fetchDevices(response.Devices ?? []);
}

const _fetchDevices = async (
	devices: DeviceType[]
): Promise<FetchDevicesOutput> => {
	return devices.map(
		({
			DeviceKey: id = '',
			DeviceAttributes = [],
			DeviceCreateDate,
			DeviceLastModifiedDate,
			DeviceLastAuthenticatedDate,
		}) => {
			let name: string | undefined;
			const attributes = DeviceAttributes.reduce(
				(attrs: any, { Name, Value }) => {
					if (!!Name && !!Value) {
						if (Name === 'device_name') name = Value;
						attrs[Name] = Value;
					}
					return attrs;
				},
				{}
			);
			return {
				id,
				name,
				attributes,
				createDate: DeviceCreateDate
					? new Date(DeviceCreateDate * 1000)
					: undefined,
				lastModifiedDate: DeviceLastModifiedDate
					? new Date(DeviceLastModifiedDate * 1000)
					: undefined,
				lastAuthenticatedDate: DeviceLastAuthenticatedDate
					? new Date(DeviceLastAuthenticatedDate * 1000)
					: undefined,
			};
		}
	);
};
