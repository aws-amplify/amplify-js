// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { sendUserAttributeVerificationCode, signIn } from '../src';

import { mockCodeDelivery } from './mocks/handlers';

describe('sendUserAttributeVerificationCode Integration Tests', () => {
	beforeEach(async () => {
		await signIn({
			username: 'testuser',
			password: 'TestPassword123!',
		});
	});

	it('should send verification code for email', async () => {
		const result = await sendUserAttributeVerificationCode({
			userAttributeKey: 'email',
		});

		expect(result.destination).toBe(mockCodeDelivery.email.destination);
		expect(result.deliveryMedium).toBe(mockCodeDelivery.email.deliveryMedium);
		expect(result.attributeName).toBe('email');
	});

	it('should send verification code for phone number', async () => {
		const result = await sendUserAttributeVerificationCode({
			userAttributeKey: 'phone_number',
		});

		expect(result.destination).toBe(mockCodeDelivery.phone.destination);
		expect(result.deliveryMedium).toBe(mockCodeDelivery.phone.deliveryMedium);
		expect(result.attributeName).toBe('phone_number');
	});
});
