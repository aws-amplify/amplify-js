// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import {
	AuthAction,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';

import {
	AuthDeliveryMedium,
	AuthUpdateUserAttributesOutput,
	AuthUserAttributes,
} from '../../../types';
import {
	UpdateUserAttributesInput,
	UpdateUserAttributesOutput,
} from '../types';
import { assertAuthTokens } from '../utils/types';
import { getRegionFromUserPoolId } from '../../../foundation/parsers';
import { toAttributeType } from '../utils/apiHelpers';
import { CodeDeliveryDetailsType } from '../../../foundation/factories/serviceClients/cognitoIdentityProvider/types';
import { UpdateUserAttributesException } from '../types/errors';
import { getAuthUserAgentValue } from '../../../utils';
import { createUpdateUserAttributesClient } from '../../../foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../factories';

/**
 * Updates user's attributes while authenticated.
 *
 * @param input - The UpdateUserAttributesInput object
 * @returns UpdateUserAttributesOutput
 * @throws - {@link UpdateUserAttributesException}
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export const updateUserAttributes = async (
	input: UpdateUserAttributesInput,
): Promise<UpdateUserAttributesOutput> => {
	const { userAttributes, options } = input;
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	const clientMetadata = options?.clientMetadata;
	assertTokenProviderConfig(authConfig);
	const { userPoolEndpoint, userPoolId } = authConfig;
	const { tokens } = await fetchAuthSession({ forceRefresh: false });
	assertAuthTokens(tokens);
	const updateUserAttributesClient = createUpdateUserAttributesClient({
		endpointResolver: createCognitoUserPoolEndpointResolver({
			endpointOverride: userPoolEndpoint,
		}),
	});
	const { CodeDeliveryDetailsList } = await updateUserAttributesClient(
		{
			region: getRegionFromUserPoolId(userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.UpdateUserAttributes),
		},
		{
			AccessToken: tokens.accessToken.toString(),
			ClientMetadata: clientMetadata,
			UserAttributes: toAttributeType(userAttributes),
		},
	);

	return {
		...getConfirmedAttributes(userAttributes),
		...getUnConfirmedAttributes(CodeDeliveryDetailsList),
	};
};

function getConfirmedAttributes(
	attributes: AuthUserAttributes,
): AuthUpdateUserAttributesOutput {
	const confirmedAttributes = {} as AuthUpdateUserAttributesOutput;
	Object.keys(attributes)?.forEach(key => {
		confirmedAttributes[key] = {
			isUpdated: true,
			nextStep: {
				updateAttributeStep: 'DONE',
			},
		};
	});

	return confirmedAttributes;
}

function getUnConfirmedAttributes(
	codeDeliveryDetailsList?: CodeDeliveryDetailsType[],
): AuthUpdateUserAttributesOutput {
	const unConfirmedAttributes = {} as AuthUpdateUserAttributesOutput;
	codeDeliveryDetailsList?.forEach(codeDeliveryDetails => {
		const { AttributeName, DeliveryMedium, Destination } = codeDeliveryDetails;
		if (AttributeName)
			unConfirmedAttributes[AttributeName] = {
				isUpdated: false,
				nextStep: {
					updateAttributeStep: 'CONFIRM_ATTRIBUTE_WITH_CODE',
					codeDeliveryDetails: {
						attributeName: AttributeName,
						deliveryMedium: DeliveryMedium as AuthDeliveryMedium,
						destination: Destination,
					},
				},
			};
	});

	return unConfirmedAttributes;
}
