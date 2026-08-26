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
	const mockGetLastAuthUser = jest.fn();
	const mockGetStoredIdToken = jest.fn();
	const mockClearTokensForUser = jest.fn();
	const mockRemoveSession = jest.fn();
	const mockClearActiveUser = jest.fn();
	const mockTokenStore = {
		getLastAuthUser: mockGetLastAuthUser,
		getStoredIdToken: mockGetStoredIdToken,
		clearTokensForUser: mockClearTokensForUser,
		removeSession: mockRemoveSession,
		clearActiveUser: mockClearActiveUser,
	};
	const mockStore = {
		clearOAuthData: jest.fn(),
	} as unknown as jest.Mocked<DefaultOAuthStore>;

	beforeEach(() => {
		mockTokenOrchestrator.getTokenStore.mockReturnValue(
			mockTokenStore as unknown as AuthTokenStore,
		);
		mockGetLastAuthUser.mockResolvedValue(activeUser.username);
		mockGetStoredIdToken.mockResolvedValue({
			payload: { sub: activeUser.userId },
		});
		mockClearTokensForUser.mockResolvedValue(undefined);
		mockRemoveSession.mockResolvedValue({ isEmpty: true });
		mockClearActiveUser.mockResolvedValue(undefined);
	});

	afterEach(() => {
		mockStore.clearOAuthData.mockClear();
		mockClearCredentials.mockClear();
		mockGetLastAuthUser.mockReset();
		mockGetStoredIdToken.mockReset();
		mockClearTokensForUser.mockReset();
		mockRemoveSession.mockReset();
		mockClearActiveUser.mockReset();
		mockDispatchSignOutBoundaryEvents.mockClear();
		mockTokenOrchestrator.getTokenStore.mockReset();
	});

	it('clears OAuth data, scopes token removal to the active user and clears the pointer', async () => {
		await completeOAuthSignOut(mockStore);

		expect(mockStore.clearOAuthData).toHaveBeenCalledTimes(1);
		// per-user scope: a blanket clearTokens() would orphan parked sessions.
		expect(mockTokenOrchestrator.clearTokens).not.toHaveBeenCalled();
		expect(mockClearTokensForUser).toHaveBeenCalledWith(activeUser.username);
		expect(mockRemoveSession).toHaveBeenCalledWith(activeUser.username);
		// no-promotion sign-out clears the active pointer explicitly.
		expect(mockClearActiveUser).toHaveBeenCalledTimes(1);
		expect(mockClearCredentials).toHaveBeenCalledTimes(1);
		// signedOut ALWAYS with resolvable user data; no promotion arg.
		expect(mockDispatchSignOutBoundaryEvents).toHaveBeenCalledWith(activeUser);
	});

	it('dispatches with no user data when the stored id token is unavailable', async () => {
		mockGetStoredIdToken.mockResolvedValue(undefined);

		await completeOAuthSignOut(mockStore);

		expect(mockGetLastAuthUser).toHaveBeenCalledTimes(1);
		expect(mockClearTokensForUser).toHaveBeenCalledWith(activeUser.username);
		expect(mockClearActiveUser).toHaveBeenCalledTimes(1);
		// no resolvable userId -> signedOutUser is undefined.
		expect(mockDispatchSignOutBoundaryEvents).toHaveBeenCalledWith(undefined);
	});
});
