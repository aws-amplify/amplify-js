// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6, assertTokenProviderConfig } from '@aws-amplify/core';
import {
	AuthCodeDeliveryDetails,
	AuthStandardAttributeKey,
	DeliveryMedium,
	ResendSignUpCodeRequest,
} from '../../../types';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import {
	CognitoResendSignUpCodeOptions,
	CognitoUserAttributeKey,
} from '../types';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';
import { resendConfirmationCode } from '../utils/clients/CognitoIdentityProvider';

/**
 * Resend the confirmation code while signing up
 *
 * @param resendRequest - The resendRequest object
 * @returns AuthCodeDeliveryDetails
 * @throws service: {@link ResendConfirmationException } - Cognito service errors thrown when resending the code.
 * @throws validation: {@link AuthValidationErrorCode } - Validation errors thrown either username are not defined.
 *
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function resendSignUpCode(
	resendRequest: ResendSignUpCodeRequest<CognitoResendSignUpCodeOptions>
): Promise<AuthCodeDeliveryDetails<CognitoUserAttributeKey>> {
	const username = resendRequest.username;
	assertValidationError(
		!!username,
		AuthValidationErrorCode.EmptySignUpUsername
	);
	const authConfig = AmplifyV6.getConfig().Auth;
	assertTokenProviderConfig(authConfig);
	const clientMetadata =
		resendRequest.options?.serviceOptions?.clientMetadata ??
		authConfig.clientMetadata;
	const { CodeDeliveryDetails } = await resendConfirmationCode(
		{ region: getRegion(authConfig.userPoolId) },
		{
			Username: username,
			ClientMetadata: clientMetadata,
			ClientId: authConfig.userPoolWebClientId,
		}
	);
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
