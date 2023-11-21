// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { forgetDevice as serviceForgetDevice } from '~/src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import {
	assertAuthTokens,
	assertDeviceMetadata,
} from '~/src/providers/cognito/utils/types';
import {
	AuthAction,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';
import { getRegion } from '~/src/providers/cognito/utils/clients/CognitoIdentityProvider/utils';
import { tokenOrchestrator } from '~/src/providers/cognito/tokenProvider';
import { ForgetDeviceInput } from '~/src/providers/cognito/types';
import { ForgetDeviceException } from '~/src/providers/cognito/types/errors';
import { getAuthUserAgentValue } from '~/src/utils';

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
