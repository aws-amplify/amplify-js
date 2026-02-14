// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { signIn, updatePassword } from '../src';

describe('updatePassword Integration Tests', () => {
	beforeEach(async () => {
		await signIn({
			username: 'testuser',
			password: 'TestPassword123!',
		});
	});

	it('should successfully update password', async () => {
		await updatePassword({
			oldPassword: 'TestPassword123!',
			newPassword: 'NewPassword123!',
		});

		// No error means success
		expect(true).toBe(true);
	});

	it('should throw error for incorrect old password', async () => {
		try {
			await updatePassword({
				oldPassword: 'wrongpassword',
				newPassword: 'NewPassword123!',
			});
			throw new Error('Should have thrown an error');
		} catch (error: any) {
			expect(error.name).toBe('NotAuthorizedException');
			expect(error.message).toContain('Incorrect username or password');
		}
	});

	it('should throw validation error for empty old password', async () => {
		try {
			await updatePassword({
				oldPassword: '',
				newPassword: 'NewPassword123!',
			});
			throw new Error('Should have thrown an error');
		} catch (error: any) {
			expect(error.name).toBe('EmptyUpdatePassword');
		}
	});

	it('should throw validation error for empty new password', async () => {
		try {
			await updatePassword({
				oldPassword: 'TestPassword123!',
				newPassword: '',
			});
			throw new Error('Should have thrown an error');
		} catch (error: any) {
			expect(error.name).toBe('EmptyUpdatePassword');
		}
	});
});
