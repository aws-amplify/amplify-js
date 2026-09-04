// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Hub } from '@aws-amplify/core';
import { AMPLIFY_SYMBOL } from '@aws-amplify/core/internals/utils';

import { dispatchSignOutBoundaryEvents } from '../../../../src/providers/cognito/utils/dispatchSignOutHubEvents';

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

const signedOutUser = { username: 'alice', userId: 'alice-sub' };

describe('dispatchSignOutBoundaryEvents()', () => {
	afterEach(() => {
		mockDispatch.mockClear();
	});

	it('dispatches userSignedOut then signedOut (both with data) for a resolvable user', async () => {
		await dispatchSignOutBoundaryEvents(signedOutUser);

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
	});

	it('never dispatches switchActiveUser (no-promotion model)', async () => {
		await dispatchSignOutBoundaryEvents(signedOutUser);

		expect(mockDispatch).not.toHaveBeenCalledWith(
			'auth',
			expect.objectContaining({ event: 'switchActiveUser' }),
			'Auth',
			AMPLIFY_SYMBOL,
		);
	});

	it('omits userSignedOut when no active user was resolved but still emits signedOut', async () => {
		await dispatchSignOutBoundaryEvents(undefined);

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

	it('always emits signedOut even when parked sessions remain (no promotion)', async () => {
		// The roster may still hold parked users; signOut only clears the pointer,
		// so signedOut fires unconditionally and switchActiveUser never does.
		await dispatchSignOutBoundaryEvents(signedOutUser);

		expect(mockDispatch).toHaveBeenCalledWith(
			'auth',
			{ event: 'signedOut', data: signedOutUser },
			'Auth',
			AMPLIFY_SYMBOL,
		);
		expect(mockDispatch).toHaveBeenCalledTimes(2);
	});
});
