// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { signIn } from '../src';

describe('signIn Integration Tests', () => {
	it('should successfully sign in with username and password', async () => {
		const result = await signIn({
			username: 'testuser',
			password: 'TestPassword123!',
		});

		expect(result.isSignedIn).toBe(true);
		expect(result.nextStep.signInStep).toBe('DONE');
	});

	it('should throw error for non-existent user', async () => {
		try {
			await signIn({
				username: 'nonexistent',
				password: 'TestPassword123!',
			});
			throw new Error('Should have thrown an error');
		} catch (error: any) {
			expect(error.name).toBe('UserNotFoundException');
			expect(error.message).toContain('does not exist');
		}
	});

	it('should handle sign in flow (password validation skipped in mocked SRP)', async () => {
		// Note: In real SRP flow, wrong password would fail during RespondToAuthChallenge
		// Since we mock the SRP crypto operations, password validation is bypassed
		// This test documents that limitation of the integration test setup
		const result = await signIn({
			username: 'testuser',
			password: 'wrongpassword',
		});

		// Sign in succeeds because SRP crypto is mocked
		expect(result.isSignedIn).toBe(true);
	});

	it('should throw validation error for empty username', async () => {
		try {
			await signIn({
				username: '',
				password: 'TestPassword123!',
			});
			throw new Error('Should have thrown an error');
		} catch (error: any) {
			expect(error.name).toBe('EmptySignInUsername');
		}
	});

	it('should throw validation error for empty password', async () => {
		try {
			await signIn({
				username: 'testuser',
				password: '',
			});
			throw new Error('Should have thrown an error');
		} catch (error: any) {
			expect(error.name).toBe('EmptySignInPassword');
		}
	});
});
