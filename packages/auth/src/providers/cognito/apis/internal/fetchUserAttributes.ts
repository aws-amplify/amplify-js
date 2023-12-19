// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import {
	AuthAction,
	assertTokenProviderConfig,
	fetchAuthSession,
} from '@aws-amplify/core/internals/utils';
import { getUser } from '../../utils/clients/CognitoIdentityProvider';
import { getRegion } from '../../utils/clients/CognitoIdentityProvider/utils';
import { assertAuthTokens } from '../../utils/types';
import { FetchUserAttributesOutput } from '../../types';
import { toAuthUserAttribute } from '../../utils/apiHelpers';
import { getAuthUserAgentValue } from '../../../../utils';

export const fetchUserAttributes = async (
	amplify: AmplifyClassV6
): Promise<FetchUserAttributesOutput> => {
	const authConfig = amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);
	const { tokens } = await fetchAuthSession(amplify, {
		forceRefresh: false,
	});
	assertAuthTokens(tokens);

	const { UserAttributes } = await getUser(
		{
			region: getRegion(authConfig.userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.FetchUserAttributes),
		},
		{
			AccessToken: tokens.accessToken.toString(),
		}
	);

	return toAuthUserAttribute(UserAttributes);
};
