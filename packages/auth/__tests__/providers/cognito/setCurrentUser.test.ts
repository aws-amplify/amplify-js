// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Hub, clearCredentials } from '@aws-amplify/core';
import { AMPLIFY_SYMBOL } from '@aws-amplify/core/internals/utils';

import { setCurrentUser } from '../../../src/providers/cognito/apis/setCurrentUser';
import { tokenOrchestrator } from '../../../src/providers/cognito/tokenProvider';
import { AuthTokenStore } from '../../../src/providers/cognito/tokenProvider/types';
import { USER_NOT_SIGNED_IN_EXCEPTION } from '../../../src/errors/constants';

jest.mock('@aws-amplify/core', () => ({
	Hub: {
		dispatch: jest.fn(),
	},
	clearCredentials: jest.fn(),
}));
jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	AMPLIFY_SYMBOL: Symbol('AMPLIFY_SYMBOL'),
}));
jest.mock('../../../src/providers/cognito/tokenProvider');

const mockTokenOrchestrator = tokenOrchestrator as jest.Mocked<
	typeof tokenOrchestrator
>;
const mockClearCredentials = clearCredentials as jest.Mock;
const mockDispatch = Hub.dispatch as jest.Mock;
const mockGetAuthUserList = jest.fn();
const mockAddActiveSession = jest.fn();
const mockGetStoredIdToken = jest.fn();
const mockTokenStore = {
	getAuthUserList: mockGetAuthUserList,
	addActiveSession: mockAddActiveSession,
	getStoredIdToken: mockGetStoredIdToken,
};

describe('setCurrentUser', () => {
	beforeEach(() => {
		mockTokenOrchestrator.getTokenStore.mockReturnValue(
			mockTokenStore as unknown as AuthTokenStore,
		);
		mockAddActiveSession.mockResolvedValue(undefined);
		mockClearCredentials.mockResolvedValue(undefined);
	});

	afterEach(() => {
		mockGetAuthUserList.mockReset();
		mockAddActiveSession.mockReset();
		mockClearCredentials.mockReset();
		mockGetStoredIdToken.mockReset();
		mockDispatch.mockClear();
		mockTokenOrchestrator.getTokenStore.mockReset();
	});

	it('throws when the target username has no session in the roster', async () => {
		mockGetAuthUserList.mockResolvedValue(['alice']);

		await expect(setCurrentUser('bob')).rejects.toMatchObject({
			name: USER_NOT_SIGNED_IN_EXCEPTION,
		});

		expect(mockAddActiveSession).not.toHaveBeenCalled();
		expect(mockClearCredentials).not.toHaveBeenCalled();
		expect(mockDispatch).not.toHaveBeenCalled();
	});

	it('is a no-op when the target user is already active', async () => {
		mockGetAuthUserList.mockResolvedValue(['bob', 'alice']);

		await setCurrentUser('bob');

		expect(mockAddActiveSession).not.toHaveBeenCalled();
		expect(mockClearCredentials).not.toHaveBeenCalled();
		expect(mockDispatch).not.toHaveBeenCalled();
	});

	it('reorders the roster, clears credentials, and dispatches switchActiveUser', async () => {
		mockGetAuthUserList.mockResolvedValue(['alice', 'bob']);
		mockGetStoredIdToken.mockResolvedValue({
			payload: { sub: 'bob-id' },
		});

		await setCurrentUser('bob');

		// promotes the target to the front of the roster.
		expect(mockAddActiveSession).toHaveBeenCalledWith('bob');
		// busts the previous active user's identity-pool credentials.
		expect(mockClearCredentials).toHaveBeenCalledTimes(1);
		// resolves from stored id token, not getCurrentUser.
		expect(mockGetStoredIdToken).toHaveBeenCalledWith('bob');
		// switchActiveUser fires when the active pointer moves between users.
		expect(mockDispatch).toHaveBeenCalledWith(
			'auth',
			{
				event: 'switchActiveUser',
				data: { username: 'bob', userId: 'bob-id' },
			},
			'Auth',
			AMPLIFY_SYMBOL,
		);
	});

	it('skips dispatch when the stored id token has no sub claim', async () => {
		mockGetAuthUserList.mockResolvedValue(['alice', 'bob']);
		mockGetStoredIdToken.mockResolvedValue(undefined);

		await setCurrentUser('bob');

		expect(mockAddActiveSession).toHaveBeenCalledWith('bob');
		expect(mockClearCredentials).toHaveBeenCalledTimes(1);
		// No dispatch when userId can't be resolved.
		expect(mockDispatch).not.toHaveBeenCalled();
	});
});
