// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import { decodeJWT } from '@aws-amplify/core/internals/utils';

import { AuthError } from '../../../src/errors/AuthError';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { VerifySoftwareTokenException } from '../../../src/providers/cognito/types/errors';
import { verifyTOTPSetup } from '../../../src/providers/cognito';
import { createVerifySoftwareTokenClient } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
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

describe('verifyTOTPSetup', () => {
	const code = '123456';
	const friendlyDeviceName = 'FriendlyDeviceName';
	// assert mocks
	const mockFetchAuthSession = fetchAuthSession as jest.Mock;
	const mockVerifySoftwareToken = jest.fn();
	const mockCreateVerifySoftwareTokenClient = jest.mocked(
		createVerifySoftwareTokenClient,
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
		mockVerifySoftwareToken.mockResolvedValue({});
		mockCreateVerifySoftwareTokenClient.mockReturnValueOnce(
			mockVerifySoftwareToken,
		);
	});

	afterEach(() => {
		mockVerifySoftwareToken.mockReset();
		mockFetchAuthSession.mockClear();
		mockCreateVerifySoftwareTokenClient.mockClear();
	});

	it('should return successful response', async () => {
		await verifyTOTPSetup({
			code,
			options: { friendlyDeviceName },
		});

		expect(mockVerifySoftwareToken).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockAccessToken,
				UserCode: code,
				FriendlyDeviceName: friendlyDeviceName,
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

		await verifyTOTPSetup({
			code,
			options: { friendlyDeviceName },
		});

		expect(mockCreateCognitoUserPoolEndpointResolver).toHaveBeenCalledWith({
			endpointOverride: expectedUserPoolEndpoint,
		});
	});

	it('should throw an error when code is empty', async () => {
		expect.assertions(2);
		try {
			await verifyTOTPSetup({ code: '' });
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.EmptyVerifyTOTPSetupCode);
		}
	});

	it('should throw an error when service returns an error response', async () => {
		expect.assertions(2);
		mockVerifySoftwareToken.mockImplementation(() => {
			throw getMockError(
				VerifySoftwareTokenException.InvalidParameterException,
			);
		});
		try {
			await verifyTOTPSetup({ code });
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				VerifySoftwareTokenException.InvalidParameterException,
			);
		}
	});
});
