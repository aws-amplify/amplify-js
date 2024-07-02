// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { oAuthSignOutRedirect } from '../../../../../src/providers/cognito/utils/oauth/oAuthSignOutRedirect';
import { getRedirectUrl } from '../../../../../src/providers/cognito/utils/oauth/getRedirectUrl';
import { openAuthSession } from '../../../../../src/utils';

jest.mock('../../../../../src/providers/cognito/utils/oauth/getRedirectUrl');
jest.mock('../../../../../src/utils');

describe('oAuthSignOutRedirect', () => {
	const userPoolClientId = '111111-aaaaa-42d8-891d-ee81a1549398';
	const domain = 'hosted-ui.test';
	const signOutRedirectUrl = 'https://myapp.test/completeSignOut/';
	const encodedSignOutRedirectUrl =
		'https%3A%2F%2Fmyapp.test%2FcompleteSignOut%2F';
	const region = 'us-west-2';
	const authConfig = {
		userPoolClientId,
		userPoolId: `${region}_zzzzz`,
		identityPoolId: `${region}:xxxxxx`,
		loginWith: {
			oauth: {
				domain,
				redirectSignIn: ['https://myapp.test/completeSignIn/'],
				redirectSignOut: [signOutRedirectUrl],
				responseType: 'code' as const, // assert string union instead of string type
				scopes: [],
			},
		},
	};
	// assert mocks
	const mockGetRedirectUrl = getRedirectUrl as jest.Mock;
	const mockOpenAuthSession = openAuthSession as jest.Mock;

	beforeAll(() => {
		mockGetRedirectUrl.mockReturnValue(signOutRedirectUrl);
	});

	afterEach(() => {
		mockGetRedirectUrl.mockClear();
		mockOpenAuthSession.mockClear();
	});

	it('should construct the OAuth logout endpoint and open an auth session to it', async () => {
		await oAuthSignOutRedirect(authConfig);

		expect(mockGetRedirectUrl).toHaveBeenCalledWith(
			authConfig.loginWith.oauth.redirectSignOut,
			undefined,
		);
		expect(mockOpenAuthSession).toHaveBeenCalledWith(
			`https://${domain}/logout?client_id=${userPoolClientId}&logout_uri=${encodedSignOutRedirectUrl}`,
			authConfig.loginWith.oauth.redirectSignOut,
			false,
		);
	});

	it('should allow preferPrivateSession to be set', async () => {
		await oAuthSignOutRedirect(authConfig, true);

		expect(mockOpenAuthSession).toHaveBeenCalledWith(
			`https://${domain}/logout?client_id=${userPoolClientId}&logout_uri=${encodedSignOutRedirectUrl}`,
			authConfig.loginWith.oauth.redirectSignOut,
			true,
		);
	});
});
