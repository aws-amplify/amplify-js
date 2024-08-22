// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import {
	AuthAction,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';

import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { ConfirmResetPasswordInput } from '../types';
import { ConfirmForgotPasswordException } from '../../cognito/types/errors';
import { getAuthUserAgentValue } from '../../../utils';
import { getUserContextData } from '../utils/userContextData';
import { createConfirmForgotPasswordClient } from '../../../foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../factories';
import { getRegionFromUserPoolId } from '../../../foundation/parsers';
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
	const { userPoolClientId, userPoolId, userPoolEndpoint } = authConfig;
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
	const confirmForgotPassword = createConfirmForgotPasswordClient({
		endpointResolver: createCognitoUserPoolEndpointResolver({
			endpointOverride: userPoolEndpoint,
		}),
	});
	await confirmForgotPassword(
		{
			region: getRegionFromUserPoolId(authConfig.userPoolId),
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
