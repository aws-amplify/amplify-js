// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { completeOAuthSignOut } from '../../../../../src/providers/cognito/utils/oauth/completeOAuthSignOut';
import { handleOAuthSignOut } from '../../../../../src/providers/cognito/utils/oauth/handleOAuthSignOut.native';
import { oAuthSignOutRedirect } from '../../../../../src/providers/cognito/utils/oauth/oAuthSignOutRedirect';
import { DefaultOAuthStore } from '../../../../../src/providers/cognito/utils/signInWithRedirectStore';

jest.mock(
	'../../../../../src/providers/cognito/utils/oauth/completeOAuthSignOut',
);
jest.mock(
	'../../../../../src/providers/cognito/utils/oauth/oAuthSignOutRedirect',
);

describe('handleOAuthSignOut (native)', () => {
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

	describe('when preferPrivateSession is false', () => {
		beforeEach(() => {
			mockStore.loadOAuthSignIn.mockResolvedValue({
				isOAuthSignIn: true,
				preferPrivateSession: false,
			});
		});
		it('should complete OAuth sign out and redirect', async () => {
			mockOAuthSignOutRedirect.mockResolvedValue({ type: 'success' });
			await handleOAuthSignOut(cognitoConfig, mockStore);

			expect(mockOAuthSignOutRedirect).toHaveBeenCalledWith(
				cognitoConfig,
				false,
				undefined,
			);
			expect(mockCompleteOAuthSignOut).toHaveBeenCalledWith(mockStore);
		});

		it('should not complete OAuth sign out if redirect is canceled', async () => {
			mockOAuthSignOutRedirect.mockResolvedValue({ type: 'canceled' });
			await handleOAuthSignOut(cognitoConfig, mockStore);

			expect(mockOAuthSignOutRedirect).toHaveBeenCalledWith(
				cognitoConfig,
				false,
				undefined,
			);
			expect(mockCompleteOAuthSignOut).not.toHaveBeenCalled();
		});

		it('should not complete OAuth sign out if redirect failed', async () => {
			mockOAuthSignOutRedirect.mockResolvedValue({ type: 'error' });
			await handleOAuthSignOut(cognitoConfig, mockStore);

			expect(mockOAuthSignOutRedirect).toHaveBeenCalledWith(
				cognitoConfig,
				false,
				undefined,
			);
			expect(mockCompleteOAuthSignOut).not.toHaveBeenCalled();
		});
	});

	it('should always complete OAuth sign out and redirect when preferPrivateSession is true', async () => {
		mockStore.loadOAuthSignIn.mockResolvedValue({
			isOAuthSignIn: true,
			preferPrivateSession: true,
		});
		mockOAuthSignOutRedirect.mockResolvedValue({ type: 'error' });
		await handleOAuthSignOut(cognitoConfig, mockStore, undefined);

		expect(mockOAuthSignOutRedirect).toHaveBeenCalledWith(
			cognitoConfig,
			true,
			undefined,
		);
		expect(mockCompleteOAuthSignOut).toHaveBeenCalledWith(mockStore);
	});

	it('should complete OAuth sign out but not redirect', async () => {
		mockStore.loadOAuthSignIn.mockResolvedValue({
			isOAuthSignIn: false,
			preferPrivateSession: false,
		});
		await handleOAuthSignOut(cognitoConfig, mockStore);

		expect(mockOAuthSignOutRedirect).not.toHaveBeenCalled();
		expect(mockCompleteOAuthSignOut).toHaveBeenCalledWith(mockStore);
	});
});
