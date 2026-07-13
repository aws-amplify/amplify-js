// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { decodeJWT } from '@aws-amplify/core/internals/utils';

import { listCurrentUsers } from '../../../src/providers/cognito/apis/listCurrentUsers';
import { cognitoUserPoolsTokenProvider } from '../../../src/providers/cognito/tokenProvider';
import { AUTH_KEY_PREFIX } from '../../../src/providers/cognito/tokenProvider/constants';

jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	decodeJWT: jest.fn(),
}));

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
const mockDecodeJWT = decodeJWT as jest.Mock;

const idTokenKey = (username: string) =>
	`${AUTH_KEY_PREFIX}.${userPoolClientId}.${username}.idToken`;

const mockKeyValueStorage = {
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn(),
};

describe('listCurrentUsers', () => {
	let getAuthUserListSpy: jest.SpyInstance;
	let loadTokensSpy: jest.SpyInstance;

	beforeEach(() => {
		jest
			.spyOn(authTokenStore, 'getKeyValueStorage')
			.mockReturnValue(mockKeyValueStorage);
		getAuthUserListSpy = jest.spyOn(authTokenStore, 'getAuthUserList');
		loadTokensSpy = jest.spyOn(authTokenStore, 'loadTokens');

		// each stored idToken string decodes to a payload identifying its user.
		mockDecodeJWT.mockImplementation((token: string) => {
			const username = token.replace('-idToken', '');

			return {
				payload: {
					'cognito:username': username,
					sub: `${username}-sub`,
				},
				toString: () => token,
			};
		});
	});

	afterEach(() => {
		jest.restoreAllMocks();
		mockKeyValueStorage.getItem.mockReset();
		mockDecodeJWT.mockReset();
	});

	it('returns AuthUser[] resolved from stored id tokens in roster order', async () => {
		getAuthUserListSpy.mockResolvedValue(['alice', 'bob']);
		mockKeyValueStorage.getItem.mockImplementation((key: string) => {
			const map: Record<string, string> = {
				[idTokenKey('alice')]: 'alice-idToken',
				[idTokenKey('bob')]: 'bob-idToken',
			};

			return Promise.resolve(map[key] ?? null);
		});

		const result = await listCurrentUsers();

		expect(result).toEqual([
			{ username: 'alice', userId: 'alice-sub' },
			{ username: 'bob', userId: 'bob-sub' },
		]);
	});

	it('drops roster entries whose stored tokens cannot be resolved', async () => {
		getAuthUserListSpy.mockResolvedValue(['alice', 'ghost', 'bob']);
		mockKeyValueStorage.getItem.mockImplementation((key: string) => {
			const map: Record<string, string> = {
				[idTokenKey('alice')]: 'alice-idToken',
				[idTokenKey('bob')]: 'bob-idToken',
				// 'ghost' has no stored idToken -> resolves to null -> dropped.
			};

			return Promise.resolve(map[key] ?? null);
		});

		const result = await listCurrentUsers();

		expect(result).toEqual([
			{ username: 'alice', userId: 'alice-sub' },
			{ username: 'bob', userId: 'bob-sub' },
		]);
	});

	it('drops roster entries whose stored id token lacks a `sub` claim', async () => {
		getAuthUserListSpy.mockResolvedValue(['alice', 'nosub', 'bob']);
		mockKeyValueStorage.getItem.mockImplementation((key: string) => {
			const map: Record<string, string> = {
				[idTokenKey('alice')]: 'alice-idToken',
				[idTokenKey('nosub')]: 'nosub-idToken',
				[idTokenKey('bob')]: 'bob-idToken',
			};

			return Promise.resolve(map[key] ?? null);
		});
		// 'nosub' decodes to a payload with no `sub` -> unresolvable -> dropped.
		mockDecodeJWT.mockImplementation((token: string) => {
			const username = token.replace('-idToken', '');

			return {
				payload:
					username === 'nosub'
						? { 'cognito:username': username }
						: { 'cognito:username': username, sub: `${username}-sub` },
				toString: () => token,
			};
		});

		const result = await listCurrentUsers();

		expect(result).toEqual([
			{ username: 'alice', userId: 'alice-sub' },
			{ username: 'bob', userId: 'bob-sub' },
		]);
	});

	it('does not trigger a token refresh', async () => {
		getAuthUserListSpy.mockResolvedValue(['alice']);
		mockKeyValueStorage.getItem.mockImplementation((key: string) =>
			Promise.resolve(key === idTokenKey('alice') ? 'alice-idToken' : null),
		);

		await listCurrentUsers();

		// identities are read directly from stored tokens; loadTokens (which can
		// drive a refresh) must not be invoked.
		expect(loadTokensSpy).not.toHaveBeenCalled();
	});
});
