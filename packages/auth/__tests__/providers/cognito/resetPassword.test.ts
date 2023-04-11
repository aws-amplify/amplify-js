// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { ForgotPasswordCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
import { resetPassword } from '../../../src/providers/cognito';
import * as resetPasswordClient from '../../../src/providers/cognito/utils/clients/ResetPasswordClient';
import { authAPITestParams } from './testUtils/authApiTestParams';

describe('ResetPassword API happy paths', () => {
	let resetPasswordSpy;

	beforeEach(() => {
		resetPasswordSpy = jest.spyOn(resetPasswordClient, 'resetPasswordClient')
			.mockImplementation(async (params: resetPasswordClient.ResetPasswordClientInput) => {
				return {
					CodeDeliveryDetails: {
						AttributeName: 'email',
						DeliveryMedium: 'EMAIL',
						Destination: 'test@email.com'
					},
				} as ForgotPasswordCommandOutput;
			});
	});

	afterEach(() => {
		resetPasswordSpy.mockClear();
	});

	test('ResetPassword API should call the UserPoolClient and should return a ResetPasswordResult', async () => {
		const result = await resetPassword({username: 'username'});
		expect(result).toEqual(authAPITestParams.resetPasswordResult);
	});

	test('ResetPassword API input should contain clientMetadata from request', async () => {
		await resetPassword(authAPITestParams.resetPasswordRequestWithClientMetadata);
		expect(resetPasswordSpy).toHaveBeenCalledWith(
			expect.objectContaining(authAPITestParams.forgotPasswordCommandWithClientMetadata)
		);
	});

	test('ResetPassword API input should contain clientMetadata from config', async () => {
		Amplify.configure(authAPITestParams.configWithClientMetadata);
		await resetPassword({username: 'username'});
		expect(resetPasswordSpy).toHaveBeenCalledWith(
			expect.objectContaining(authAPITestParams.forgotPasswordCommandWithClientMetadata)
		);
	});

});

describe('ResetPassword API Error Path Cases:', () => {
	// TODO: write tests after Error Handling is implemented
});
