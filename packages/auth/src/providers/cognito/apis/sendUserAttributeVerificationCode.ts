// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import {
	AuthAction,
	AuthVerifiableAttributeKey,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';

import { AuthDeliveryMedium } from '../../../types';
import {
	SendUserAttributeVerificationCodeInput,
	SendUserAttributeVerificationCodeOutput,
} from '../types';
import { assertAuthTokens } from '../utils/types';
import { getRegionFromUserPoolId } from '../../../foundation/parsers';
import { GetUserAttributeVerificationException } from '../types/errors';
import { getAuthUserAgentValue } from '../../../utils';
import { createGetUserAttributeVerificationCodeClient } from '../../../foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../factories';

/**
 * Resends user's confirmation code when updating attributes while authenticated.
 *
 * @param input - The SendUserAttributeVerificationCodeInput object
 * @returns SendUserAttributeVerificationCodeOutput
 * @throws - {@link GetUserAttributeVerificationException}
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export const sendUserAttributeVerificationCode = async (
	input: SendUserAttributeVerificationCodeInput,
): Promise<SendUserAttributeVerificationCodeOutput> => {
	const { userAttributeKey, options } = input;
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	const clientMetadata = options?.clientMetadata;
	assertTokenProviderConfig(authConfig);
	const { userPoolEndpoint, userPoolId } = authConfig;
	const { tokens } = await fetchAuthSession({ forceRefresh: false });
	assertAuthTokens(tokens);
	const getUserAttributeVerificationCode =
		createGetUserAttributeVerificationCodeClient({
			endpointResolver: createCognitoUserPoolEndpointResolver({
				endpointOverride: userPoolEndpoint,
			}),
		});
	const { CodeDeliveryDetails } = await getUserAttributeVerificationCode(
		{
			region: getRegionFromUserPoolId(userPoolId),
			userAgentValue: getAuthUserAgentValue(
				AuthAction.SendUserAttributeVerificationCode,
			),
		},
		{
			AccessToken: tokens.accessToken.toString(),
			ClientMetadata: clientMetadata,
			AttributeName: userAttributeKey,
		},
	);
	const { DeliveryMedium, AttributeName, Destination } = {
		...CodeDeliveryDetails,
	};

	return {
		destination: Destination,
		deliveryMedium: DeliveryMedium as AuthDeliveryMedium,
		attributeName: AttributeName as AuthVerifiableAttributeKey,
	};
};
