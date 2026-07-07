// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession } from '@aws-amplify/core';

import { PushNotificationError } from '../../../../../src/pushNotifications/errors';
import { resolveCredentials } from '../../../../../src/pushNotifications/providers/customer-profiles/utils/resolveCredentials';

jest.mock('@aws-amplify/core');

describe('Push Notifications Customer Profiles Provider Util: resolveCredentials', () => {
	const token = 'user-pool-access-token';
	const credentials = {
		accessKeyId: 'access-key-id',
		secretAccessKey: 'secret-access-key',
		sessionToken: 'session-token',
	};
	const identityId = 'us-east-1:guest-identity-id';
	const mockFetchAuthSession = fetchAuthSession as jest.Mock;

	beforeEach(() => {
		mockFetchAuthSession.mockReset();
	});

	it('resolves the Cognito user-pool access token (authenticated)', async () => {
		mockFetchAuthSession.mockResolvedValue({
			tokens: { accessToken: { toString: () => token } },
			credentials,
			identityId,
		});
		expect(await resolveCredentials()).toStrictEqual({
			token,
			credentials,
			identityId,
		});
	});

	it('resolves guest credentials + identityId when no token is present', async () => {
		mockFetchAuthSession.mockResolvedValue({
			tokens: undefined,
			credentials,
			identityId,
		});
		expect(await resolveCredentials()).toStrictEqual({
			token: undefined,
			credentials,
			identityId,
		});
	});

	it('throws if neither a token nor credentials can be resolved', async () => {
		mockFetchAuthSession.mockResolvedValue({
			tokens: undefined,
			credentials: undefined,
		});
		await expect(resolveCredentials()).rejects.toBeInstanceOf(
			PushNotificationError,
		);
	});
});
