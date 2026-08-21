// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PushNotificationError } from '../../../../../src/pushNotifications/errors';
import { resolveCredentials } from '../../../../../src/pushNotifications/providers/customer-profiles/utils/resolveCredentials';
import { createMockAmplifyContext } from '../../../../testUtils/createMockAmplifyContext';

describe('Push Notifications Customer Profiles Provider Util: resolveCredentials', () => {
	const credentials = {
		accessKeyId: 'access-key-id',
		secretAccessKey: 'secret-access-key',
		sessionToken: 'session-token',
	};

	it('resolves Identity Pool credentials for an authenticated session', async () => {
		const ctx = createMockAmplifyContext();
		(ctx.fetchAuthSession as jest.Mock).mockResolvedValue({
			tokens: { accessToken: { toString: () => 'ignored' } },
			credentials,
			identityId: 'us-east-1:auth-identity-id',
		});
		expect(await resolveCredentials(ctx)).toStrictEqual({ credentials });
	});

	it('resolves Identity Pool credentials for a guest session', async () => {
		const ctx = createMockAmplifyContext();
		(ctx.fetchAuthSession as jest.Mock).mockResolvedValue({
			tokens: undefined,
			credentials,
			identityId: 'us-east-1:guest-identity-id',
		});
		expect(await resolveCredentials(ctx)).toStrictEqual({ credentials });
	});

	it('throws if no credentials can be resolved', async () => {
		const ctx = createMockAmplifyContext();
		(ctx.fetchAuthSession as jest.Mock).mockResolvedValue({
			tokens: undefined,
			credentials: undefined,
		});
		await expect(resolveCredentials(ctx)).rejects.toBeInstanceOf(
			PushNotificationError,
		);
	});
});
