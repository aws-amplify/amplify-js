// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { FetchMFAPreferenceResult } from '../types/results';
import { getUserClient } from '../utils/clients/GetUserClient';
import { getMFAType, getMFATypes } from '../utils/signInHelpers';
import { GetUserException } from '../types/errors';

/**
 * Fetches the preferred MFA setting and enabled MFA settings for the user.
 * @throws  -{@link GetUserException} : error thrown when the service fails to fetch MFA preference
 * and settings.
 * @returns FetchMFAPreferenceResult
 */
export async function fetchMFAPreference(): Promise<FetchMFAPreferenceResult> {
	// TODO: replace mocked token when auth token provider is done
	const mockedAccessToken = 'mockedAccessToken';

	const { PreferredMfaSetting, UserMFASettingList } = await getUserClient({
		AccessToken: mockedAccessToken,
	});

	return {
		preferred: getMFAType(PreferredMfaSetting),
		enabled: getMFATypes(UserMFASettingList),
	};
}
