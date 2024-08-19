// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { signUp } from '../../../src/providers/cognito';
import { signUp as providerSignUp } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { AuthError } from '../../../src/errors/AuthError';
import { SignUpException } from '../../../src/providers/cognito/types/errors';

import { authAPITestParams } from './testUtils/authApiTestParams';
import { getMockError } from './testUtils/data';
import { setUpGetConfig } from './testUtils/setUpGetConfig';

jest.mock('@aws-amplify/core', () => ({
	...(jest.createMockFromModule('@aws-amplify/core') as object),
	Amplify: { getConfig: jest.fn(() => ({})) },
}));
jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	isBrowser: jest.fn(() => false),
}));
jest.mock(
	'../../../src/providers/cognito/utils/clients/CognitoIdentityProvider',
);

const userId = '1234567890';

describe('signUp', () => {
	const { user1 } = authAPITestParams;
	// assert mocks
	const mockSignUp = providerSignUp as jest.Mock;

	beforeAll(() => {
		setUpGetConfig(Amplify);
	});

	describe('Happy Path Cases:', () => {
		beforeEach(() => {
			mockSignUp.mockResolvedValue(authAPITestParams.signUpHttpCallResult);
		});

		afterEach(() => {
			mockSignUp.mockReset();
		});

		it('should call SignUp service client with correct params', async () => {
			await signUp({
				username: user1.username,
				password: user1.password,
				options: {
					userAttributes: { email: user1.email },
				},
			});
			expect(mockSignUp).toHaveBeenCalledWith(
				{
					region: 'us-west-2',
					userAgentValue: expect.any(String),
				},
				{
					ClientMetadata: undefined,
					Password: user1.password,
					UserAttributes: [{ Name: 'email', Value: user1.email }],
					Username: user1.username,
					ValidationData: undefined,
					ClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				},
			);
			expect(mockSignUp).toHaveBeenCalledTimes(1);
		});

		it('should return `CONFIRM_SIGN_UP` step when user isn`t confirmed yet', async () => {
			const result = await signUp({
				username: user1.username,
				password: user1.password,
				options: {
					userAttributes: { email: user1.email },
				},
			});
			expect(result).toEqual({
				isSignUpComplete: false,
				nextStep: {
					signUpStep: 'CONFIRM_SIGN_UP',
					codeDeliveryDetails: {
						destination: user1.email,
						deliveryMedium: 'EMAIL',
						attributeName: 'email',
					},
				},
				userId,
			});
		});

		it('should return `DONE` step when user is confirmed', async () => {
			mockSignUp.mockResolvedValue({
				UserConfirmed: true,
				UserSub: userId,
			});
			const result = await signUp({
				username: user1.username,
				password: user1.password,
				options: {
					userAttributes: { email: user1.email },
				},
			});
			expect(result).toEqual({
				isSignUpComplete: true,
				nextStep: {
					signUpStep: 'DONE',
				},
				userId,
			});
		});

		it('should return `COMPLETE_AUTO_SIGN_IN` step with `isSignUpComplete` false when autoSignIn is enabled and user isn`t confirmed yet', async () => {
			// set up signUpVerificationMethod as link in auth config
			(Amplify.getConfig as any).mockReturnValue({
				Auth: {
					Cognito: {
						userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
						userPoolId: 'us-west-2_zzzzz',
						identityPoolId: 'us-west-2:xxxxxx',
						signUpVerificationMethod: 'link',
					},
				},
			});

			const result = await signUp({
				username: user1.username,
				password: user1.password,
				options: {
					userAttributes: { email: user1.email },
					autoSignIn: true,
				},
			});

			expect(result).toEqual({
				isSignUpComplete: false,
				nextStep: {
					signUpStep: 'COMPLETE_AUTO_SIGN_IN',
					codeDeliveryDetails: {
						destination: user1.email,
						deliveryMedium: 'EMAIL',
						attributeName: 'email',
					},
				},
				userId,
			});
		});

		it('should return `COMPLETE_AUTO_SIGN_IN` step with `isSignUpComplete` true when autoSignIn is enabled and user is confirmed', async () => {
			mockSignUp.mockResolvedValue({
				UserConfirmed: true,
				UserSub: userId,
			});

			const result = await signUp({
				username: user1.username,
				password: user1.password,
				options: {
					userAttributes: { email: user1.email },
					autoSignIn: true,
				},
			});

			expect(result).toEqual({
				isSignUpComplete: true,
				nextStep: {
					signUpStep: 'COMPLETE_AUTO_SIGN_IN',
				},
				userId,
			});
		});

		it('should send UserContextData', async () => {
			(window as any).AmazonCognitoAdvancedSecurityData = {
				getData() {
					return 'abcd';
				},
			};
			await signUp({
				username: user1.username,
				password: user1.password,
				options: {
					userAttributes: { email: user1.email },
				},
			});
			expect(mockSignUp).toHaveBeenCalledWith(
				{
					region: 'us-west-2',
					userAgentValue: expect.any(String),
				},
				{
					ClientMetadata: undefined,
					Password: user1.password,
					UserAttributes: [{ Name: 'email', Value: user1.email }],
					Username: user1.username,
					ValidationData: undefined,
					ClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					UserContextData: { EncodedData: 'abcd' },
				},
			);
			expect(mockSignUp).toHaveBeenCalledTimes(1);
			(window as any).AmazonCognitoAdvancedSecurityData = undefined;
		});
	});

	describe('Error Path Cases:', () => {
		beforeEach(() => {
			mockSignUp.mockResolvedValue(authAPITestParams.signUpHttpCallResult);
		});

		afterEach(() => {
			mockSignUp.mockReset();
		});

		it('should throw an error when username is empty', async () => {
			expect.assertions(2);
			try {
				await signUp({ username: '', password: user1.password });
			} catch (error: any) {
				expect(error).toBeInstanceOf(AuthError);
				expect(error.name).toBe(AuthValidationErrorCode.EmptySignUpUsername);
			}
		});

		it('should throw an error when password is empty', async () => {
			expect.assertions(2);
			try {
				await signUp({ username: user1.username, password: '' });
			} catch (error: any) {
				expect(error).toBeInstanceOf(AuthError);
				expect(error.name).toBe(AuthValidationErrorCode.EmptySignUpPassword);
			}
		});

		it('should throw an error when service returns an error response', async () => {
			expect.assertions(2);
			mockSignUp.mockImplementation(() => {
				throw getMockError(SignUpException.InvalidParameterException);
			});
			try {
				await signUp({ username: user1.username, password: user1.password });
			} catch (error: any) {
				expect(error).toBeInstanceOf(AuthError);
				expect(error.name).toBe(SignUpException.InvalidParameterException);
			}
		});
	});
});
