// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createMockAmplifyContext } from '@aws-amplify/core/internals/testing';

import { AnalyticsError } from '../../../../src/errors';
import { resolveCredentials } from '../../../../src/providers/pinpoint/utils';

describe('Analytics Pinpoint Provider Util: resolveCredentials', () => {
	const credentials = {
		credentials: {
			accessKeyId: 'access-key-id',
			secretAccessKey: 'secret-access-key',
		},
		identityId: 'identity-id',
	};
	const mockCtx = createMockAmplifyContext();
	// assert mocks
	const mockFetchAuthSession = mockCtx.fetchAuthSession as jest.Mock;

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
