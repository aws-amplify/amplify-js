// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import { decodeJWT } from '@aws-amplify/core/internals/utils';

import { AuthError } from '../../../src/errors/AuthError';
import { confirmUserAttribute } from '../../../src/providers/cognito';
import { VerifyUserAttributeException } from '../../../src/providers/cognito/types/errors';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { createVerifyUserAttributeClient } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../../../src/providers/cognito/factories';

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

describe('confirmUserAttribute', () => {
	const confirmationCode = '123456';
	// assert mocks
	const mockFetchAuthSession = fetchAuthSession as jest.Mock;
	const mockVerifyUserAttribute = jest.fn();
	const mockCreateVerifyUserAttributeClient = jest.mocked(
		createVerifyUserAttributeClient,
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
		mockVerifyUserAttribute.mockResolvedValue({ $metadata: {} });
		mockCreateVerifyUserAttributeClient.mockReturnValueOnce(
			mockVerifyUserAttribute,
		);
	});

	afterEach(() => {
		mockVerifyUserAttribute.mockReset();
		mockFetchAuthSession.mockClear();
		mockCreateVerifyUserAttributeClient.mockClear();
	});

	it('should call the service', async () => {
		await confirmUserAttribute({
			userAttributeKey: 'email',
			confirmationCode,
		});

		expect(mockVerifyUserAttribute).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockAccessToken,
				AttributeName: 'email',
				Code: confirmationCode,
			}),
		);
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
		await confirmUserAttribute({
			userAttributeKey: 'email',
			confirmationCode,
		});

		expect(mockCreateCognitoUserPoolEndpointResolver).toHaveBeenCalledWith({
			endpointOverride: expectedUserPoolEndpoint,
		});
	});

	it('should throw an error when confirmationCode is not defined', async () => {
		try {
			await confirmUserAttribute({
				userAttributeKey: 'email',
				confirmationCode: '',
			});
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				AuthValidationErrorCode.EmptyConfirmUserAttributeCode,
			);
		}
	});

	it('should throw an error when service returns an error response', async () => {
		expect.assertions(2);
		mockVerifyUserAttribute.mockImplementation(() => {
			throw getMockError(
				VerifyUserAttributeException.InvalidParameterException,
			);
		});
		try {
			await confirmUserAttribute({
				userAttributeKey: 'email',
				confirmationCode,
			});
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				VerifyUserAttributeException.InvalidParameterException,
			);
		}
	});
});
