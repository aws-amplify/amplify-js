// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createAuthSessionSwitcher } from '../../../src/providers/cognito/tokenProvider/createAuthSessionSwitcher';
import { USER_NOT_SIGNED_IN_EXCEPTION } from '../../../src/errors/constants';

const mockGetAuthUserList = jest.fn();
const mockGetStoredIdToken = jest.fn();
const mockAddActiveSession = jest.fn();
const mockStore = {
	getAuthUserList: mockGetAuthUserList,
	getStoredIdToken: mockGetStoredIdToken,
	addActiveSession: mockAddActiveSession,
};

describe('createAuthSessionSwitcher', () => {
	beforeEach(() => {
		mockAddActiveSession.mockResolvedValue(undefined);
	});

	afterEach(() => {
		mockGetAuthUserList.mockReset();
		mockGetStoredIdToken.mockReset();
		mockAddActiveSession.mockReset();
	});

	it('listSessionUsernames delegates to the store roster read', async () => {
		mockGetAuthUserList.mockResolvedValue(['alice', 'bob']);
		const switcher = createAuthSessionSwitcher(mockStore);

		await expect(switcher.listSessionUsernames()).resolves.toEqual([
			'alice',
			'bob',
		]);
	});

	it('getStoredIdToken delegates to the store', async () => {
		const idToken = { payload: {}, toString: () => 'idToken' };
		mockGetStoredIdToken.mockResolvedValue(idToken);
		const switcher = createAuthSessionSwitcher(mockStore);

		await expect(switcher.getStoredIdToken('alice')).resolves.toBe(idToken);
		expect(mockGetStoredIdToken).toHaveBeenCalledWith('alice');
	});

	it('setActiveSession throws when the username is absent and does not reorder', async () => {
		mockGetAuthUserList.mockResolvedValue(['alice']);
		const switcher = createAuthSessionSwitcher(mockStore);

		await expect(switcher.setActiveSession('bob')).rejects.toMatchObject({
			name: USER_NOT_SIGNED_IN_EXCEPTION,
		});
		// Non-destructive: never adds a non-signed-in user.
		expect(mockAddActiveSession).not.toHaveBeenCalled();
	});

	it('setActiveSession reorders (non-destructively) when the username is present', async () => {
		mockGetAuthUserList.mockResolvedValue(['alice', 'bob']);
		const switcher = createAuthSessionSwitcher(mockStore);

		await switcher.setActiveSession('bob');

		expect(mockAddActiveSession).toHaveBeenCalledWith('bob');
		expect(mockAddActiveSession).toHaveBeenCalledTimes(1);
	});
});
