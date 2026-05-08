// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolveCredentials } from '../../../src/pushNotifications/utils';
import { credentials } from '../../testUtils/data';
import { createMockAmplifyContext } from '../../testUtils/createMockAmplifyContext';

describe('resolveCredentials', () => {
	it('resolves required credentials', async () => {
		const mockCtx = createMockAmplifyContext({}, credentials);
		expect(await resolveCredentials(mockCtx)).toStrictEqual(credentials);
	});

	it('throws if credentials are missing', async () => {
		const mockCtx = createMockAmplifyContext(
			{},
			{ ...credentials, credentials: undefined },
		);
		await expect(resolveCredentials(mockCtx)).rejects.toThrow();
	});
});
