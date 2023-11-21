// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { FetchMFAPreferenceOutput } from '~/src/providers/cognito/types';
import {
	getMFAType,
	getMFATypes,
} from '~/src/providers/cognito/utils/signInHelpers';
import { GetUserException } from '~/src/providers/cognito/types/errors';
import { getUser } from '~/src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import {
	AuthAction,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';
import { getRegion } from '~/src/providers/cognito/utils/clients/CognitoIdentityProvider/utils';
import { assertAuthTokens } from '~/src/providers/cognito/utils/types';
import { getAuthUserAgentValue } from '~/src/utils';

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
	const { tokens } = await fetchAuthSession({ forceRefresh: false });
	assertAuthTokens(tokens);
	const { PreferredMfaSetting, UserMFASettingList } = await getUser(
		{
			region: getRegion(authConfig.userPoolId),
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
