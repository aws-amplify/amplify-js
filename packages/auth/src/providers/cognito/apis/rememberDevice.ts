// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { updateDeviceStatus } from '../utils/clients/CognitoIdentityProvider';
import { Amplify } from '@aws-amplify/core';
import { assertAuthTokens, assertDeviceMetadata } from '../utils/types';
import { assertTokenProviderConfig } from '@aws-amplify/core/internals/utils';
import { fetchAuthSession } from '../../../';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';
import { tokenOrchestrator } from '../tokenProvider';
import { UpdateDeviceStatusException } from '../../cognito/types/errors';

/**
 * Marks device as remembered while authenticated.
 *
 * @throws - {@link UpdateDeviceStatusException} - Cognito service errors thrown when
 * setting device status to remembered.
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
		{ region: getRegion(authConfig.userPoolId) },
		{
			AccessToken: tokens.accessToken.toString(),
			DeviceKey: deviceMetadata.deviceKey,
			DeviceRememberedStatus: 'remembered',
		}
	);
}
