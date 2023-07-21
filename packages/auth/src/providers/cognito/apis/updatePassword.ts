// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { UpdatePasswordRequest } from '../../../types/requests';
import { changePasswordClient } from '../utils/clients/ChangePasswordClient';
import { ChangePasswordException } from '../../cognito/types/errors';

/**
 * Updates user's password while authenticated.
 *
 * @param updatePasswordRequest - The updatePasswordRequest object.
 *
 * @throws - {@link ChangePasswordException} - Cognito service errors thrown when updatinga password.
 *
 * @throws - {@link AuthValidationErrorCode} - Validation errors thrown when oldPassword or newPassword are empty.
 *
 * TODO: add config errors
 */
export async function updatePassword(
	updatePasswordRequest: UpdatePasswordRequest
): Promise<void> {
	// TODO: replace this when TokenProvider is implemented
	const accessToken = 'mockedAccessToken';
	const { oldPassword, newPassword } = updatePasswordRequest;
	assertValidationError(
		!!oldPassword,
		AuthValidationErrorCode.EmptyUpdatePassword
	);

	assertValidationError(
		!!newPassword,
		AuthValidationErrorCode.EmptyUpdatePassword
	);

	await changePasswordClient({
		AccessToken: accessToken,
		PreviousPassword: oldPassword,
		ProposedPassword: newPassword,
	});
}
