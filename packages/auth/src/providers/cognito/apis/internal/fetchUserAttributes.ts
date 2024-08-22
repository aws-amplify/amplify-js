// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import {
	AuthAction,
	assertTokenProviderConfig,
	fetchAuthSession,
} from '@aws-amplify/core/internals/utils';

import { getRegionFromUserPoolId } from '../../../../foundation/parsers';
import { assertAuthTokens } from '../../utils/types';
import { FetchUserAttributesOutput } from '../../types';
import { toAuthUserAttribute } from '../../utils/apiHelpers';
import { getAuthUserAgentValue } from '../../../../utils';
import { createGetUserClient } from '../../../../foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../../factories';

export const fetchUserAttributes = async (
	amplify: AmplifyClassV6,
): Promise<FetchUserAttributesOutput> => {
	const authConfig = amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);
	const { userPoolEndpoint, userPoolId } = authConfig;
	const { tokens } = await fetchAuthSession(amplify, {
		forceRefresh: false,
	});
	assertAuthTokens(tokens);
	const getUser = createGetUserClient({
		endpointResolver: createCognitoUserPoolEndpointResolver({
			endpointOverride: userPoolEndpoint,
		}),
	});
	const { UserAttributes } = await getUser(
		{
			region: getRegionFromUserPoolId(userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.FetchUserAttributes),
		},
		{
			AccessToken: tokens.accessToken.toString(),
		},
	);

	return toAuthUserAttribute(UserAttributes);
};
