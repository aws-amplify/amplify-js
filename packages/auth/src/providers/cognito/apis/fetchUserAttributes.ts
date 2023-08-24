// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6 } from '@aws-amplify/core';
import { assertTokenProviderConfig } from '@aws-amplify/core/internals/utils';
import { FetchUserAttributesRequest } from '../../../types/requests';
import { getUser } from '../utils/clients/CognitoIdentityProvider';
import {
	GetUserException,
	InitiateAuthException,
} from '../../cognito/types/errors';
import { AuthUserAttribute, fetchAuthSession } from '../../../';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';
import { assertAuthTokens } from '../utils/types';
import { CognitoUserAttributeKey } from '../types';
import { toAuthUserAttribute } from '../utils/apiHelpers';

/**
 * Fetches the current user attributes while authenticated.
 *
 * @param fetchUserAttributesRequest - The fetchUserAttributesRequest object.
 *
 * @throws - {@link GetUserException} - Cognito service errors thrown when the service is not able to get the user.
 *
 * @throws - {@link InitiateAuthException} - Thrown when the service fails to refresh the tokens.
 *
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export const fetchUserAttributes = async (
	fetchUserAttributesRequest?: FetchUserAttributesRequest
): Promise<AuthUserAttribute<CognitoUserAttributeKey>> => {
	const authConfig = AmplifyV6.getConfig().Auth;
	assertTokenProviderConfig(authConfig);
	const { tokens } = await fetchAuthSession({
		forceRefresh: fetchUserAttributesRequest?.recache ?? false,
	});
	assertAuthTokens(tokens);
    
	const { UserAttributes } = await getUser(
		{ region: getRegion(authConfig.userPoolId) },
		{
			AccessToken: tokens.accessToken.toString(),
		}
	);

	return toAuthUserAttribute(UserAttributes);
};
