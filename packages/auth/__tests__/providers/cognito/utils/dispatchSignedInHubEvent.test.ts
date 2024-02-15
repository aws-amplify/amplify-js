// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Hub } from '@aws-amplify/core';
import { AMPLIFY_SYMBOL } from '@aws-amplify/core/internals/utils';
import { dispatchSignedInHubEvent } from '../../../../src/providers/cognito/utils/dispatchSignedInHubEvent';
import { getCurrentUser } from '../../../../src/providers/cognito/apis/getCurrentUser';
import { assertAuthTokens } from '../../../../src/providers/cognito/utils/types';
import { UNEXPECTED_SIGN_IN_INTERRUPTION_EXCEPTION } from '../../../../src/errors/constants';

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

const mockGetCurrentUser = getCurrentUser as jest.Mock;
const mockDispatch = Hub.dispatch as jest.Mock;

describe('dispatchSignedInHubEvent()', () => {
	it('dispatches Hub event `signedIn` with `getCurrentUser()` returned data', async () => {
		const mockGetCurrentUserPayload = {
			username: 'hello',
			userId: 'userId',
		};
		mockGetCurrentUser.mockResolvedValueOnce(mockGetCurrentUserPayload);

		await dispatchSignedInHubEvent();

		expect(mockDispatch).toHaveBeenCalledWith(
			'auth',
			{
				event: 'signedIn',
				data: mockGetCurrentUserPayload,
			},
			'Auth',
			AMPLIFY_SYMBOL,
		);
	});

	it('throws error when `getCurrentUser()` throws `USER_UNAUTHENTICATED_EXCEPTION`', () => {
		mockGetCurrentUser.mockImplementationOnce(() => {
			assertAuthTokens(null);
		});

		expect(() => dispatchSignedInHubEvent()).rejects.toThrow(
			'Could not get user session right after signing in successfully.',
		);
	});

	it('rethrows error if the error is not handled by itself', () => {
		const mockError = new Error('some other error');

		mockGetCurrentUser.mockImplementationOnce(() => {
			throw mockError;
		});

		expect(() => dispatchSignedInHubEvent()).rejects.toThrow(mockError);
	});
});
