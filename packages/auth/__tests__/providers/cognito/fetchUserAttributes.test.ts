// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { decodeJWT } from '@aws-amplify/core/internals/utils';

import { AuthError } from '../../../src/errors/AuthError';
import { GetUserException } from '../../../src/providers/cognito/types/errors';
import { fetchUserAttributes } from '../../../src/providers/cognito/apis/fetchUserAttributes';
import { createGetUserClient } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../../../src/providers/cognito/factories';
import { createMockAmplifyContext } from '../../testUtils/mockAmplifyContext';

import { getMockError, mockAccessToken } from './testUtils/data';

jest.mock(
	'../../../src/foundation/factories/serviceClients/cognitoIdentityProvider',
);
jest.mock('../../../src/providers/cognito/factories');

describe('fetchUserAttributes', () => {
	// assert mocks
	const mockGetUser = jest.fn();
	const mockCreateGetUserClient = jest.mocked(createGetUserClient);
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
		mockGetUser.mockResolvedValue({
			UserAttributes: [
				{ Name: 'email', Value: 'XXXXXXXXXXXXX' },
				{ Name: 'phone_number', Value: '000000000000000' },
			],
			Username: 'XXXXXXXX',
			PreferredMfaSetting: 'SMS_MFA',
			UserMFASettingList: ['SMS_MFA', 'SOFTWARE_TOKEN_MFA'],
			$metadata: {},
		});
		mockCreateGetUserClient.mockReturnValueOnce(mockGetUser);
	});

	afterEach(() => {
		mockGetUser.mockReset();
		(mockCtx.fetchAuthSession as jest.Mock).mockClear();
		mockCreateGetUserClient.mockClear();
	});

	it('should return the current user attributes into a map format', async () => {
		expect(await fetchUserAttributes(mockCtx)).toEqual({
			email: 'XXXXXXXXXXXXX',
			phone_number: '000000000000000',
		});
		expect(mockGetUser).toHaveBeenCalledTimes(1);
		expect(mockGetUser).toHaveBeenCalledWith(
			{
				region: 'us-west-2',
				userAgentValue: expect.any(String),
			},
			{
				AccessToken: mockAccessToken,
			},
		);
	});

	it('invokes mockCreateCognitoUserPoolEndpointResolver with expected endpointOverride', async () => {
		const expectedUserPoolEndpoint = 'https://my-custom-endpoint.com';
		const endpointCtx = createMockAmplifyContext({
			Auth: {
				Cognito: {
					userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					userPoolId: 'us-west-2_zzzzz',
					identityPoolId: 'us-west-2:xxxxxx',
					userPoolEndpoint: expectedUserPoolEndpoint,
				},
			},
		});
		(endpointCtx.fetchAuthSession as jest.Mock).mockResolvedValue({
			tokens: { accessToken: decodeJWT(mockAccessToken) },
		});
		await fetchUserAttributes(endpointCtx);

		expect(mockCreateCognitoUserPoolEndpointResolver).toHaveBeenCalledWith({
			endpointOverride: expectedUserPoolEndpoint,
		});
	});

	it('should throw an error when service returns an error response', async () => {
		expect.assertions(2);
		mockGetUser.mockImplementation(() => {
			throw getMockError(GetUserException.InvalidParameterException);
		});
		(mockCtx.fetchAuthSession as jest.Mock).mockResolvedValueOnce({
			tokens: {
				accessToken: decodeJWT(mockAccessToken),
			},
		});

		try {
			await fetchUserAttributes(mockCtx);
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(GetUserException.InvalidParameterException);
		}
	});
});
