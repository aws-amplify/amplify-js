// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { forgetDevice as serviceForgetDevice } from '../utils/clients/CognitoIdentityProvider';
import { Amplify } from '@aws-amplify/core';
import { assertAuthTokens, assertDeviceMetadata } from '../utils/types';
import { assertTokenProviderConfig } from '@aws-amplify/core/internals/utils';
import { fetchAuthSession } from '../../../';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';
import { tokenOrchestrator } from '../tokenProvider';
import { ForgetDeviceException } from '../../cognito/types/errors';

/**
 * Forget a remembered device while authenticated.
 *
 * @throws - {@link ForgetDeviceException} - Cognito service errors thrown when
 * forgetting device with invalid device key
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function forgetDevice(): Promise<void> {
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);

	const { tokens } = await fetchAuthSession();
	assertAuthTokens(tokens);

	const deviceMetadata = await tokenOrchestrator?.getDeviceMetadata();
	assertDeviceMetadata(deviceMetadata);

	await serviceForgetDevice(
		{ region: getRegion(authConfig.userPoolId) },
		{
			AccessToken: tokens.accessToken.toString(),
			DeviceKey: deviceMetadata.deviceKey,
		}
	);
	await tokenOrchestrator.clearDeviceMetadata();
}
