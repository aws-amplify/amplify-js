// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6 } from '@aws-amplify/core';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import {
	AuthResetPasswordStep,
	AuthStandardAttributeKey,
	DeliveryMedium,
	ResetPasswordRequest,
	ResetPasswordResult,
} from '../../../types';
import { CognitoResetPasswordOptions, CustomAttribute } from '../types';
import { forgotPassword } from '../utils/clients/CognitoIdentityProvider';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';

export async function resetPassword(
	resetPasswordRequest: ResetPasswordRequest<CognitoResetPasswordOptions>
): Promise<ResetPasswordResult<AuthStandardAttributeKey | CustomAttribute>> {
	const username = resetPasswordRequest.username;
	assertValidationError(
		!!username,
		AuthValidationErrorCode.EmptyResetPasswordUsername
	);
	const { clientMetadata, userPoolId, userPoolWebClientId } =
		AmplifyV6.getConfig().Auth;
	const res = await forgotPassword(
		{ region: getRegion(userPoolId) },
		{
			Username: username,
			ClientMetadata:
				resetPasswordRequest.options?.serviceOptions?.clientMetadata ??
				clientMetadata,
			ClientId: userPoolWebClientId,
		}
	);
	const codeDeliveryDetails = res.CodeDeliveryDetails;
	return {
		isPasswordReset: false,
		nextStep: {
			resetPasswordStep: AuthResetPasswordStep.CONFIRM_RESET_PASSWORD_WITH_CODE,
			codeDeliveryDetails: {
				deliveryMedium: codeDeliveryDetails?.DeliveryMedium as DeliveryMedium,
				destination: codeDeliveryDetails?.Destination as string,
				attributeName:
					codeDeliveryDetails?.AttributeName as AuthStandardAttributeKey,
			},
		},
	};
}
