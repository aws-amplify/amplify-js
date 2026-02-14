// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { confirmSignUp } from '../src';

describe('confirmSignUp Integration Tests', () => {
	it('should successfully confirm sign up', async () => {
		const result = await confirmSignUp({
			username: 'testuser',
			confirmationCode: '123456',
		});

		expect(result.isSignUpComplete).toBe(true);
		expect(result.nextStep.signUpStep).toBe('DONE');
	});

	it('should throw error for invalid confirmation code', async () => {
		try {
			await confirmSignUp({
				username: 'testuser',
				confirmationCode: 'invalid',
			});
			throw new Error('Should have thrown an error');
		} catch (error: any) {
			expect(error.name).toBe('CodeMismatchException');
			expect(error.message).toContain('Invalid verification code');
		}
	});

	it('should throw validation error for empty confirmation code', async () => {
		try {
			await confirmSignUp({
				username: 'testuser',
				confirmationCode: '',
			});
			throw new Error('Should have thrown an error');
		} catch (error: any) {
			expect(error.name).toBe('EmptyConfirmSignUpCode');
		}
	});

	it('should throw validation error for empty username', async () => {
		try {
			await confirmSignUp({
				username: '',
				confirmationCode: '123456',
			});
			throw new Error('Should have thrown an error');
		} catch (error: any) {
			expect(error.name).toBe('EmptyConfirmSignUpUsername');
		}
	});
});
