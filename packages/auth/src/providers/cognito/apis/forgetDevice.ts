// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import {
	AuthAction,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';

import { forgetDevice as serviceForgetDevice } from '../utils/clients/CognitoIdentityProvider';
import { assertAuthTokens, assertDeviceMetadata } from '../utils/types';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';
import { tokenOrchestrator } from '../tokenProvider';
import { ForgetDeviceInput } from '../types';
import { ForgetDeviceException } from '../../cognito/types/errors';
import { getAuthUserAgentValue } from '../../../utils';

/**
 * Forget a remembered device while authenticated.
 *
 * @param input - The ForgetDeviceInput object.
 * @throws - {@link ForgetDeviceException} - Cognito service errors thrown when
 * forgetting device with invalid device key
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function forgetDevice(input?: ForgetDeviceInput): Promise<void> {
	const { device: { id: externalDeviceKey } = { id: undefined } } = input ?? {};
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);

	const { tokens } = await fetchAuthSession();
	assertAuthTokens(tokens);

	const deviceMetadata = await tokenOrchestrator.getDeviceMetadata();
	const currentDeviceKey = deviceMetadata?.deviceKey;
	if (!externalDeviceKey) assertDeviceMetadata(deviceMetadata);

	await serviceForgetDevice(
		{
			region: getRegion(authConfig.userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.ForgetDevice),
		},
		{
			AccessToken: tokens.accessToken.toString(),
			DeviceKey: externalDeviceKey ?? currentDeviceKey,
		},
	);

	if (!externalDeviceKey || externalDeviceKey === currentDeviceKey)
		await tokenOrchestrator.clearDeviceMetadata();
}
