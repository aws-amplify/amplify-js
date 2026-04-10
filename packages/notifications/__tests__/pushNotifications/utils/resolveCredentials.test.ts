// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolveCredentials } from '../../../src/pushNotifications/utils';
import { credentials } from '../../testUtils/data';
import { createMockAmplifyContext } from '../../testUtils/mockAmplifyContext';

jest.mock('@aws-amplify/core');

const mockCtx = createMockAmplifyContext();

describe('resolveCredentials', () => {
	// assert mocks

	beforeEach(() => {
		(mockCtx.fetchAuthSession as jest.Mock).mockReset();
	});

	it('resolves required credentials', async () => {
		(mockCtx.fetchAuthSession as jest.Mock).mockResolvedValue(credentials);
		expect(await resolveCredentials(mockCtx)).toStrictEqual(credentials);
	});

	it('throws if credentials are missing', async () => {
		(mockCtx.fetchAuthSession as jest.Mock).mockReturnValue({
			...credentials,
			credentials: undefined,
		});
		await expect(resolveCredentials(mockCtx)).rejects.toThrow();
	});
});
