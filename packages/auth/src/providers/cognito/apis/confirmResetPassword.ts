// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import {
	AuthAction,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';
import { AuthValidationErrorCode } from '~/src/errors/types/validation';
import { assertValidationError } from '~/src/errors/utils/assertValidationError';
import { ConfirmResetPasswordInput } from '~/src/providers/cognito/types';
import { confirmForgotPassword } from '~/src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { getRegion } from '~/src/providers/cognito/utils/clients/CognitoIdentityProvider/utils';
import { ConfirmForgotPasswordException } from '~/src/providers/cognito/types/errors';
import { getAuthUserAgentValue } from '~/src/utils';
import { getUserContextData } from '~/src/providers/cognito/utils/userContextData';
/**
 * Confirms the new password and verification code to reset the password.
 *
 * @param input -  The ConfirmResetPasswordInput object.
 * @throws -{@link ConfirmForgotPasswordException }
 * Thrown due to an invalid confirmation code or password.
 * @throws -{@link AuthValidationErrorCode }
 * Thrown due to an empty confirmation code, password or username.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function confirmResetPassword(
	input: ConfirmResetPasswordInput,
): Promise<void> {
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);
	const { userPoolClientId, userPoolId } = authConfig;
	const { username, newPassword } = input;
	assertValidationError(
		!!username,
		AuthValidationErrorCode.EmptyConfirmResetPasswordUsername,
	);

	assertValidationError(
		!!newPassword,
		AuthValidationErrorCode.EmptyConfirmResetPasswordNewPassword,
	);
	const code = input.confirmationCode;
	assertValidationError(
		!!code,
		AuthValidationErrorCode.EmptyConfirmResetPasswordConfirmationCode,
	);
	const metadata = input.options?.clientMetadata;

	const UserContextData = getUserContextData({
		username,
		userPoolId,
		userPoolClientId,
	});

	await confirmForgotPassword(
		{
			region: getRegion(authConfig.userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.ConfirmResetPassword),
		},
		{
			Username: username,
			ConfirmationCode: code,
			Password: newPassword,
			ClientMetadata: metadata,
			ClientId: authConfig.userPoolClientId,
			UserContextData,
		},
	);
}
