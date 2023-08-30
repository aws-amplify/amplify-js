// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { assertUserPoolClientIdInConfig } from '@aws-amplify/core/internals/utils';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { ConfirmResetPasswordRequest } from '../../../types';
import { CognitoConfirmResetPasswordOptions } from '../types';
import { confirmForgotPassword } from '../utils/clients/CognitoIdentityProvider';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';
import { ConfirmForgotPasswordException } from '../../cognito/types/errors';
/**
 * Confirms the new password and verification code to reset the password.
 *
 * @param confirmResetPasswordRequest - The ConfirmResetPasswordRequest object.
 * @throws -{@link ConfirmForgotPasswordException }
 * Thrown due to an invalid confirmation code or password.
 * @throws -{@link AuthValidationErrorCode }
 * Thrown due to an empty confirmation code, password or username.
 *
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 *
 */
export async function confirmResetPassword(
	confirmResetPasswordRequest: ConfirmResetPasswordRequest<CognitoConfirmResetPasswordOptions>
): Promise<void> {
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertUserPoolClientIdInConfig(authConfig);

	const { username, newPassword } = confirmResetPasswordRequest;
	assertValidationError(
		!!username,
		AuthValidationErrorCode.EmptyConfirmResetPasswordUsername
	);

	assertValidationError(
		!!newPassword,
		AuthValidationErrorCode.EmptyConfirmResetPasswordNewPassword
	);
	const code = confirmResetPasswordRequest.confirmationCode;
	assertValidationError(
		!!code,
		AuthValidationErrorCode.EmptyConfirmResetPasswordConfirmationCode
	);
	const metadata =
		confirmResetPasswordRequest.options?.serviceOptions?.clientMetadata;

	await confirmForgotPassword(
		{ region: getRegion(authConfig.userPoolId) },
		{
			Username: username,
			ConfirmationCode: code,
			Password: newPassword,
			ClientMetadata: metadata,
			ClientId: authConfig.userPoolClientId,
		}
	);
}
