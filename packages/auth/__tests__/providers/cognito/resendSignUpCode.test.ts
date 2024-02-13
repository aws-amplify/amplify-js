// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { resendSignUpCode } from '../../../src/providers/cognito';
import { authAPITestParams } from './testUtils/authApiTestParams';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { AuthError } from '../../../src/errors/AuthError';
import { ResendConfirmationException } from '../../../src/providers/cognito/types/errors';
import { resendConfirmationCode } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
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
	'../../../src/providers/cognito/utils/clients/CognitoIdentityProvider'
);

describe('resendSignUpCode', () => {
	const { user1 } = authAPITestParams;
	// assert mocks
	const mockResendConfirmationCode = resendConfirmationCode as jest.Mock;

	beforeAll(() => {
		setUpGetConfig(Amplify);
	});

	beforeEach(() => {
		mockResendConfirmationCode.mockResolvedValue(
			authAPITestParams.resendSignUpClientResult
		);
	});

	afterEach(() => {
		mockResendConfirmationCode.mockReset();
	});

	it('should call resendConfirmationCode and return a result', async () => {
		const result = await resendSignUpCode({
			username: user1.username,
		});
		expect(result).toEqual(authAPITestParams.resendSignUpAPIResult);
		expect(mockResendConfirmationCode).toHaveBeenCalledWith(
			{
				region: 'us-west-2',
				userAgentValue: expect.any(String),
			},
			{
				ClientMetadata: undefined,
				Username: user1.username,
				ClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				AnalyticsMetadata: {
					AnalyticsEndpointId: undefined,
				},
			}
		);
		expect(mockResendConfirmationCode).toHaveBeenCalledTimes(1);
	});

	it('should throw an error when username is empty', async () => {
		expect.assertions(2);
		try {
			await resendSignUpCode({ username: '' });
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.EmptySignUpUsername);
		}
	});

	it('should throw an error when service returns an error response', async () => {
		expect.assertions(2);
		mockResendConfirmationCode.mockImplementation(() => {
			throw getMockError(ResendConfirmationException.InvalidParameterException);
		});
		try {
			await resendSignUpCode({ username: user1.username });
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				ResendConfirmationException.InvalidParameterException
			);
		}
	});

	it('should send UserContextData', async () => {
		window['AmazonCognitoAdvancedSecurityData'] = {
			getData() {
				return 'abcd';
			},
		};
		const result = await resendSignUpCode({
			username: user1.username,
		});
		expect(result).toEqual(authAPITestParams.resendSignUpAPIResult);
		expect(mockResendConfirmationCode).toHaveBeenCalledWith(
			{
				region: 'us-west-2',
				userAgentValue: expect.any(String),
			},
			{
				ClientMetadata: undefined,
				Username: user1.username,
				ClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				UserContextData: { EncodedData: 'abcd' },
				AnalyticsMetadata: {
					AnalyticsEndpointId: undefined,
				},
			}
		);
		expect(mockResendConfirmationCode).toHaveBeenCalledTimes(1);
		window['AmazonCognitoAdvancedSecurityData'] = undefined;
	});
});
