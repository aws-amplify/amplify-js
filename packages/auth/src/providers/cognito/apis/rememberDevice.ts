// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import {
	AuthAction,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';

import { updateDeviceStatus } from '../utils/clients/CognitoIdentityProvider';
import { assertAuthTokens, assertDeviceMetadata } from '../utils/types';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';
import { tokenOrchestrator } from '../tokenProvider';
import { UpdateDeviceStatusException } from '../../cognito/types/errors';
import { getAuthUserAgentValue } from '../../../utils';

/**
 * Marks device as remembered while authenticated.
 *
 * @throws - {@link UpdateDeviceStatusException} - Cognito service errors thrown when
 * setting device status to remembered using an invalid device key.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function rememberDevice(): Promise<void> {
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);

	const { tokens } = await fetchAuthSession();
	assertAuthTokens(tokens);

	const deviceMetadata = await tokenOrchestrator?.getDeviceMetadata();
	assertDeviceMetadata(deviceMetadata);

	await updateDeviceStatus(
		{
			region: getRegion(authConfig.userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.RememberDevice),
		},
		{
			AccessToken: tokens.accessToken.toString(),
			DeviceKey: deviceMetadata.deviceKey,
			DeviceRememberedStatus: 'remembered',
		},
	);
}
