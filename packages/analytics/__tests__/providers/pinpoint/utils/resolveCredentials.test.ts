// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession } from '@aws-amplify/core';
import { AnalyticsError } from '../../../../src/errors';
import { resolveCredentials } from '../../../../src/providers/pinpoint/utils';

jest.mock('@aws-amplify/core');

describe('Analytics Pinpoint Provider Util: resolveCredentials', () => {
	const credentials = {
		credentials: {
			accessKeyId: 'access-key-id',
			secretAccessKey: 'secret-access-key',
		},
		identityId: 'identity-id',
	};
	// assert mocks
	const mockFetchAuthSession = fetchAuthSession as jest.Mock;

	beforeEach(() => {
		mockFetchAuthSession.mockReset();
	});

	it('resolves required credentials', async () => {
		mockFetchAuthSession.mockResolvedValue(credentials);
		expect(await resolveCredentials()).toStrictEqual(credentials);
	});

	it('throws if credentials are missing', async () => {
		mockFetchAuthSession.mockReturnValue({
			...credentials,
			credentials: undefined,
		});
		await expect(resolveCredentials()).rejects.toBeInstanceOf(AnalyticsError);
	});
});
