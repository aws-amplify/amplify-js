// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import { decodeJWT } from '@aws-amplify/core/internals/utils';

import { AuthError } from '../../../src/errors/AuthError';
import { sendUserAttributeVerificationCode } from '../../../src/providers/cognito';
import { GetUserAttributeVerificationException } from '../../../src/providers/cognito/types/errors';
import { createGetUserAttributeVerificationCodeClient } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../../../src/providers/cognito/factories';

import { authAPITestParams } from './testUtils/authApiTestParams';
import { getMockError, mockAccessToken } from './testUtils/data';
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
	'../../../src/foundation/factories/serviceClients/cognitoIdentityProvider',
);
jest.mock('../../../src/providers/cognito/factories');

describe('sendUserAttributeVerificationCode', () => {
	// assert mocks
	const mockFetchAuthSession = fetchAuthSession as jest.Mock;
	const mockGetUserAttributeVerificationCode = jest.fn();
	const mockCreateGetUserAttributeVerificationCodeClient = jest.mocked(
		createGetUserAttributeVerificationCodeClient,
	);
	const mockCreateCognitoUserPoolEndpointResolver = jest.mocked(
		createCognitoUserPoolEndpointResolver,
	);

	beforeAll(() => {
		setUpGetConfig(Amplify);
		mockFetchAuthSession.mockResolvedValue({
			tokens: { accessToken: decodeJWT(mockAccessToken) },
		});
	});

	beforeEach(() => {
		mockGetUserAttributeVerificationCode.mockResolvedValue(
			authAPITestParams.resendSignUpClientResult,
		);
		mockCreateGetUserAttributeVerificationCodeClient.mockReturnValueOnce(
			mockGetUserAttributeVerificationCode,
		);
	});

	afterEach(() => {
		mockGetUserAttributeVerificationCode.mockReset();
		mockFetchAuthSession.mockClear();
		mockCreateGetUserAttributeVerificationCodeClient.mockClear();
	});

	it('should return a result', async () => {
		const result = await sendUserAttributeVerificationCode({
			userAttributeKey: 'email',
			options: {
				clientMetadata: { foo: 'bar' },
			},
		});
		expect(result).toEqual(authAPITestParams.resendSignUpAPIResult);

		expect(mockGetUserAttributeVerificationCode).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockAccessToken,
				AttributeName: 'email',
				ClientMetadata: { foo: 'bar' },
			}),
		);
		expect(mockGetUserAttributeVerificationCode).toHaveBeenCalledTimes(1);
	});

	it('invokes mockCreateCognitoUserPoolEndpointResolver with expected endpointOverride', async () => {
		const expectedUserPoolEndpoint = 'https://my-custom-endpoint.com';
		jest.mocked(Amplify.getConfig).mockReturnValueOnce({
			Auth: {
				Cognito: {
					userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					userPoolId: 'us-west-2_zzzzz',
					identityPoolId: 'us-west-2:xxxxxx',
					userPoolEndpoint: expectedUserPoolEndpoint,
				},
			},
		});
		await sendUserAttributeVerificationCode({
			userAttributeKey: 'email',
			options: {
				clientMetadata: { foo: 'bar' },
			},
		});

		expect(mockCreateCognitoUserPoolEndpointResolver).toHaveBeenCalledWith({
			endpointOverride: expectedUserPoolEndpoint,
		});
	});

	it('should throw an error when service returns an error response', async () => {
		expect.assertions(2);
		mockGetUserAttributeVerificationCode.mockImplementation(() => {
			throw getMockError(
				GetUserAttributeVerificationException.InvalidParameterException,
			);
		});
		try {
			await sendUserAttributeVerificationCode({
				userAttributeKey: 'email',
				options: {
					clientMetadata: { foo: 'bar' },
				},
			});
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				GetUserAttributeVerificationException.InvalidParameterException,
			);
		}
	});
});
