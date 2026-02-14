// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { deleteUserAttributes, signIn } from '../src';

describe('deleteUserAttributes Integration Tests', () => {
	beforeEach(async () => {
		await signIn({
			username: 'testuser',
			password: 'TestPassword123!',
		});
	});

	it('should successfully delete user attributes', async () => {
		await deleteUserAttributes({
			userAttributeKeys: ['custom:attribute1', 'custom:attribute2'],
		});

		// No error means success
		expect(true).toBe(true);
	});
});
