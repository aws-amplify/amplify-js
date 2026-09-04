// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Hub } from '@aws-amplify/core';
import { getAmplifyServerContext } from '@aws-amplify/core/internals/adapter-core';

import { setCurrentUser } from '../../../../src/providers/cognito/apis/server/setCurrentUser';
import { USER_NOT_SIGNED_IN_EXCEPTION } from '../../../../src/errors/constants';
import { AuthError } from '../../../../src/errors/AuthError';

jest.mock('@aws-amplify/core/internals/adapter-core');
jest.mock('@aws-amplify/core', () => ({
	...jest.requireActual('@aws-amplify/core'),
	Hub: { dispatch: jest.fn() },
}));

const mockGetAmplifyServerContext = jest.mocked(getAmplifyServerContext);
const mockDispatch = Hub.dispatch as jest.Mock;
const mockSetActiveSession = jest.fn();
const mockClearCredentials = jest.fn();
const mockSwitcher = {
	listSessionUsernames: jest.fn(),
	getStoredIdToken: jest.fn(),
	setActiveSession: mockSetActiveSession,
};
const mockGetTokenProvider = jest.fn();
const mockContextSpec = { token: { value: Symbol('test') } } as any;

describe('server-side setCurrentUser', () => {
	beforeEach(() => {
		mockSetActiveSession.mockResolvedValue(undefined);
		mockClearCredentials.mockResolvedValue(undefined);
		mockGetTokenProvider.mockReturnValue({
			getTokens: jest.fn(),
			getSessionSwitcher: () => mockSwitcher,
		});
		mockGetAmplifyServerContext.mockReturnValue({
			amplify: {
				Auth: {
					getTokenProvider: mockGetTokenProvider,
					clearCredentials: mockClearCredentials,
				},
			},
		} as any);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('switches the active session and clears context-scoped credentials', async () => {
		await setCurrentUser(mockContextSpec, 'bob');

		expect(mockSetActiveSession).toHaveBeenCalledWith('bob');
		expect(mockClearCredentials).toHaveBeenCalledTimes(1);
	});

	it('does NOT dispatch a Hub event', async () => {
		await setCurrentUser(mockContextSpec, 'bob');

		expect(mockDispatch).not.toHaveBeenCalled();
	});

	it('propagates the switcher error and does not clear credentials when absent', async () => {
		mockSetActiveSession.mockRejectedValue(
			new AuthError({
				name: USER_NOT_SIGNED_IN_EXCEPTION,
				message: 'no session',
			}),
		);

		await expect(
			setCurrentUser(mockContextSpec, 'ghost'),
		).rejects.toMatchObject({ name: USER_NOT_SIGNED_IN_EXCEPTION });
		expect(mockClearCredentials).not.toHaveBeenCalled();
	});
});
