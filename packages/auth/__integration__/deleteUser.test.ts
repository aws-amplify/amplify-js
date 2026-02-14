// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { deleteUser, signIn } from '../src';

describe('deleteUser Integration Tests', () => {
	beforeEach(async () => {
		await signIn({
			username: 'testuser',
			password: 'TestPassword123!',
		});
	});

	it('should successfully delete user account', async () => {
		await deleteUser();

		// No error means success
		expect(true).toBe(true);
	});
});
