// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import {
	AuthAction,
	AuthVerifiableAttributeKey,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';
import { AuthDeliveryMedium } from '~/src/types';
import { assertValidationError } from '~/src/errors/utils/assertValidationError';
import { AuthValidationErrorCode } from '~/src/errors/types/validation';
import {
	ResendSignUpCodeInput,
	ResendSignUpCodeOutput,
} from '~/src/providers/cognito/types';
import { getRegion } from '~/src/providers/cognito/utils/clients/CognitoIdentityProvider/utils';
import { resendConfirmationCode } from '~/src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { getAuthUserAgentValue } from '~/src/utils';
import { getUserContextData } from '~/src/providers/cognito/utils/userContextData';

/**
 * Resend the confirmation code while signing up
 *
 * @param input -  The ResendSignUpCodeInput object
 * @returns ResendSignUpCodeOutput
 * @throws service: {@link ResendConfirmationException } - Cognito service errors thrown when resending the code.
 * @throws validation: {@link AuthValidationErrorCode } - Validation errors thrown either username are not defined.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function resendSignUpCode(
	input: ResendSignUpCodeInput,
): Promise<ResendSignUpCodeOutput> {
	const { username } = input;
	assertValidationError(
		!!username,
		AuthValidationErrorCode.EmptySignUpUsername,
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

	const { CodeDeliveryDetails } = await resendConfirmationCode(
		{
			region: getRegion(authConfig.userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.ResendSignUpCode),
		},
		{
			Username: username,
			ClientMetadata: clientMetadata,
			ClientId: authConfig.userPoolClientId,
			UserContextData,
		},
	);
	const { DeliveryMedium, AttributeName, Destination } = {
		...CodeDeliveryDetails,
	};

	return {
		destination: Destination as string,
		deliveryMedium: DeliveryMedium as AuthDeliveryMedium,
		attributeName: AttributeName
			? (AttributeName as AuthVerifiableAttributeKey)
			: undefined,
	};
}
