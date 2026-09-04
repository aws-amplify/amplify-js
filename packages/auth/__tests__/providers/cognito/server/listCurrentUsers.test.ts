// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getAmplifyServerContext } from '@aws-amplify/core/internals/adapter-core';

import { listCurrentUsers } from '../../../../src/providers/cognito/apis/server/listCurrentUsers';

jest.mock('@aws-amplify/core/internals/adapter-core');

const mockGetAmplifyServerContext = jest.mocked(getAmplifyServerContext);
const mockListSessionUsernames = jest.fn();
const mockGetStoredIdToken = jest.fn();
const mockSwitcher = {
	listSessionUsernames: mockListSessionUsernames,
	getStoredIdToken: mockGetStoredIdToken,
	setActiveSession: jest.fn(),
};
const mockGetTokenProvider = jest.fn();
const mockContextSpec = { token: { value: Symbol('test') } } as any;

const idToken = (username: string) => ({
	payload: { 'cognito:username': username, sub: `${username}-sub` },
	toString: () => `${username}-idToken`,
});

describe('server-side listCurrentUsers', () => {
	beforeEach(() => {
		mockGetTokenProvider.mockReturnValue({
			getTokens: jest.fn(),
			getSessionSwitcher: () => mockSwitcher,
		});
		mockGetAmplifyServerContext.mockReturnValue({
			amplify: {
				Auth: { getTokenProvider: mockGetTokenProvider },
			},
		} as any);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('returns AuthUser[] resolved from stored id tokens in roster order', async () => {
		mockListSessionUsernames.mockResolvedValue(['alice', 'bob']);
		mockGetStoredIdToken.mockImplementation((username: string) =>
			Promise.resolve(idToken(username)),
		);

		await expect(listCurrentUsers(mockContextSpec)).resolves.toEqual([
			{ username: 'alice', userId: 'alice-sub' },
			{ username: 'bob', userId: 'bob-sub' },
		]);
	});

	it('drops roster entries whose stored id token cannot be resolved', async () => {
		mockListSessionUsernames.mockResolvedValue(['alice', 'ghost', 'bob']);
		mockGetStoredIdToken.mockImplementation((username: string) =>
			Promise.resolve(username === 'ghost' ? undefined : idToken(username)),
		);

		await expect(listCurrentUsers(mockContextSpec)).resolves.toEqual([
			{ username: 'alice', userId: 'alice-sub' },
			{ username: 'bob', userId: 'bob-sub' },
		]);
	});

	it('drops roster entries whose stored id token lacks a `sub` claim', async () => {
		mockListSessionUsernames.mockResolvedValue(['alice', 'nosub', 'bob']);
		mockGetStoredIdToken.mockImplementation((username: string) =>
			Promise.resolve(
				username === 'nosub'
					? { payload: { 'cognito:username': 'nosub' }, toString: () => 'x' }
					: idToken(username),
			),
		);

		await expect(listCurrentUsers(mockContextSpec)).resolves.toEqual([
			{ username: 'alice', userId: 'alice-sub' },
			{ username: 'bob', userId: 'bob-sub' },
		]);
	});

	it('throws when the context has no session-switching token provider', async () => {
		mockGetTokenProvider.mockReturnValue(undefined);

		await expect(listCurrentUsers(mockContextSpec)).rejects.toMatchObject({
			name: 'TokenProviderNotFoundException',
		});
	});
});
