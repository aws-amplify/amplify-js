// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { setUpTOTP, signIn } from '../src';

import { mockMFA } from './mocks/handlers';

describe('setUpTOTP Integration Tests', () => {
	beforeEach(async () => {
		await signIn({
			username: 'testuser',
			password: 'TestPassword123!',
		});
	});

	it('should successfully set up TOTP', async () => {
		const result = await setUpTOTP();

		expect(result.sharedSecret).toBe(mockMFA.totpSecretCode);
		expect(typeof result.getSetupUri).toBe('function');
	});
});
