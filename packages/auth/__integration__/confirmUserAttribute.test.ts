// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { confirmUserAttribute, signIn } from '../src';

describe('confirmUserAttribute Integration Tests', () => {
	beforeEach(async () => {
		await signIn({
			username: 'testuser',
			password: 'TestPassword123!',
		});
	});

	it('should successfully confirm user attribute', async () => {
		await confirmUserAttribute({
			userAttributeKey: 'email',
			confirmationCode: '123456',
		});

		// No error means success
		expect(true).toBe(true);
	});

	it('should throw error for invalid confirmation code', async () => {
		try {
			await confirmUserAttribute({
				userAttributeKey: 'email',
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
			await confirmUserAttribute({
				userAttributeKey: 'email',
				confirmationCode: '',
			});
			throw new Error('Should have thrown an error');
		} catch (error: any) {
			expect(error.name).toBe('EmptyConfirmUserAttributeCode');
		}
	});
});
