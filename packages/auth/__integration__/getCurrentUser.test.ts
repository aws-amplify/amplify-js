// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getCurrentUser, signIn } from '../src';

describe('getCurrentUser Integration Tests', () => {
	beforeEach(async () => {
		await signIn({
			username: 'testuser',
			password: 'TestPassword123!',
		});
	});

	it('should successfully get current user', async () => {
		const result = await getCurrentUser();

		expect(result.username).toBe('testuser');
		expect(result.userId).toBe('user-12345');
	});
});
