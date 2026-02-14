// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { setUpTOTP, signIn, verifyTOTPSetup } from '../src';

describe('verifyTOTPSetup Integration Tests', () => {
	beforeEach(async () => {
		await signIn({
			username: 'testuser',
			password: 'TestPassword123!',
		});
	});

	it('should successfully verify TOTP setup', async () => {
		await setUpTOTP();

		await verifyTOTPSetup({
			code: '123456',
		});

		// No error means success
		expect(true).toBe(true);
	});

	it('should throw error for invalid TOTP code', async () => {
		await setUpTOTP();

		try {
			await verifyTOTPSetup({
				code: 'invalid',
			});
			throw new Error('Should have thrown an error');
		} catch (error: any) {
			expect(error.name).toBe('EnableSoftwareTokenMFAException');
			expect(error.message).toContain('Invalid code');
		}
	});

	it('should throw validation error for empty code', async () => {
		try {
			await verifyTOTPSetup({
				code: '',
			});
			throw new Error('Should have thrown an error');
		} catch (error: any) {
			expect(error.name).toBe('EmptyVerifyTOTPSetupCode');
		}
	});
});
