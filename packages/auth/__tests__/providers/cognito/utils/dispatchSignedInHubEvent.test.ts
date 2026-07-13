// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Hub } from '@aws-amplify/core';
import { AMPLIFY_SYMBOL } from '@aws-amplify/core/internals/utils';

import {
	ERROR_MESSAGE,
	dispatchSignedInHubEvent,
} from '../../../../src/providers/cognito/utils/dispatchSignedInHubEvent';
import { getCurrentUser } from '../../../../src/providers/cognito/apis/getCurrentUser';
import { assertAuthTokens } from '../../../../src/providers/cognito/utils/types';
import type { AuthTokenStore } from '../../../../src/providers/cognito/tokenProvider/types';

// mock names are prefixed with `mock` so jest allows referencing them inside
// the hoisted factory below.
const mockGetAuthUserList = jest.fn();
const mockAddActiveSession = jest.fn();

jest.mock('../../../../src/providers/cognito/apis/getCurrentUser', () => ({
	getCurrentUser: jest.fn(),
}));
jest.mock('@aws-amplify/core', () => ({
	Hub: {
		dispatch: jest.fn(),
	},
}));
jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	AMPLIFY_SYMBOL: Symbol('AMPLIFY_SYMBOL'),
}));

// The helper now RECEIVES the token store as a parameter (dependency injection)
// instead of importing the tokenProvider singleton, so tests pass a mock store.
const mockTokenStore = {
	getAuthUserList: mockGetAuthUserList,
	addActiveSession: mockAddActiveSession,
} as unknown as AuthTokenStore;

const mockGetCurrentUser = getCurrentUser as jest.Mock;
const mockDispatch = Hub.dispatch as jest.Mock;

const mockGetCurrentUserPayload = {
	username: 'hello',
	userId: 'userId',
};

describe('dispatchSignedInHubEvent()', () => {
	beforeEach(() => {
		// default: roster starts empty and addActiveSession succeeds.
		mockGetAuthUserList.mockResolvedValue([]);
		mockAddActiveSession.mockResolvedValue(undefined);
		mockGetCurrentUser.mockResolvedValue(mockGetCurrentUserPayload);
	});

	afterEach(() => {
		mockGetAuthUserList.mockReset();
		mockAddActiveSession.mockReset();
		mockGetCurrentUser.mockReset();
		mockDispatch.mockClear();
	});

	it('adds the signed-in user to the roster as the active session', async () => {
		await dispatchSignedInHubEvent(mockTokenStore, 'hello');

		expect(mockAddActiveSession).toHaveBeenCalledWith('hello');
	});

	it('dispatches `userSignedIn` with `getCurrentUser()` returned data', async () => {
		await dispatchSignedInHubEvent(mockTokenStore, 'hello');

		expect(mockDispatch).toHaveBeenCalledWith(
			'auth',
			{
				event: 'userSignedIn',
				data: mockGetCurrentUserPayload,
			},
			'Auth',
			AMPLIFY_SYMBOL,
		);
	});

	it('dispatches `signedIn` on first sign-in from an empty roster', async () => {
		// roster empty before the new session is added.
		mockGetAuthUserList.mockResolvedValueOnce([]);

		await dispatchSignedInHubEvent(mockTokenStore, 'hello');

		// userSignedIn tracks membership, signedIn marks the empty->non-empty boundary.
		expect(mockDispatch).toHaveBeenNthCalledWith(
			1,
			'auth',
			{ event: 'userSignedIn', data: mockGetCurrentUserPayload },
			'Auth',
			AMPLIFY_SYMBOL,
		);
		expect(mockDispatch).toHaveBeenNthCalledWith(
			2,
			'auth',
			{ event: 'signedIn', data: mockGetCurrentUserPayload },
			'Auth',
			AMPLIFY_SYMBOL,
		);
		expect(mockDispatch).not.toHaveBeenCalledWith(
			'auth',
			expect.objectContaining({ event: 'switchActiveUser' }),
			'Auth',
			AMPLIFY_SYMBOL,
		);
	});

	it('dispatches `switchActiveUser` (not `signedIn`) when a user is already active', async () => {
		// roster already has an active user before the new session is added.
		mockGetAuthUserList.mockResolvedValueOnce(['existing']);

		await dispatchSignedInHubEvent(mockTokenStore, 'hello');

		expect(mockDispatch).toHaveBeenNthCalledWith(
			1,
			'auth',
			{ event: 'userSignedIn', data: mockGetCurrentUserPayload },
			'Auth',
			AMPLIFY_SYMBOL,
		);
		expect(mockDispatch).toHaveBeenNthCalledWith(
			2,
			'auth',
			{ event: 'switchActiveUser', data: mockGetCurrentUserPayload },
			'Auth',
			AMPLIFY_SYMBOL,
		);
		expect(mockDispatch).not.toHaveBeenCalledWith(
			'auth',
			expect.objectContaining({ event: 'signedIn' }),
			'Auth',
			AMPLIFY_SYMBOL,
		);
	});

	it('dispatches `userSignedIn` only (no `signedIn`/`switchActiveUser`) when the active user re-authenticates', async () => {
		// the signing-in user is already the active roster head.
		mockGetAuthUserList.mockResolvedValueOnce(['hello']);
		mockGetCurrentUser.mockResolvedValue({
			username: 'hello',
			userId: 'userId',
		});

		await dispatchSignedInHubEvent(mockTokenStore, 'hello');

		expect(mockDispatch).toHaveBeenCalledTimes(1);
		expect(mockDispatch).toHaveBeenCalledWith(
			'auth',
			{ event: 'userSignedIn', data: { username: 'hello', userId: 'userId' } },
			'Auth',
			AMPLIFY_SYMBOL,
		);
		expect(mockDispatch).not.toHaveBeenCalledWith(
			'auth',
			expect.objectContaining({ event: 'signedIn' }),
			'Auth',
			AMPLIFY_SYMBOL,
		);
		expect(mockDispatch).not.toHaveBeenCalledWith(
			'auth',
			expect.objectContaining({ event: 'switchActiveUser' }),
			'Auth',
			AMPLIFY_SYMBOL,
		);
	});

	it('throws error when `getCurrentUser()` throws `USER_UNAUTHENTICATED_EXCEPTION`', () => {
		mockGetCurrentUser.mockImplementationOnce(() => {
			assertAuthTokens(null);
		});

		expect(() =>
			dispatchSignedInHubEvent(mockTokenStore, 'hello'),
		).rejects.toThrow(ERROR_MESSAGE);
	});

	it('rethrows error if the error is not handled by itself', () => {
		const mockError = new Error('some other error');

		mockGetCurrentUser.mockImplementationOnce(() => {
			throw mockError;
		});

		expect(() =>
			dispatchSignedInHubEvent(mockTokenStore, 'hello'),
		).rejects.toThrow(mockError);
	});
});
