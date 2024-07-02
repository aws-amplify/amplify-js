// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { completeOAuthSignOut } from '../../../../../src/providers/cognito/utils/oauth/completeOAuthSignOut';
import { handleOAuthSignOut } from '../../../../../src/providers/cognito/utils/oauth/handleOAuthSignOut';
import { oAuthSignOutRedirect } from '../../../../../src/providers/cognito/utils/oauth/oAuthSignOutRedirect';
import { DefaultOAuthStore } from '../../../../../src/providers/cognito/utils/signInWithRedirectStore';

jest.mock(
	'../../../../../src/providers/cognito/utils/oauth/completeOAuthSignOut',
);
jest.mock(
	'../../../../../src/providers/cognito/utils/oauth/oAuthSignOutRedirect',
);

describe('handleOAuthSignOut', () => {
	const region = 'us-west-2';
	const cognitoConfig = {
		userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
		userPoolId: `${region}_zzzzz`,
		identityPoolId: `${region}:xxxxxx`,
	};
	// assert mocks
	const mockCompleteOAuthSignOut = completeOAuthSignOut as jest.Mock;
	const mockOAuthSignOutRedirect = oAuthSignOutRedirect as jest.Mock;
	// create mocks
	const mockStore = {
		loadOAuthSignIn: jest.fn(),
	} as unknown as jest.Mocked<DefaultOAuthStore>;

	afterEach(() => {
		mockStore.loadOAuthSignIn.mockReset();
		mockCompleteOAuthSignOut.mockClear();
		mockOAuthSignOutRedirect.mockClear();
	});

	it('should complete OAuth sign out and redirect', async () => {
		mockStore.loadOAuthSignIn.mockResolvedValue({
			isOAuthSignIn: true,
			preferPrivateSession: false,
		});
		await handleOAuthSignOut(cognitoConfig, mockStore);

		expect(mockCompleteOAuthSignOut).toHaveBeenCalledWith(mockStore);
		expect(mockOAuthSignOutRedirect).toHaveBeenCalledWith(
			cognitoConfig,
			false,
			undefined,
		);
	});

	it('should complete OAuth sign out but not redirect', async () => {
		mockStore.loadOAuthSignIn.mockResolvedValue({
			isOAuthSignIn: false,
			preferPrivateSession: false,
		});
		await handleOAuthSignOut(cognitoConfig, mockStore);

		expect(mockCompleteOAuthSignOut).toHaveBeenCalledWith(mockStore);
		expect(mockOAuthSignOutRedirect).not.toHaveBeenCalled();
	});
});
