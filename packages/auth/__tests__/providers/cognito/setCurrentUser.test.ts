// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Hub, clearCredentials } from '@aws-amplify/core';
import { AMPLIFY_SYMBOL } from '@aws-amplify/core/internals/utils';

import { setCurrentUser } from '../../../src/providers/cognito/apis/setCurrentUser';
import { getCurrentUser } from '../../../src/providers/cognito/apis/internal/getCurrentUser';
import { tokenOrchestrator } from '../../../src/providers/cognito/tokenProvider';
import { AuthTokenStore } from '../../../src/providers/cognito/tokenProvider/types';
import { USER_NOT_SIGNED_IN_EXCEPTION } from '../../../src/errors/constants';

jest.mock('@aws-amplify/core', () => ({
	Amplify: {},
	Hub: {
		dispatch: jest.fn(),
	},
	clearCredentials: jest.fn(),
}));
jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	AMPLIFY_SYMBOL: Symbol('AMPLIFY_SYMBOL'),
}));
jest.mock('../../../src/providers/cognito/apis/internal/getCurrentUser');
jest.mock('../../../src/providers/cognito/tokenProvider');

const mockTokenOrchestrator = tokenOrchestrator as jest.Mocked<
	typeof tokenOrchestrator
>;
const mockGetCurrentUser = getCurrentUser as jest.Mock;
const mockClearCredentials = clearCredentials as jest.Mock;
const mockDispatch = Hub.dispatch as jest.Mock;
const mockGetAuthUserList = jest.fn();
const mockAddActiveSession = jest.fn();
const mockTokenStore = {
	getAuthUserList: mockGetAuthUserList,
	addActiveSession: mockAddActiveSession,
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
		mockGetCurrentUser.mockReset();
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
		mockGetCurrentUser.mockResolvedValue({
			username: 'bob',
			userId: 'bob-id',
		});

		await setCurrentUser('bob');

		// promotes the target to the front of the roster.
		expect(mockAddActiveSession).toHaveBeenCalledWith('bob');
		// busts the previous active user's identity-pool credentials.
		expect(mockClearCredentials).toHaveBeenCalledTimes(1);
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
});
