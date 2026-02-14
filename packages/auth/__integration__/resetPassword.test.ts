// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { resetPassword } from '../src';

import { mockCodeDelivery } from './mocks/handlers';

describe('resetPassword Integration Tests', () => {
	it('should successfully initiate password reset', async () => {
		const result = await resetPassword({
			username: 'testuser',
		});

		expect(result.isPasswordReset).toBe(false);
		expect(result.nextStep.resetPasswordStep).toBe(
			'CONFIRM_RESET_PASSWORD_WITH_CODE',
		);
		expect(result.nextStep.codeDeliveryDetails.deliveryMedium).toBe(
			mockCodeDelivery.email.deliveryMedium,
		);
		expect(result.nextStep.codeDeliveryDetails.destination).toBe(
			mockCodeDelivery.email.destination,
		);
		expect(result.nextStep.codeDeliveryDetails.attributeName).toBe(
			mockCodeDelivery.email.attributeName,
		);
	});

	it('should throw validation error for empty username', async () => {
		try {
			await resetPassword({
				username: '',
			});
			throw new Error('Should have thrown an error');
		} catch (error: any) {
			expect(error.name).toBe('EmptyResetPasswordUsername');
		}
	});
});
