// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Hub } from '@aws-amplify/core';
import { AMPLIFY_SYMBOL } from '@aws-amplify/core/internals/utils';

import { dispatchSignOutBoundaryEvents } from '../../../../src/providers/cognito/utils/dispatchSignOutHubEvents';
import type { AuthTokenStore } from '../../../../src/providers/cognito/tokenProvider/types';

jest.mock('@aws-amplify/core', () => ({
	Hub: {
		dispatch: jest.fn(),
	},
}));
jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	AMPLIFY_SYMBOL: Symbol('AMPLIFY_SYMBOL'),
}));

const mockDispatch = Hub.dispatch as jest.Mock;
const mockGetStoredIdToken = jest.fn();

// The helper now RECEIVES the token store as a parameter (dependency injection)
// instead of importing the tokenProvider singleton, so tests pass a mock store.
const mockTokenStore = {
	getStoredIdToken: mockGetStoredIdToken,
} as unknown as AuthTokenStore;

const signedOutUser = { username: 'alice', userId: 'alice-sub' };

describe('dispatchSignOutBoundaryEvents()', () => {
	afterEach(() => {
		mockDispatch.mockClear();
		mockGetStoredIdToken.mockReset();
	});

	it('dispatches only signedOut (with signedOutUser data) when the roster empties', async () => {
		await dispatchSignOutBoundaryEvents(mockTokenStore, signedOutUser, {
			newActiveUser: undefined,
			isEmpty: true,
		});

		expect(mockDispatch).toHaveBeenNthCalledWith(
			1,
			'auth',
			{ event: 'userSignedOut', data: signedOutUser },
			'Auth',
			AMPLIFY_SYMBOL,
		);
		expect(mockDispatch).toHaveBeenNthCalledWith(
			2,
			'auth',
			{ event: 'signedOut', data: signedOutUser },
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

	it('omits userSignedOut when no active user was resolved but still emits signedOut', async () => {
		await dispatchSignOutBoundaryEvents(mockTokenStore, undefined, {
			newActiveUser: undefined,
			isEmpty: true,
		});

		expect(mockDispatch).not.toHaveBeenCalledWith(
			'auth',
			expect.objectContaining({ event: 'userSignedOut' }),
			'Auth',
			AMPLIFY_SYMBOL,
		);
		expect(mockDispatch).toHaveBeenCalledWith(
			'auth',
			{ event: 'signedOut', data: undefined },
			'Auth',
			AMPLIFY_SYMBOL,
		);
	});

	it('resolves the promoted user from the STORED id token for switchActiveUser', async () => {
		mockGetStoredIdToken.mockResolvedValue({ payload: { sub: 'bob-sub' } });

		await dispatchSignOutBoundaryEvents(mockTokenStore, signedOutUser, {
			newActiveUser: 'bob',
			isEmpty: false,
		});

		expect(mockGetStoredIdToken).toHaveBeenCalledWith('bob');
		expect(mockDispatch).toHaveBeenNthCalledWith(
			1,
			'auth',
			{ event: 'userSignedOut', data: signedOutUser },
			'Auth',
			AMPLIFY_SYMBOL,
		);
		expect(mockDispatch).toHaveBeenNthCalledWith(
			2,
			'auth',
			{
				event: 'switchActiveUser',
				data: { username: 'bob', userId: 'bob-sub' },
			},
			'Auth',
			AMPLIFY_SYMBOL,
		);
		expect(mockDispatch).not.toHaveBeenCalledWith(
			'auth',
			expect.objectContaining({ event: 'signedOut' }),
			'Auth',
			AMPLIFY_SYMBOL,
		);
	});

	it('skips switchActiveUser dispatch when the promoted id token is unavailable', async () => {
		mockGetStoredIdToken.mockResolvedValue(undefined);

		await dispatchSignOutBoundaryEvents(mockTokenStore, undefined, {
			newActiveUser: 'bob',
			isEmpty: false,
		});

		expect(mockDispatch).not.toHaveBeenCalledWith(
			'auth',
			expect.objectContaining({ event: 'switchActiveUser' }),
			'Auth',
			AMPLIFY_SYMBOL,
		);
	});
});
