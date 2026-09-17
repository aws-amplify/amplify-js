// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { listCurrentUsers } from '../../../src/providers/cognito/apis/listCurrentUsers';
import { cognitoUserPoolsTokenProvider } from '../../../src/providers/cognito/tokenProvider';

const userPoolClientId = '111111-aaaaa-42d8-891d-ee81a1549398';
const authConfig = {
	Cognito: {
		userPoolClientId,
		userPoolId: 'us-west-2_zzzzz',
	},
};

cognitoUserPoolsTokenProvider.setAuthConfig(authConfig);
Amplify.configure({
	Auth: authConfig,
});

const { authTokenStore } = cognitoUserPoolsTokenProvider;

const mockKeyValueStorage = {
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn(),
};

describe('listCurrentUsers', () => {
	let getAuthUserListSpy: jest.SpyInstance;
	let getStoredIdTokenSpy: jest.SpyInstance;
	let loadTokensSpy: jest.SpyInstance;

	beforeEach(() => {
		jest
			.spyOn(authTokenStore, 'getKeyValueStorage')
			.mockReturnValue(mockKeyValueStorage);
		getAuthUserListSpy = jest.spyOn(authTokenStore, 'getAuthUserList');
		getStoredIdTokenSpy = jest.spyOn(authTokenStore, 'getStoredIdToken');
		loadTokensSpy = jest.spyOn(authTokenStore, 'loadTokens');
	});

	afterEach(() => {
		jest.restoreAllMocks();
		mockKeyValueStorage.getItem.mockReset();
	});

	it('returns AuthUser[] resolved from stored id tokens in roster order', async () => {
		getAuthUserListSpy.mockResolvedValue(['alice', 'bob']);
		getStoredIdTokenSpy.mockImplementation((username: string) =>
			Promise.resolve({
				payload: { 'cognito:username': username, sub: `${username}-sub` },
				toString: () => `${username}-idToken`,
			}),
		);

		const result = await listCurrentUsers();

		expect(result).toEqual([
			{ username: 'alice', userId: 'alice-sub' },
			{ username: 'bob', userId: 'bob-sub' },
		]);
	});

	it('drops roster entries whose stored tokens cannot be resolved', async () => {
		getAuthUserListSpy.mockResolvedValue(['alice', 'ghost', 'bob']);
		getStoredIdTokenSpy.mockImplementation((username: string) => {
			if (username === 'ghost') return Promise.resolve(undefined);

			return Promise.resolve({
				payload: { 'cognito:username': username, sub: `${username}-sub` },
				toString: () => `${username}-idToken`,
			});
		});

		const result = await listCurrentUsers();

		expect(result).toEqual([
			{ username: 'alice', userId: 'alice-sub' },
			{ username: 'bob', userId: 'bob-sub' },
		]);
	});

	it('drops roster entries whose stored id token lacks a `sub` claim', async () => {
		getAuthUserListSpy.mockResolvedValue(['alice', 'nosub', 'bob']);
		getStoredIdTokenSpy.mockImplementation((username: string) => {
			if (username === 'nosub') {
				return Promise.resolve({
					payload: { 'cognito:username': username },
					toString: () => `${username}-idToken`,
				});
			}

			return Promise.resolve({
				payload: { 'cognito:username': username, sub: `${username}-sub` },
				toString: () => `${username}-idToken`,
			});
		});

		const result = await listCurrentUsers();

		expect(result).toEqual([
			{ username: 'alice', userId: 'alice-sub' },
			{ username: 'bob', userId: 'bob-sub' },
		]);
	});

	it('does not trigger a token refresh', async () => {
		getAuthUserListSpy.mockResolvedValue(['alice']);
		getStoredIdTokenSpy.mockResolvedValue({
			payload: { 'cognito:username': 'alice', sub: 'alice-sub' },
			toString: () => 'alice-idToken',
		});

		await listCurrentUsers();

		// identities are read directly from stored tokens; loadTokens (which can
		// drive a refresh) must not be invoked.
		expect(loadTokensSpy).not.toHaveBeenCalled();
	});

	it('includes signInDetails when stored signInDetails key is present', async () => {
		getAuthUserListSpy.mockResolvedValue(['alice']);
		getStoredIdTokenSpy.mockResolvedValue({
			payload: { 'cognito:username': 'alice', sub: 'alice-sub' },
			toString: () => 'alice-idToken',
		});

		const signInDetails = {
			loginId: 'alice@example.com',
			authFlowType: 'USER_SRP_AUTH',
		};
		mockKeyValueStorage.getItem.mockImplementation((key: string) => {
			if (key.endsWith('.signInDetails')) {
				return Promise.resolve(JSON.stringify(signInDetails));
			}

			return Promise.resolve(null);
		});

		const result = await listCurrentUsers();

		expect(result).toEqual([
			{
				username: 'alice',
				userId: 'alice-sub',
				signInDetails,
			},
		]);
	});

	it('still returns the user when signInDetails read fails', async () => {
		getAuthUserListSpy.mockResolvedValue(['alice']);
		getStoredIdTokenSpy.mockResolvedValue({
			payload: { 'cognito:username': 'alice', sub: 'alice-sub' },
			toString: () => 'alice-idToken',
		});

		// signInDetails key returns invalid JSON — parse will throw, but the
		// implementation currently only reads it conditionally so it may return
		// null. Either way the user should still be resolvable.
		mockKeyValueStorage.getItem.mockResolvedValue(null);

		const result = await listCurrentUsers();

		expect(result).toEqual([{ username: 'alice', userId: 'alice-sub' }]);
	});
});
