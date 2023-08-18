// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyV6 as Amplify,
	assertTokenProviderConfig,
} from '@aws-amplify/core';
import { fetchAuthSession } from '../../../';
import {
	AuthUserAttribute,
	UpdateUserAttributesRequest,
	UpdateUserAttributesResult,
	DeliveryMedium 
} from '../../../types';
import {
	CognitoUpdateUserAttributesOptions,
	CognitoUserAttributeKey,
} from '../types';
import { updateUserAttributes as updateUserAttributesClient } from '../utils/clients/CognitoIdentityProvider';
import { assertAuthTokens } from '../utils/types';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';
import { toAttributeType } from '../utils/apiHelpers';
import { CodeDeliveryDetailsType } from '../utils/clients/CognitoIdentityProvider/types';
import { AuthUpdateAttributeStep } from '../../../types/enums';
import { UpdateUserAttributesException } from '../types/errors';

/**
 * Updates user's attributes while authenticated.
 *
 * @param updateUserAttributesRequest - The UpdateUserAttributesRequest object
 *
 * @throws - {@link UpdateUserAttributesException}
 *
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 *
 * @returns UpdateUserAttributesResult
 */
export const updateUserAttributes = async (
	updateUserAttributesRequest: UpdateUserAttributesRequest<
		CognitoUserAttributeKey,
		CognitoUpdateUserAttributesOptions
	>
): Promise<UpdateUserAttributesResult<CognitoUserAttributeKey>> => {
	const { userAttributes, options } = updateUserAttributesRequest;
	const authConfig = Amplify.getConfig().Auth;
	const clientMetadata =
		options?.serviceOptions?.clientMetadata ?? authConfig.clientMetadata;
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
		...getUpdatedAttributes(userAttributes),
		...getUnupdatedAttributes(CodeDeliveryDetailsList),
	};
};

function getUpdatedAttributes(
	attributes: AuthUserAttribute
): UpdateUserAttributesResult {
	const updatedAttributes = {} as UpdateUserAttributesResult;
	Object.keys(attributes)?.forEach(key => {
		updatedAttributes[key] = {
			isUpdated: true,
			nextStep: {
				updateAttributeStep: AuthUpdateAttributeStep.DONE,
			},
		};
	});

	return updatedAttributes;
}

function getUnupdatedAttributes(
	codeDeliveryDetailsList?: CodeDeliveryDetailsType[]
): UpdateUserAttributesResult {
	const unUpdatedAttributes = {} as UpdateUserAttributesResult;
	codeDeliveryDetailsList?.forEach(codeDeliveryDetails => {
		const { AttributeName, DeliveryMedium, Destination } = codeDeliveryDetails;
		unUpdatedAttributes[AttributeName] = {
			isUpdated: false,
			nextStep: {
				updateAttributeStep:
					AuthUpdateAttributeStep.CONFIRM_ATTRIBUTE_WITH_CODE,
				codeDeliveryDetails: {
					attributeName: AttributeName,
					deliveryMedium: DeliveryMedium as DeliveryMedium,
					destination: Destination,
				},
			},
		};
	});
	return unUpdatedAttributes;
}
