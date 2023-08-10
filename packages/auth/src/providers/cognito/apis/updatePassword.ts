// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { UpdatePasswordRequest } from '../../../types/requests';
import { changePassword } from '../utils/clients/CognitoIdentityProvider';
import { ChangePasswordException } from '../../cognito/types/errors';
import { AmplifyV6 } from '@aws-amplify/core';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';

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
	const { userPoolId } = AmplifyV6.getConfig().Auth;
	const { oldPassword, newPassword } = updatePasswordRequest;
	assertValidationError(
		!!oldPassword,
		AuthValidationErrorCode.EmptyUpdatePassword
	);

	assertValidationError(
		!!newPassword,
		AuthValidationErrorCode.EmptyUpdatePassword
	);

	await changePassword(
		{ region: getRegion(userPoolId) },
		{
			AccessToken: accessToken,
			PreviousPassword: oldPassword,
			ProposedPassword: newPassword,
		}
	);
}
