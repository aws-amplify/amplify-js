// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { decodeJWT } from '@aws-amplify/core/internals/utils';

import { AuthError } from '../../../src/errors/AuthError';
import { AssociateSoftwareTokenException } from '../../../src/providers/cognito/types/errors';
import { setUpTOTP } from '../../../src/providers/cognito';
import { createAssociateSoftwareTokenClient } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../../../src/providers/cognito/factories';
import { createMockAmplifyContext } from '../../testUtils/mockAmplifyContext';

import { getMockError, mockAccessToken } from './testUtils/data';

jest.mock(
	'../../../src/foundation/factories/serviceClients/cognitoIdentityProvider',
);
jest.mock('../../../src/providers/cognito/factories');

describe('setUpTOTP', () => {
	const secretCode = 'secret-code';
	// assert mocks
	const mockAssociateSoftwareToken = jest.fn();
	const mockCreateAssociateSoftwareTokenClient = jest.mocked(
		createAssociateSoftwareTokenClient,
	);
	const mockCreateCognitoUserPoolEndpointResolver = jest.mocked(
		createCognitoUserPoolEndpointResolver,
	);

	const mockCtx = createMockAmplifyContext({
		Auth: {
			Cognito: {
				userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				userPoolId: 'us-west-2_zzzzz',
				identityPoolId: 'us-west-2:xxxxxx',
			},
		},
	});

	beforeAll(() => {
		(mockCtx.fetchAuthSession as jest.Mock).mockResolvedValue({
			tokens: { accessToken: decodeJWT(mockAccessToken) },
		});
	});

	beforeEach(() => {
		mockAssociateSoftwareToken.mockResolvedValue({
			SecretCode: secretCode,
			$metadata: {},
		});
		mockCreateAssociateSoftwareTokenClient.mockReturnValueOnce(
			mockAssociateSoftwareToken,
		);
	});

	afterEach(() => {
		mockAssociateSoftwareToken.mockReset();
		(mockCtx.fetchAuthSession as jest.Mock).mockClear();
		mockCreateAssociateSoftwareTokenClient.mockClear();
	});

	it('setUpTOTP API should call the UserPoolClient and should return a TOTPSetupDetails', async () => {
		const result = await setUpTOTP(mockCtx);
		expect(mockAssociateSoftwareToken).toHaveBeenCalledWith(
			{
				region: 'us-west-2',
				userAgentValue: expect.any(String),
			},
			{
				AccessToken: mockAccessToken,
			},
		);
		expect(result.sharedSecret).toEqual(secretCode);
		expect(result.getSetupUri('appName', 'amplify')).toBeInstanceOf(URL);
	});

	it('invokes mockCreateCognitoUserPoolEndpointResolver with expected endpointOverride', async () => {
		const expectedUserPoolEndpoint = 'https://my-custom-endpoint.com';
		const customCtx = createMockAmplifyContext({
			Auth: {
				Cognito: {
					userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					userPoolId: 'us-west-2_zzzzz',
					identityPoolId: 'us-west-2:xxxxxx',
					userPoolEndpoint: expectedUserPoolEndpoint,
				},
			},
		});
		(customCtx.fetchAuthSession as jest.Mock).mockResolvedValue({
			tokens: { accessToken: decodeJWT(mockAccessToken) },
		});

		await setUpTOTP(customCtx);

		expect(mockCreateCognitoUserPoolEndpointResolver).toHaveBeenCalledWith({
			endpointOverride: expectedUserPoolEndpoint,
		});
	});

	it('should throw an error when service returns an error response', async () => {
		expect.assertions(2);
		mockAssociateSoftwareToken.mockImplementation(() => {
			throw getMockError(
				AssociateSoftwareTokenException.InvalidParameterException,
			);
		});
		try {
			await setUpTOTP(mockCtx);
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				AssociateSoftwareTokenException.InvalidParameterException,
			);
		}
	});
});
