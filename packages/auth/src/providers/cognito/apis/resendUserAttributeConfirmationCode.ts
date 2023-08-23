// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6 as Amplify } from '@aws-amplify/core';
import { assertTokenProviderConfig } from '@aws-amplify/core/internals/utils';
import { fetchAuthSession } from '../../../';
import {
	AuthCodeDeliveryDetails,
	AuthStandardAttributeKey,
	DeliveryMedium,
	ResendUserAttributeConfirmationCodeRequest,
} from '../../../types';
import {
	CognitoResendUserAttributeConfirmationCodeOptions,
	CognitoUserAttributeKey,
} from '../types';
import { getUserAttributeVerificationCode } from '../utils/clients/CognitoIdentityProvider';
import { assertAuthTokens } from '../utils/types';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';
import { GetUserAttributeVerificationException } from '../types/errors';

/**
 * Resends user's confirmation code when updating attributes while authenticated.
 *
 * @param resendUserAttributeConfirmationCodeRequest - The ResendUserAttributeConfirmationCodeRequest object
 *
 * @throws - {@link GetUserAttributeVerificationException}
 *
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 *
 * @returns AuthCodeDeliveryDetails
 */
export const resendUserAttributeConfirmationCode = async (
	resendUserAttributeConfirmationCodeRequest: ResendUserAttributeConfirmationCodeRequest<
		CognitoUserAttributeKey,
		CognitoResendUserAttributeConfirmationCodeOptions
	>
): Promise<AuthCodeDeliveryDetails<CognitoUserAttributeKey>> => {
	const { userAttributeKey, options } =
		resendUserAttributeConfirmationCodeRequest;
	const authConfig = Amplify.getConfig().Auth;
	const clientMetadata =
		options?.serviceOptions?.clientMetadata ?? authConfig.clientMetadata;
	assertTokenProviderConfig(authConfig);
	const { tokens } = await fetchAuthSession({ forceRefresh: false });
	assertAuthTokens(tokens);
	const { CodeDeliveryDetails } = await getUserAttributeVerificationCode(
		{ region: getRegion(authConfig.userPoolId) },
		{
			AccessToken: tokens.accessToken.toString(),
			AttributeName: userAttributeKey,
			ClientMetadata: clientMetadata,
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
};
