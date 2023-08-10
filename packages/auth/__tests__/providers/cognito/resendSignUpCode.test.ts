// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { resendSignUpCode } from '../../../src/providers/cognito';
import { authAPITestParams } from './testUtils/authApiTestParams';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { AuthError } from '../../../src/errors/AuthError';
import { ResendConfirmationException } from '../../../src/providers/cognito/types/errors';
import { AmplifyErrorString, AmplifyV6 } from '@aws-amplify/core';
import * as resendSignUpConfirmationCodeClient from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { ResendConfirmationCodeCommandOutput } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';

describe('ResendSignUp API Happy Path Cases:', () => {
	let resendSignUpSpy;
	const { user1 } = authAPITestParams;
	beforeEach(() => {
		resendSignUpSpy = jest
			.spyOn(resendSignUpConfirmationCodeClient, 'resendConfirmationCode')
			.mockImplementationOnce(async () => {
				return authAPITestParams.resendSignUpClientResult as ResendConfirmationCodeCommandOutput;
			});
	});
	afterEach(() => {
		resendSignUpSpy.mockClear();
	});
	test('ResendSignUp API should call the UserPoolClient and should return a ResendSignUpCodeResult', async () => {
		AmplifyV6.configure({
			Auth: {
				userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				userPoolId: 'us-west-2_zzzzz',
			},
		});
		const result = await resendSignUpCode({
			username: user1.username,
		});
		expect(result).toEqual(authAPITestParams.resendSignUpAPIResult);
		expect(resendSignUpSpy).toHaveBeenCalledWith({
			ClientMetadata: undefined,
			Username: user1.username,
		});
		expect(resendSignUpSpy).toBeCalledTimes(1);
	});
});

describe('ResendSignUp API Error Path Cases:', () => {
	const { user1 } = authAPITestParams;
	const globalMock = global as any;

	test('ResendSignUp API should throw a validation AuthError when username is empty', async () => {
		expect.assertions(2);
		try {
			AmplifyV6.configure({
				Auth: {
					userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					userPoolId: 'us-west-2_zzzzz',
				},
			});
			await resendSignUpCode({ username: '' });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.EmptySignUpUsername);
		}
	});

	test('ResendSignUp API should expect a service error', async () => {
		expect.assertions(2);
		const serviceError = new Error('service error');
		serviceError.name = ResendConfirmationException.InvalidParameterException;
		globalMock.fetch = jest.fn(() => Promise.reject(serviceError));
		try {
			AmplifyV6.configure({
				Auth: {
					userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					userPoolId: 'us-west-2_zzzzz',
				},
			});
			await resendSignUpCode({ username: user1.username });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				ResendConfirmationException.InvalidParameterException
			);
		}
	});

	test('ResendSignUp API should throw an unknown error when underlying error is not from the service', async () => {
		expect.assertions(3);
		globalMock.fetch = jest.fn(() =>
			Promise.reject(new Error('unknown error'))
		);
		try {
			AmplifyV6.configure({
				Auth: {
					userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					userPoolId: 'us-west-2_zzzzz',
				},
			});
			await resendSignUpCode({ username: user1.username });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AmplifyErrorString.UNKNOWN);
			expect(error.underlyingError).toBeInstanceOf(Error);
		}
	});

	test('ResendSignUp API should expect an unknown error when the underlying error is null', async () => {
		expect.assertions(3);
		globalMock.fetch = jest.fn(() => Promise.reject(null));
		try {
			AmplifyV6.configure({
				Auth: {
					userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					userPoolId: 'us-west-2_zzzzz',
				},
			});
			await resendSignUpCode({ username: user1.username });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AmplifyErrorString.UNKNOWN);
			expect(error.underlyingError).toBe(null);
		}
	});
});

describe('ResendSignUp API Edge Cases:', () => {});
