// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchMFAPreference, signIn } from '../src';

describe('fetchMFAPreference Integration Tests', () => {
	beforeEach(async () => {
		await signIn({
			username: 'testuser',
			password: 'TestPassword123!',
		});
	});

	it('should successfully fetch MFA preference', async () => {
		const result = await fetchMFAPreference();

		expect(result.preferred).toBe('TOTP');
		expect(result.enabled).toContain('TOTP');
	});
});
