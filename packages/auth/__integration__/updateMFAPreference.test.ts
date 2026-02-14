// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { signIn, updateMFAPreference } from '../src';

describe('updateMFAPreference Integration Tests', () => {
	beforeEach(async () => {
		await signIn({
			username: 'testuser',
			password: 'TestPassword123!',
		});
	});

	it('should successfully update MFA preference to TOTP', async () => {
		await updateMFAPreference({
			totp: 'PREFERRED',
		});

		// No error means success
		expect(true).toBe(true);
	});

	it('should successfully update MFA preference to SMS', async () => {
		await updateMFAPreference({
			sms: 'PREFERRED',
		});

		// No error means success
		expect(true).toBe(true);
	});

	it('should successfully disable MFA', async () => {
		await updateMFAPreference({
			totp: 'DISABLED',
			sms: 'DISABLED',
		});

		// No error means success
		expect(true).toBe(true);
	});
});
