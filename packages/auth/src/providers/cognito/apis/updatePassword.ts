// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import {
	AuthAction,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';

import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { UpdatePasswordInput } from '../types';
import { ChangePasswordException } from '../../cognito/types/errors';
import { getRegionFromUserPoolId } from '../../../foundation/parsers';
import { assertAuthTokens } from '../utils/types';
import { getAuthUserAgentValue } from '../../../utils';
import { createChangePasswordClient } from '../../../foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../factories';

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
	const { userPoolEndpoint, userPoolId } = authConfig;
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
	const changePassword = createChangePasswordClient({
		endpointResolver: createCognitoUserPoolEndpointResolver({
			endpointOverride: userPoolEndpoint,
		}),
	});
	await changePassword(
		{
			region: getRegionFromUserPoolId(userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.UpdatePassword),
		},
		{
			AccessToken: tokens.accessToken.toString(),
			PreviousPassword: oldPassword,
			ProposedPassword: newPassword,
		},
	);
}
