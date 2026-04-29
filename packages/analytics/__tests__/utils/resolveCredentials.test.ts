// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession } from '@aws-amplify/core';

import { resolveCredentials } from '../../src/utils';
import { AnalyticsError } from '../../src';

jest.mock('@aws-amplify/core');

const mockFetchAuthSession = fetchAuthSession as jest.Mock;

const mockCtx = {
	resourcesConfig: {},
	libraryOptions: {},
	fetchAuthSession: (...args: unknown[]) => mockFetchAuthSession(...args),
	clearCredentials: jest.fn(),
	getTokens: jest.fn(),
} as any;

describe('Analytics Kinesis Provider Util: resolveCredentials', () => {
	const credentials = {
		credentials: {
			accessKeyId: 'access-key-id',
			secretAccessKey: 'secret-access-key',
			sessionToken: 'session-token',
		},
		identityId: 'identity-id',
	};

	beforeEach(() => {
		mockFetchAuthSession.mockReset();
	});

	it('resolves required credentials', async () => {
		mockFetchAuthSession.mockResolvedValue(credentials);
		expect(await resolveCredentials(mockCtx)).toStrictEqual(credentials);
	});

	it('throws if credentials are missing', async () => {
		mockFetchAuthSession.mockReturnValue({
			...credentials,
			credentials: undefined,
		});
		await expect(resolveCredentials(mockCtx)).rejects.toBeInstanceOf(
			AnalyticsError,
		);
	});
});
