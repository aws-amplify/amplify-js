// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthValidationErrorCode } from '~/src/errors/types/validation';
import { assertValidationError } from '~/src/errors/utils/assertValidationError';
import { VerifyTOTPSetupInput } from '~/src/providers/cognito/types';
import { verifySoftwareToken } from '~/src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { VerifySoftwareTokenException } from '~/src/providers/cognito/types/errors';
import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import {
	AuthAction,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';
import { getRegion } from '~/src/providers/cognito/utils/clients/CognitoIdentityProvider/utils';
import { assertAuthTokens } from '~/src/providers/cognito/utils/types';
import { getAuthUserAgentValue } from '~/src/utils';

/**
 * Verifies an OTP code retrieved from an associated authentication app.
 *
 * @param input - The VerifyTOTPSetupInput
 * @throws  -{@link VerifySoftwareTokenException }:
 * Thrown due to an invalid MFA token.
 * @throws  -{@link AuthValidationErrorCode }:
 * Thrown when `code` is not defined.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function verifyTOTPSetup(
	input: VerifyTOTPSetupInput,
): Promise<void> {
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);
	const { code, options } = input;
	assertValidationError(
		!!code,
		AuthValidationErrorCode.EmptyVerifyTOTPSetupCode,
	);
	const { tokens } = await fetchAuthSession({ forceRefresh: false });
	assertAuthTokens(tokens);
	await verifySoftwareToken(
		{
			region: getRegion(authConfig.userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.VerifyTOTPSetup),
		},
		{
			AccessToken: tokens.accessToken.toString(),
			UserCode: code,
			FriendlyDeviceName: options?.friendlyDeviceName,
		},
	);
}
