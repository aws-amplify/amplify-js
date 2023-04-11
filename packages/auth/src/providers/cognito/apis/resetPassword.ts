// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import type { 
	ForgotPasswordCommandOutput 
} from '@aws-sdk/client-cognito-identity-provider';
import { AuthError } from '../../../errors/AuthError';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { assertServiceError } from '../../../errors/utils/assertServiceError';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { 
	AuthResetPasswordStep,
	AuthStandardAttributeKey, 
	DeliveryMedium, 
	ResetPasswordRequest, 
	ResetPasswordResult 
} from '../../../types';
import { CustomAttribute } from '../types/models/CustomAttribute';
import { CognitoSignUpOptions } from '../types/options/CognitoSignUpOptions';
import { resetPasswordClient } from '../utils/clients/ResetPasswordClient';

export async function resetPassword(
	resetPasswordRequest: ResetPasswordRequest<CognitoSignUpOptions>
): Promise<ResetPasswordResult<AuthStandardAttributeKey | CustomAttribute>> {
	const username: string = resetPasswordRequest.username;
	assertValidationError(
		!!username,
		AuthValidationErrorCode.EmptyResetPasswordUsername
	);
	const config = Amplify.config;
	try {
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
	} catch (error) {
		assertServiceError(error);
		throw new AuthError({ name: error.name, message: error.message });
	}
}	
