// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { assertTokenProviderConfig } from '@aws-amplify/core/internals/utils';
import { fetchAuthSession } from '../../../';
import {
	AuthUserAttribute,
	AuthUpdateUserAttributesOutput,
	AuthDeliveryMedium,
} from '../../../types';
import {
	UpdateUserAttributesInput,
	UpdateUserAttributesOutput,
} from '../types';
import { updateUserAttributes as updateUserAttributesClient } from '../utils/clients/CognitoIdentityProvider';
import { assertAuthTokens } from '../utils/types';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';
import { toAttributeType } from '../utils/apiHelpers';
import { CodeDeliveryDetailsType } from '../utils/clients/CognitoIdentityProvider/types';
import { UpdateUserAttributesException } from '../types/errors';

/**
 * Updates user's attributes while authenticated.
 *
 * @param input - The UpdateUserAttributesInput object
 * @returns UpdateUserAttributesOutput
 * @throws - {@link UpdateUserAttributesException}
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export const updateUserAttributes = async (
	input: UpdateUserAttributesInput
): Promise<UpdateUserAttributesOutput> => {
	const { userAttributes, options } = input;
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	const clientMetadata = options?.serviceOptions?.clientMetadata;
	assertTokenProviderConfig(authConfig);
	const { tokens } = await fetchAuthSession({ forceRefresh: false });
	assertAuthTokens(tokens);
	const { CodeDeliveryDetailsList } = await updateUserAttributesClient(
		{ region: getRegion(authConfig.userPoolId) },
		{
			AccessToken: tokens.accessToken.toString(),
			ClientMetadata: clientMetadata,
			UserAttributes: toAttributeType(userAttributes),
		}
	);

	return {
		...getConfirmedAttributes(userAttributes),
		...getUnConfirmedAttributes(CodeDeliveryDetailsList),
	};
};

function getConfirmedAttributes(
	attributes: AuthUserAttribute
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
	codeDeliveryDetailsList?: CodeDeliveryDetailsType[]
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
