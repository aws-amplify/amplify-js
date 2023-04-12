// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { ConfirmForgotPasswordCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
import { CognitoConfirmResetPasswordOptions } from '..';
import { AuthError } from '../../../errors/AuthError';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { assertServiceError } from '../../../errors/utils/assertServiceError';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { ConfirmResetPasswordRequest } from '../../../types';
import { confirmResetPasswordClient } from '../utils/clients/ConfirmResetPasswordClient';

export async function confirmResetPassword(
	confirmResetPasswordRequest: ConfirmResetPasswordRequest<CognitoConfirmResetPasswordOptions>
): Promise<void> {
	const username = confirmResetPasswordRequest.username;
	assertValidationError(
		!!username,
		AuthValidationErrorCode.EmptyConfirmResetPasswordUsername
	);
	const password = confirmResetPasswordRequest.newPassword;
	assertValidationError(
		!!password,
		AuthValidationErrorCode.EmptyConfirmResetPasswordNewPassword
	);
	const code = confirmResetPasswordRequest.confirmationCode;
	assertValidationError(
		!!code,
		AuthValidationErrorCode.EmptyConfirmResetPasswordConfirmationCode
	);
	const config = Amplify.config;
	try {
		const res: ConfirmForgotPasswordCommandOutput = await confirmResetPasswordClient({
			Username: username,
			ConfirmationCode: code,
			Password: password,
			ClientMetadata: 
				confirmResetPasswordRequest.options?.serviceOptions?.clientMetadata ?? 
				config.clientMetadata
		});
	} catch (error) {
		assertServiceError(error);
		throw new AuthError({ name: error.name, message: error.message });
	}
}
