// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { FetchMFAPreferenceResult } from '../types/results';
import { getMFAType, getMFATypes } from '../utils/signInHelpers';
import { GetUserException } from '../types/errors';
import { getUser } from '../utils/clients/CognitoIdentityProvider';
import {
	AmplifyV6,
	assertTokenProviderConfig,
} from '@aws-amplify/core';
import {fetchAuthSession} from '../../../'
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';

/**
 * Fetches the preferred MFA setting and enabled MFA settings for the user.
 * @throws  -{@link GetUserException} : error thrown when the service fails to fetch MFA preference
 * and settings.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 * 
 * @returns FetchMFAPreferenceResult
 */
export async function fetchMFAPreference(): Promise<FetchMFAPreferenceResult> {
	const authConfig = AmplifyV6.getConfig().Auth;
	assertTokenProviderConfig(authConfig);
	const {tokens} = await fetchAuthSession({ forceRefresh: false });
	const { PreferredMfaSetting, UserMFASettingList } = await getUser(
		{ region: getRegion(authConfig.userPoolId) },
		{
			AccessToken: tokens.accessToken.toString(),
		}
	);

	return {
		preferred: getMFAType(PreferredMfaSetting),
		enabled: getMFATypes(UserMFASettingList),
	};
}
