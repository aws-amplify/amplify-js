// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { signUp } from '../src';

describe('signUp Integration Tests', () => {
	it('should successfully sign up a new user', async () => {
		const result = await signUp({
			username: 'testuser',
			password: 'TestPassword123!',
			options: {
				userAttributes: {
					email: 'test@example.com',
				},
			},
		});

		expect(result.isSignUpComplete).toBe(false);
		expect(result.nextStep.signUpStep).toBe('CONFIRM_SIGN_UP');
		if (result.nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
			expect(result.nextStep.codeDeliveryDetails.deliveryMedium).toBe('EMAIL');
			expect(result.nextStep.codeDeliveryDetails.destination).toBe(
				't***@e***.com',
			);
			expect(result.nextStep.codeDeliveryDetails.attributeName).toBe('email');
		}
		expect(result.userId).toBe('user-12345');
	});

	it('should handle sign up with minimal information', async () => {
		const result = await signUp({
			username: 'testuser2',
			password: 'TestPassword123!',
		});

		expect(result.isSignUpComplete).toBe(false);
		expect(result.nextStep.signUpStep).toBe('CONFIRM_SIGN_UP');
	});

	it('should throw error when username already exists', async () => {
		try {
			await signUp({
				username: 'existinguser',
				password: 'TestPassword123!',
			});
			throw new Error('Should have thrown an error');
		} catch (error: any) {
			expect(error.name).toBe('UsernameExistsException');
			expect(error.message).toContain('already exists');
		}
	});

	it('should throw validation error for empty username', async () => {
		try {
			await signUp({
				username: '',
				password: 'TestPassword123!',
			});
			throw new Error('Should have thrown an error');
		} catch (error: any) {
			expect(error.name).toBe('EmptySignUpUsername');
		}
	});
});
