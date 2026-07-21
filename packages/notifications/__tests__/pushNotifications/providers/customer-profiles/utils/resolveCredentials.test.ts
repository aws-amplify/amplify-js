// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession } from '@aws-amplify/core';

import { PushNotificationError } from '../../../../../src/pushNotifications/errors';
import { resolveCredentials } from '../../../../../src/pushNotifications/providers/customer-profiles/utils/resolveCredentials';

jest.mock('@aws-amplify/core');

describe('Push Notifications Customer Profiles Provider Util: resolveCredentials', () => {
	const credentials = {
		accessKeyId: 'access-key-id',
		secretAccessKey: 'secret-access-key',
		sessionToken: 'session-token',
	};
	const mockFetchAuthSession = fetchAuthSession as jest.Mock;

	beforeEach(() => {
		mockFetchAuthSession.mockReset();
	});

	it('resolves Identity Pool credentials for an authenticated session', async () => {
		mockFetchAuthSession.mockResolvedValue({
			tokens: { accessToken: { toString: () => 'ignored' } },
			credentials,
			identityId: 'us-east-1:auth-identity-id',
		});
		expect(await resolveCredentials()).toStrictEqual({ credentials });
	});

	it('resolves Identity Pool credentials for a guest session', async () => {
		mockFetchAuthSession.mockResolvedValue({
			tokens: undefined,
			credentials,
			identityId: 'us-east-1:guest-identity-id',
		});
		expect(await resolveCredentials()).toStrictEqual({ credentials });
	});

	it('throws if no credentials can be resolved', async () => {
		mockFetchAuthSession.mockResolvedValue({
			tokens: undefined,
			credentials: undefined,
		});
		await expect(resolveCredentials()).rejects.toBeInstanceOf(
			PushNotificationError,
		);
	});
});
