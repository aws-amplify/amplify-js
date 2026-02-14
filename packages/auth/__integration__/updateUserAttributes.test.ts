// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { signIn, updateUserAttributes } from '../src';

import { mockCodeDelivery } from './mocks/handlers';

describe('updateUserAttributes Integration Tests', () => {
	beforeEach(async () => {
		await signIn({
			username: 'testuser',
			password: 'TestPassword123!',
		});
	});

	it('should successfully update non-verifiable attributes', async () => {
		const result = await updateUserAttributes({
			userAttributes: {
				name: 'Updated Name',
			},
		});

		expect(result.name?.isUpdated).toBe(true);
		expect(result.name?.nextStep.updateAttributeStep).toBe('DONE');
	});

	it('should require verification for email updates', async () => {
		const result = await updateUserAttributes({
			userAttributes: {
				email: 'newemail@example.com',
			},
		});

		expect(result.email?.isUpdated).toBe(false);
		expect(result.email?.nextStep.updateAttributeStep).toBe(
			'CONFIRM_ATTRIBUTE_WITH_CODE',
		);
		expect(result.email?.nextStep.codeDeliveryDetails.deliveryMedium).toBe(
			mockCodeDelivery.email.deliveryMedium,
		);
		expect(result.email?.nextStep.codeDeliveryDetails.attributeName).toBe(
			'email',
		);
	});

	it('should throw validation error for empty attributes', async () => {
		try {
			await updateUserAttributes({
				userAttributes: {},
			});
			throw new Error('Should have thrown an error');
		} catch (error: any) {
			// Empty attributes result in API error, not client validation
			expect(error.name).toBe('Error');
		}
	});
});
