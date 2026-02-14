// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession, signIn } from '../src';

import { mockTokens } from './mocks/handlers';

describe('fetchAuthSession Integration Tests', () => {
	it('should fetch auth session after sign in', async () => {
		await signIn({
			username: 'testuser',
			password: 'TestPassword123!',
		});

		const session = await fetchAuthSession();

		expect(session.tokens?.accessToken.toString()).toBe(mockTokens.accessToken);
		expect(session.tokens?.idToken.toString()).toBe(mockTokens.idToken);
	});
});
