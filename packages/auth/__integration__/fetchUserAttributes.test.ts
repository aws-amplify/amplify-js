// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchUserAttributes, signIn } from '../src';

describe('fetchUserAttributes Integration Tests', () => {
	beforeEach(async () => {
		await signIn({
			username: 'testuser',
			password: 'TestPassword123!',
		});
	});

	it('should successfully fetch user attributes', async () => {
		const result = await fetchUserAttributes();

		expect(result.sub).toBe('user-12345');
		expect(result.email).toBe('test@example.com');
		expect(result.email_verified).toBe('true');
		expect(result.name).toBe('Test User');
	});
});
