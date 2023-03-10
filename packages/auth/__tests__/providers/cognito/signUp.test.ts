// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { SignUpCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
import { AuthSignUpStep, signUp } from '../../..';
import {
	SignUpClientInput,
	UserpoolClient,
} from '../../../lib/providers/cognito/utils/clients/UserPoolClient';
import { testParams } from './testUtils/testParams';

let signUpSpy;

describe('SignUp API Happy Path Cases:', () => {
	beforeEach(() => {
		signUpSpy = jest
			.spyOn(UserpoolClient, 'signUp')
			.mockImplementation(async (params: SignUpClientInput) => {
				return {
					UserConfirmed: false,
					UserSub: '1234567890',
					CodeDeliveryDetails: {
						AttributeName: 'email',
						DeliveryMedium: 'EMAIL',
						Destination: testParams.user1.email,
					},
				} as SignUpCommandOutput;
			});
	});
	afterEach(() => {
		signUpSpy.mockClear();
	});
	test('SignUp API should call the UserPoolClient and should return a SignUpResult', async () => {
		const result = await signUp({
			username: testParams.user1.username,
			password: testParams.user1.password,
			options: {
				userAttributes: [
					{ userAttributeKey: 'email', value: testParams.user1.email },
				],
			},
		});
		expect(result).toEqual({
			isSignUpComplete: false,
			nextStep: {
				signUpStep: AuthSignUpStep.CONFIRM_SIGN_UP,
				codeDeliveryDetails: {
					destination: testParams.user1.email,
					deliveryMedium: 'EMAIL',
					attributeName: 'email',
				},
			},
		});
		expect(signUpSpy).toHaveBeenCalledWith({
			ClientMetadata: undefined,
			Password: testParams.user1.password,
			UserAttributes: [{ Name: 'email', Value: testParams.user1.email }],
			Username: testParams.user1.username,
			ValidationData: undefined,
		});
		expect(signUpSpy).toBeCalledTimes(1);
	});
});

describe('SignUp API Error Path Cases:', () => {});

describe('SignUp API Edge Cases:', () => {});
