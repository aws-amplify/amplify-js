// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import type { 
	ForgotPasswordCommandOutput 
} from '@aws-sdk/client-cognito-identity-provider';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { 
	AuthResetPasswordStep,
	AuthStandardAttributeKey, 
	DeliveryMedium, 
	ResetPasswordRequest, 
	ResetPasswordResult 
} from '../../../types';
import { CustomAttribute } from '../types/models/CustomAttribute';
import { CognitoResetPasswordOptions } from '../types/options/CognitoResetPasswordOptions';
import { resetPasswordClient } from '../utils/clients/ResetPasswordClient';

export async function resetPassword(
	resetPasswordRequest: ResetPasswordRequest<CognitoResetPasswordOptions>
): Promise<ResetPasswordResult<AuthStandardAttributeKey | CustomAttribute>> {
	const username = resetPasswordRequest.username;
	assertValidationError(
		!!username,
		AuthValidationErrorCode.EmptyResetPasswordUsername
	);
	const config = Amplify.config;
	const res: ForgotPasswordCommandOutput = await resetPasswordClient({
		Username: username,
		ClientMetadata: 
			resetPasswordRequest.options?.serviceOptions?.clientMetadata ?? 
			config.clientMetadata
	});
	const codeDeliveryDetails = res.CodeDeliveryDetails;
	return {
		isPasswordReset: false,
		nextStep: {
			resetPasswordStep: AuthResetPasswordStep.CONFIRM_RESET_PASSWORD_WITH_CODE,
			codeDeliveryDetails: {
				deliveryMedium: codeDeliveryDetails?.DeliveryMedium as DeliveryMedium,
				destination: codeDeliveryDetails?.Destination as string,
				attributeName: codeDeliveryDetails?.AttributeName as AuthStandardAttributeKey,
			},
		},
	};
}
