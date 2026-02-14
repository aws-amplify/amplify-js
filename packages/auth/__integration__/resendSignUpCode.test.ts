// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { resendSignUpCode } from '../src';

describe('resendSignUpCode Integration Tests', () => {
	it('should successfully resend confirmation code', async () => {
		const result = await resendSignUpCode({
			username: 'testuser',
		});

		expect(result.deliveryMedium).toBe('EMAIL');
		expect(result.destination).toBe('t***@e***.com');
		expect(result.attributeName).toBe('email');
	});

	it('should throw validation error for empty username', async () => {
		try {
			await resendSignUpCode({
				username: '',
			});
			throw new Error('Should have thrown an error');
		} catch (error: any) {
			expect(error.name).toBe('EmptySignUpUsername');
		}
	});
});
