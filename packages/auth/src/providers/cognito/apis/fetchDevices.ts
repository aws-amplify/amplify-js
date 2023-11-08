// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import {
	assertTokenProviderConfig,
	AuthAction,
} from '@aws-amplify/core/internals/utils';
import { FetchDevicesOutput } from '../types';
import { listDevices } from '../utils/clients/CognitoIdentityProvider';
import { DeviceType } from '../utils/clients/CognitoIdentityProvider/types';
import { assertAuthTokens } from '../utils/types';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';
import { rememberDevice } from '..';
import { getAuthUserAgentValue } from '../../../utils';

// Cognito Documentation for max device
// https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_ListDevices.html#API_ListDevices_RequestSyntax
const MAX_DEVICES = 60;

/**
 * Fetches devices that have been remembered using {@link rememberDevice}
 * for the currently authenticated user.
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
		{
			region: getRegion(authConfig.userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.FetchDevices),
		},
		{
			AccessToken: tokens.accessToken.toString(),
			Limit: MAX_DEVICES,
		}
	);
	return parseDevicesResponse(response.Devices ?? []);
}

const parseDevicesResponse = async (
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
			const attributes = DeviceAttributes.reduce(
				(attrs: any, { Name, Value }) => {
					if (Name && Value) {
						attrs[Name] = Value;
					}
					return attrs;
				},
				{}
			);
			return {
				id,
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
