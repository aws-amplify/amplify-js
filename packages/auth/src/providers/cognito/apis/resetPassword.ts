// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { assertTokenProviderConfig } from '@aws-amplify/core/internals/utils';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import {
	AuthStandardAttributeKey,
	DeliveryMedium,
	ResetPasswordRequest,
	ResetPasswordResult,
} from '../../../types';
import { CognitoResetPasswordOptions, CustomAttribute } from '../types';
import { forgotPassword } from '../utils/clients/CognitoIdentityProvider';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';
import { ForgotPasswordException } from '../../cognito/types/errors';

/**
 * Resets a user's password.
 *
 * @param resetPasswordRequest - The ResetPasswordRequest object.
 * @throws -{@link ForgotPasswordException }
 * Thrown due to an invalid confirmation code or password.
 * @throws -{@link AuthValidationErrorCode }
 * Thrown due to an empty username.
 *
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 *
 * @returns ResetPasswordResult
 **/
export async function resetPassword(
	resetPasswordRequest: ResetPasswordRequest<CognitoResetPasswordOptions>
): Promise<ResetPasswordResult<AuthStandardAttributeKey | CustomAttribute>> {
	const username = resetPasswordRequest.username;
	assertValidationError(
		!!username,
		AuthValidationErrorCode.EmptyResetPasswordUsername
	);
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);
	const clientMetadata =
		resetPasswordRequest.options?.serviceOptions?.clientMetadata;
	const res = await forgotPassword(
		{ region: getRegion(authConfig.userPoolId) },
		{
			Username: username,
			ClientMetadata: clientMetadata,
			ClientId: authConfig.userPoolClientId,
		}
	);
	const codeDeliveryDetails = res.CodeDeliveryDetails;
	return {
		isPasswordReset: false,
		nextStep: {
			resetPasswordStep: 'CONFIRM_RESET_PASSWORD_WITH_CODE',
			codeDeliveryDetails: {
				deliveryMedium: codeDeliveryDetails?.DeliveryMedium as DeliveryMedium,
				destination: codeDeliveryDetails?.Destination as string,
				attributeName:
					codeDeliveryDetails?.AttributeName as AuthStandardAttributeKey,
			},
		},
	};
}
