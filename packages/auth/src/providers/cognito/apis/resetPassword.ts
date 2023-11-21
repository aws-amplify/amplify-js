// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import {
	AuthAction,
	AuthVerifiableAttributeKey,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';
import { AuthValidationErrorCode } from '~/src/errors/types/validation';
import { assertValidationError } from '~/src/errors/utils/assertValidationError';
import { AuthDeliveryMedium } from '~/src/types';
import {
	ResetPasswordInput,
	ResetPasswordOutput,
} from '~/src/providers/cognito/types';
import { forgotPassword } from '~/src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { getRegion } from '~/src/providers/cognito/utils/clients/CognitoIdentityProvider/utils';
import { ForgotPasswordException } from '~/src/providers/cognito/types/errors';
import { getAuthUserAgentValue } from '~/src/utils';
import { getUserContextData } from '~/src/providers/cognito/utils/userContextData';

/**
 * Resets a user's password.
 *
 * @param input -  The ResetPasswordInput object.
 * @returns ResetPasswordOutput
 * @throws -{@link ForgotPasswordException }
 * Thrown due to an invalid confirmation code or password.
 * @throws -{@link AuthValidationErrorCode }
 * Thrown due to an empty username.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 **/
export async function resetPassword(
	input: ResetPasswordInput,
): Promise<ResetPasswordOutput> {
	const { username } = input;
	assertValidationError(
		!!username,
		AuthValidationErrorCode.EmptyResetPasswordUsername,
	);
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);
	const { userPoolClientId, userPoolId } = authConfig;
	const clientMetadata = input.options?.clientMetadata;

	const UserContextData = getUserContextData({
		username,
		userPoolId,
		userPoolClientId,
	});

	const res = await forgotPassword(
		{
			region: getRegion(authConfig.userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.ResetPassword),
		},
		{
			Username: username,
			ClientMetadata: clientMetadata,
			ClientId: authConfig.userPoolClientId,
			UserContextData,
		},
	);
	const codeDeliveryDetails = res.CodeDeliveryDetails;

	return {
		isPasswordReset: false,
		nextStep: {
			resetPasswordStep: 'CONFIRM_RESET_PASSWORD_WITH_CODE',
			codeDeliveryDetails: {
				deliveryMedium:
					codeDeliveryDetails?.DeliveryMedium as AuthDeliveryMedium,
				destination: codeDeliveryDetails?.Destination as string,
				attributeName:
					codeDeliveryDetails?.AttributeName as AuthVerifiableAttributeKey,
			},
		},
	};
}
