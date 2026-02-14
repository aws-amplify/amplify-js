// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { signIn, updateUserAttribute } from '../src';

import { mockCodeDelivery } from './mocks/handlers';

describe('updateUserAttribute Integration Tests', () => {
	beforeEach(async () => {
		await signIn({
			username: 'testuser',
			password: 'TestPassword123!',
		});
	});

	it('should successfully update non-verifiable attribute', async () => {
		const result = await updateUserAttribute({
			userAttribute: {
				attributeKey: 'name',
				value: 'Updated Name',
			},
		});

		expect(result.isUpdated).toBe(true);
		expect(result.nextStep.updateAttributeStep).toBe('DONE');
	});

	it('should require verification for email update', async () => {
		const result = await updateUserAttribute({
			userAttribute: {
				attributeKey: 'email',
				value: 'newemail@example.com',
			},
		});

		expect(result.isUpdated).toBe(false);
		expect(result.nextStep.updateAttributeStep).toBe(
			'CONFIRM_ATTRIBUTE_WITH_CODE',
		);
		expect(result.nextStep.codeDeliveryDetails.deliveryMedium).toBe(
			mockCodeDelivery.email.deliveryMedium,
		);
		expect(result.nextStep.codeDeliveryDetails.attributeName).toBe('email');
	});
});
