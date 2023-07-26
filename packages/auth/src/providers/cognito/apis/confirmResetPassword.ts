// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6 } from '@aws-amplify/core';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { confirmResetPasswordClient } from '../utils/clients/ConfirmResetPasswordClient';
import { ConfirmResetPasswordRequest } from '../../../types';
import { CognitoConfirmResetPasswordOptions } from '../types';

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
	const authConfig = AmplifyV6.getConfig().Auth;
	await confirmResetPasswordClient({
		Username: username,
		ConfirmationCode: code,
		Password: password,
		ClientMetadata:
			confirmResetPasswordRequest.options?.serviceOptions?.clientMetadata ??
			authConfig?.clientMetadata,
	});
}
