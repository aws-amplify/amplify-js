// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthValidationErrorCode } from '~/src/errors/types/validation';
import { assertValidationError } from '~/src/errors/utils/assertValidationError';
import { UpdatePasswordInput } from '~/src/providers/cognito/types';
import { changePassword } from '~/src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { ChangePasswordException } from '~/src/providers/cognito/types/errors';
import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import {
	AuthAction,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';
import { getRegion } from '~/src/providers/cognito/utils/clients/CognitoIdentityProvider/utils';
import { assertAuthTokens } from '~/src/providers/cognito/utils/types';
import { getAuthUserAgentValue } from '~/src/utils';

/**
 * Updates user's password while authenticated.
 *
 * @param input - The UpdatePasswordInput object.
 * @throws - {@link ChangePasswordException} - Cognito service errors thrown when updating a password.
 * @throws - {@link AuthValidationErrorCode} - Validation errors thrown when oldPassword or newPassword are empty.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function updatePassword(
	input: UpdatePasswordInput,
): Promise<void> {
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);
	const { oldPassword, newPassword } = input;
	assertValidationError(
		!!oldPassword,
		AuthValidationErrorCode.EmptyUpdatePassword,
	);

	assertValidationError(
		!!newPassword,
		AuthValidationErrorCode.EmptyUpdatePassword,
	);
	const { tokens } = await fetchAuthSession({ forceRefresh: false });
	assertAuthTokens(tokens);
	await changePassword(
		{
			region: getRegion(authConfig.userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.UpdatePassword),
		},
		{
			AccessToken: tokens.accessToken.toString(),
			PreviousPassword: oldPassword,
			ProposedPassword: newPassword,
		},
	);
}
