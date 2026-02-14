// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { confirmResetPassword } from '../src';

describe('confirmResetPassword Integration Tests', () => {
	it('should successfully confirm password reset', async () => {
		await confirmResetPassword({
			username: 'testuser',
			confirmationCode: '123456',
			newPassword: 'NewPassword123!',
		});

		// No error means success
		expect(true).toBe(true);
	});

	it('should throw error for invalid confirmation code', async () => {
		try {
			await confirmResetPassword({
				username: 'testuser',
				confirmationCode: 'invalid',
				newPassword: 'NewPassword123!',
			});
			throw new Error('Should have thrown an error');
		} catch (error: any) {
			expect(error.name).toBe('CodeMismatchException');
			expect(error.message).toContain('Invalid verification code');
		}
	});

	it('should throw validation error for empty username', async () => {
		try {
			await confirmResetPassword({
				username: '',
				confirmationCode: '123456',
				newPassword: 'NewPassword123!',
			});
			throw new Error('Should have thrown an error');
		} catch (error: any) {
			expect(error.name).toBe('EmptyConfirmResetPasswordUsername');
		}
	});

	it('should throw validation error for empty confirmation code', async () => {
		try {
			await confirmResetPassword({
				username: 'testuser',
				confirmationCode: '',
				newPassword: 'NewPassword123!',
			});
			throw new Error('Should have thrown an error');
		} catch (error: any) {
			expect(error.name).toBe('EmptyConfirmResetPasswordConfirmationCode');
		}
	});

	it('should throw validation error for empty new password', async () => {
		try {
			await confirmResetPassword({
				username: 'testuser',
				confirmationCode: '123456',
				newPassword: '',
			});
			throw new Error('Should have thrown an error');
		} catch (error: any) {
			expect(error.name).toBe('EmptyConfirmResetPasswordNewPassword');
		}
	});
});
