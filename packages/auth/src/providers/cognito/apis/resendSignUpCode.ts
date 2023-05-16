// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import type { ResendConfirmationCodeCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
import {
	AuthCodeDeliveryDetails,
	AuthStandardAttributeKey,
	DeliveryMedium,
	ResendSignUpCodeRequest,
} from '../../../types';
import { CognitoResendSignUpCodeOptions, CognitoUserAttributeKey } from '..';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { resendSignUpConfirmationCodeClient } from '../utils/clients/ResendSignUpCodeClient';

/**
 * Resend the confirmation code while signing up
 *
 * @param resendRequest - The resendRequest object
 * @returns AuthCodeDeliveryDetails
 * @throws service: {@link ResendConfirmationException } - Cognito service errors thrown when resendign the confirmation code.
 * @throws validation: {@link AuthValidationErrorCode } - Validation errors thrown either username are not defined.
 *
 * TODO: add config errors
 */

export async function resendSignUpCode(
	resendRequest: ResendSignUpCodeRequest<CognitoResendSignUpCodeOptions>
): Promise<AuthCodeDeliveryDetails<CognitoUserAttributeKey>> {
	const username = resendRequest.username;
	assertValidationError(
		!!username,
		AuthValidationErrorCode.EmptySignUpUsername
	);
	const config = Amplify.config;
	const { CodeDeliveryDetails }: ResendConfirmationCodeCommandOutput =
		await resendSignUpConfirmationCodeClient({
			Username: username,
			ClientMetadata:
				resendRequest.options?.serviceOptions?.clientMetadata ??
				config.clientMetadata,
		});
	const { DeliveryMedium, AttributeName, Destination } = {
		...CodeDeliveryDetails,
	};
	return {
		destination: Destination as string,
		deliveryMedium: DeliveryMedium as DeliveryMedium,
		attributeName: AttributeName
			? (AttributeName as AuthStandardAttributeKey)
			: undefined,
	};
}
