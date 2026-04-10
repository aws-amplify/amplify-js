// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AnalyticsError } from '../../../../src/errors';
import { resolveCredentials } from '../../../../src/providers/pinpoint/utils';
import { createMockAmplifyContext } from '../../../testUtils/mockAmplifyContext';

const mockCtx = createMockAmplifyContext();

describe('Analytics Pinpoint Provider Util: resolveCredentials', () => {
	const credentials = {
		credentials: {
			accessKeyId: 'access-key-id',
			secretAccessKey: 'secret-access-key',
		},
		identityId: 'identity-id',
	};
	// assert mocks

	it('resolves required credentials', async () => {
		(mockCtx.fetchAuthSession as jest.Mock).mockResolvedValue(credentials);
		expect(await resolveCredentials(mockCtx)).toStrictEqual(credentials);
	});

	it('throws if credentials are missing', async () => {
		(mockCtx.fetchAuthSession as jest.Mock).mockReturnValue({
			...credentials,
			credentials: undefined,
		});
		await expect(resolveCredentials(mockCtx)).rejects.toBeInstanceOf(
			AnalyticsError,
		);
	});
});
