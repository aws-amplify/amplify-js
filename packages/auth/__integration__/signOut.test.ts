// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession, signIn, signOut } from '../src';

describe('signOut Integration Tests', () => {
	it('should successfully sign out', async () => {
		await signIn({
			username: 'testuser',
			password: 'TestPassword123!',
		});

		await signOut();

		// After sign out, session should not have tokens
		const session = await fetchAuthSession();
		expect(session.tokens).toBeUndefined();
	});
});
