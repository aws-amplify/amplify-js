// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import {
	AuthAction,
	AuthVerifiableAttributeKey,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';

import { AuthDeliveryMedium } from '../../../types';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { ResendSignUpCodeInput, ResendSignUpCodeOutput } from '../types';
import { getRegionFromUserPoolId } from '../../../foundation/parsers';
import { getAuthUserAgentValue } from '../../../utils';
import { getUserContextData } from '../utils/userContextData';
import { ResendConfirmationException } from '../types/errors';
import { createResendConfirmationCodeClient } from '../../../foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../factories';

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
	const { userPoolClientId, userPoolId, userPoolEndpoint } = authConfig;
	const clientMetadata = input.options?.clientMetadata;

	const UserContextData = getUserContextData({
		username,
		userPoolId,
		userPoolClientId,
	});
	const resendConfirmationCode = createResendConfirmationCodeClient({
		endpointResolver: createCognitoUserPoolEndpointResolver({
			endpointOverride: userPoolEndpoint,
		}),
	});
	const { CodeDeliveryDetails } = await resendConfirmationCode(
		{
			region: getRegionFromUserPoolId(authConfig.userPoolId),
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
