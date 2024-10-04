// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import {
	AuthAction,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';

import { FetchMFAPreferenceOutput } from '../types';
import { getMFAType, getMFATypes } from '../utils/signInHelpers';
import { GetUserException } from '../types/errors';
import { getRegionFromUserPoolId } from '../../../foundation/parsers';
import { assertAuthTokens } from '../utils/types';
import { getAuthUserAgentValue } from '../../../utils';
import { createGetUserClient } from '../../../foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../factories';

/**
 * Fetches the preferred MFA setting and enabled MFA settings for the user.
 *
 * @returns FetchMFAPreferenceOutput
 * @throws  -{@link GetUserException} : error thrown when the service fails to fetch MFA preference
 * and settings.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function fetchMFAPreference(): Promise<FetchMFAPreferenceOutput> {
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);
	const { userPoolEndpoint, userPoolId } = authConfig;
	const { tokens } = await fetchAuthSession({ forceRefresh: false });
	assertAuthTokens(tokens);
	const getUser = createGetUserClient({
		endpointResolver: createCognitoUserPoolEndpointResolver({
			endpointOverride: userPoolEndpoint,
		}),
	});
	const { PreferredMfaSetting, UserMFASettingList } = await getUser(
		{
			region: getRegionFromUserPoolId(userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.FetchMFAPreference),
		},
		{
			AccessToken: tokens.accessToken.toString(),
		},
	);

	return {
		preferred: getMFAType(PreferredMfaSetting),
		enabled: getMFATypes(UserMFASettingList),
	};
}
