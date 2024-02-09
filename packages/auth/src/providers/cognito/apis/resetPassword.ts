// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import {
	assertTokenProviderConfig,
	AuthAction,
	AuthVerifiableAttributeKey,
} from '@aws-amplify/core/internals/utils';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { AuthDeliveryMedium } from '../../../types';
import { ResetPasswordInput, ResetPasswordOutput } from '../types';
import { forgotPassword } from '../utils/clients/CognitoIdentityProvider';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';
import { ForgotPasswordException } from '../../cognito/types/errors';
import { getAuthUserAgentValue } from '../../../utils';
import { getUserContextData } from '../utils/userContextData';

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
	input: ResetPasswordInput
): Promise<ResetPasswordOutput> {
	const username = input.username;
	assertValidationError(
		!!username,
		AuthValidationErrorCode.EmptyResetPasswordUsername
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
		}
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
