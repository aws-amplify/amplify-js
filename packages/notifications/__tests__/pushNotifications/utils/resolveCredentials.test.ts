// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolveCredentials } from '../../../src/pushNotifications/utils/resolveCredentials';
import { createMockAmplifyContext } from '../../testUtils/createMockAmplifyContext';

describe('resolveCredentials', () => {
	const credentials = {
		credentials: {
			accessKeyId: 'access-key-id',
			secretAccessKey: 'secret-access-key',
		},
		identityId: 'identity-id',
	};

	it('should return the credentials and identityId', async () => {
		const ctx = createMockAmplifyContext();
		(ctx.fetchAuthSession as jest.Mock).mockResolvedValue(credentials);
		expect(await resolveCredentials(ctx)).toStrictEqual(credentials);
	});

	it('should throw if credentials are missing', async () => {
		const ctx = createMockAmplifyContext();
		(ctx.fetchAuthSession as jest.Mock).mockResolvedValue({});
		await expect(resolveCredentials(ctx)).rejects.toBeDefined();
	});
});
