// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession } from '@aws-amplify/core';

import { AnalyticsError } from '../../../../src/errors';
import { resolveCredentials } from '../../../../src/providers/customer-profiles/utils';

jest.mock('@aws-amplify/core');

describe('Analytics Customer Profiles Provider Util: resolveCredentials', () => {
	const token = 'user-pool-access-token';
	const mockFetchAuthSession = fetchAuthSession as jest.Mock;

	beforeEach(() => {
		mockFetchAuthSession.mockReset();
	});

	it('resolves the Cognito user-pool access token', async () => {
		mockFetchAuthSession.mockResolvedValue({
			tokens: {
				accessToken: { toString: () => token },
			},
		});
		expect(await resolveCredentials()).toStrictEqual({ token });
	});

	it('throws if the token is missing', async () => {
		mockFetchAuthSession.mockResolvedValue({ tokens: undefined });
		await expect(resolveCredentials()).rejects.toBeInstanceOf(AnalyticsError);
	});
});
