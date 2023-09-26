// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession } from '@aws-amplify/core';
import { APIError } from '../../src/utils/errors';
import { resolveAuthSession } from '../../src/utils';

jest.mock('@aws-amplify/core');

describe('GraphQL API Util: resolveAuthSession', () => {
	const authSession = {
		tokens: {
			idToken: {},
			accessToken: {},
		},
		credentials: {
			accessKeyId: 'accessKeyId',
			secretAccessKey: 'secretAccessKey',
			sessionToken: 'sessionToken',
		},
		identityId: 'identityId',
	};
	// assert mocks
	const mockFetchAuthSession = fetchAuthSession as jest.Mock;

	beforeEach(() => {
		mockFetchAuthSession.mockReset();
	});

	it('resolves required credentials', async () => {
		mockFetchAuthSession.mockResolvedValue(authSession);
		expect(await resolveAuthSession()).toStrictEqual(authSession);
	});

	it('does not throw if only tokens are present', async () => {
		mockFetchAuthSession.mockReturnValue({
			...authSession,
			credentials: undefined,
			identityId: undefined,
		});
		await expect(resolveAuthSession()).rejects.toBeInstanceOf(APIError);
	});

	it('does not throw if only credentials are present', async () => {
		mockFetchAuthSession.mockReturnValue({
			...authSession,
			identityId: undefined,
			tokens: undefined,
		});
		await expect(resolveAuthSession()).rejects.toBeInstanceOf(APIError);
	});

	it('does not throw if only identityId is present', async () => {
		mockFetchAuthSession.mockReturnValue({
			...authSession,
			credentials: undefined,
			tokens: undefined,
		});
		await expect(resolveAuthSession()).rejects.toBeInstanceOf(APIError);
	});

	it('throws if there is no auth session', async () => {
		mockFetchAuthSession.mockReturnValue({
			credentials: undefined,
			identityId: undefined,
			tokens: undefined,
		});
		await expect(resolveAuthSession()).rejects.toBeInstanceOf(APIError);
	});
});
