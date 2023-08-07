// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6 } from '@aws-amplify/core';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { ConfirmResetPasswordRequest } from '../../../types';
import { CognitoConfirmResetPasswordOptions } from '../types';
import { confirmForgotPassword } from '../utils/clients/CognitoIdentityProvider';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';

export async function confirmResetPassword(
	confirmResetPasswordRequest: ConfirmResetPasswordRequest<CognitoConfirmResetPasswordOptions>
): Promise<void> {
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
	const { clientMetadata, userPoolId, userPoolWebClientId } =
		AmplifyV6.getConfig().Auth;
	await confirmForgotPassword(
		{ region: getRegion(userPoolId) },
		{
			Username: username,
			ConfirmationCode: code,
			Password: newPassword,
			ClientMetadata:
				confirmResetPasswordRequest.options?.serviceOptions?.clientMetadata ??
				clientMetadata,
			ClientId: userPoolWebClientId,
		}
	);
}
