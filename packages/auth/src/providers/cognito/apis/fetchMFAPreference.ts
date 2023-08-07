// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { FetchMFAPreferenceResult } from '../types/results';
import { getMFAType, getMFATypes } from '../utils/signInHelpers';
import { GetUserException } from '../types/errors';
import { getUser } from '../utils/clients/CognitoIdentityProvider';
import { AmplifyV6 } from '@aws-amplify/core';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';

/**
 * Fetches the preferred MFA setting and enabled MFA settings for the user.
 * @throws  -{@link GetUserException} : error thrown when the service fails to fetch MFA preference
 * and settings.
 * @returns FetchMFAPreferenceResult
 */
export async function fetchMFAPreference(): Promise<FetchMFAPreferenceResult> {
	const { userPoolId } = AmplifyV6.getConfig().Auth;
	// TODO: replace mocked token when auth token provider is done
	const mockedAccessToken = 'mockedAccessToken';

	const { PreferredMfaSetting, UserMFASettingList } = await getUser(
		{ region: getRegion(userPoolId) },
		{
			AccessToken: mockedAccessToken,
		}
	);

	return {
		preferred: getMFAType(PreferredMfaSetting),
		enabled: getMFATypes(UserMFASettingList),
	};
}
