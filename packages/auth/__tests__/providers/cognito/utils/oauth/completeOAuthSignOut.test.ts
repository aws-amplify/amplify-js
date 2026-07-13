// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { clearCredentials } from '@aws-amplify/core';

import { tokenOrchestrator } from '../../../../../src/providers/cognito/tokenProvider/tokenProvider';
import { completeOAuthSignOut } from '../../../../../src/providers/cognito/utils/oauth/completeOAuthSignOut';
import { dispatchSignOutBoundaryEvents } from '../../../../../src/providers/cognito/utils/dispatchSignOutHubEvents';
import { DefaultOAuthStore } from '../../../../../src/providers/cognito/utils/signInWithRedirectStore';
import { AuthTokenStore } from '../../../../../src/providers/cognito/tokenProvider/types';

jest.mock('@aws-amplify/core', () => {
	return {
		...(jest.genMockFromModule('@aws-amplify/core') as object),
		// must do this as auth tests import `signInWithRedirect`
		Amplify: {
			getConfig: jest.fn().mockReturnValue({}),
		},
	};
});
jest.mock('../../../../../src/providers/cognito/tokenProvider/tokenProvider');
jest.mock(
	'../../../../../src/providers/cognito/utils/dispatchSignOutHubEvents',
);

describe('completeOAuthSignOut', () => {
	// assert mocks
	const mockClearCredentials = clearCredentials as jest.Mock;
	const mockTokenOrchestrator = tokenOrchestrator as jest.Mocked<
		typeof tokenOrchestrator
	>;
	const mockDispatchSignOutBoundaryEvents =
		dispatchSignOutBoundaryEvents as jest.Mock;

	// create mocks
	const activeUser = { username: 'user1', userId: 'user1-sub' };
	const mockLoadTokens = jest.fn();
	const mockGetLastAuthUser = jest.fn();
	const mockClearTokensForUser = jest.fn();
	const mockRemoveSession = jest.fn();
	const mockTokenStore = {
		loadTokens: mockLoadTokens,
		getLastAuthUser: mockGetLastAuthUser,
		clearTokensForUser: mockClearTokensForUser,
		removeSession: mockRemoveSession,
	};
	const mockStore = {
		clearOAuthData: jest.fn(),
	} as unknown as jest.Mocked<DefaultOAuthStore>;

	beforeEach(() => {
		mockTokenOrchestrator.getTokenStore.mockReturnValue(
			mockTokenStore as unknown as AuthTokenStore,
		);
		mockLoadTokens.mockResolvedValue({
			username: activeUser.username,
			idToken: { payload: { sub: activeUser.userId } },
		});
		mockGetLastAuthUser.mockResolvedValue(activeUser.username);
		mockClearTokensForUser.mockResolvedValue(undefined);
		mockRemoveSession.mockResolvedValue({
			newActiveUser: undefined,
			isEmpty: true,
		});
	});

	afterEach(() => {
		mockStore.clearOAuthData.mockClear();
		mockClearCredentials.mockClear();
		mockLoadTokens.mockReset();
		mockGetLastAuthUser.mockReset();
		mockClearTokensForUser.mockReset();
		mockRemoveSession.mockReset();
		mockDispatchSignOutBoundaryEvents.mockClear();
		mockTokenOrchestrator.getTokenStore.mockReset();
	});

	it('clears OAuth data and scopes token removal to the active user only', async () => {
		await completeOAuthSignOut(mockStore);

		expect(mockStore.clearOAuthData).toHaveBeenCalledTimes(1);
		// per-user scope: a blanket clearTokens() would orphan parked sessions.
		expect(mockTokenOrchestrator.clearTokens).not.toHaveBeenCalled();
		expect(mockClearTokensForUser).toHaveBeenCalledWith(activeUser.username);
		expect(mockRemoveSession).toHaveBeenCalledWith(activeUser.username);
		expect(mockClearCredentials).toHaveBeenCalledTimes(1);
		expect(mockDispatchSignOutBoundaryEvents).toHaveBeenCalledWith(
			mockTokenStore,
			activeUser,
			{
				newActiveUser: undefined,
				isEmpty: true,
			},
		);
	});

	it('falls back to getLastAuthUser when stored tokens are unavailable', async () => {
		mockLoadTokens.mockResolvedValue(null);

		await completeOAuthSignOut(mockStore);

		expect(mockGetLastAuthUser).toHaveBeenCalledTimes(1);
		expect(mockClearTokensForUser).toHaveBeenCalledWith(activeUser.username);
		// no resolvable userId -> signedOutUser is undefined.
		expect(mockDispatchSignOutBoundaryEvents).toHaveBeenCalledWith(
			mockTokenStore,
			undefined,
			{
				newActiveUser: undefined,
				isEmpty: true,
			},
		);
	});
});
