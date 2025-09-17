// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { decodeJWT } from '@aws-amplify/core/internals/utils';

import { refreshAuthTokens } from '../../../src/providers/cognito/utils/refreshAuthTokens';
import { CognitoAuthTokens } from '../../../src/providers/cognito/tokenProvider/types';
import {
	oAuthTokenRefreshException,
	tokenRefreshException,
} from '../../../src/providers/cognito/utils/types';
import { createGetTokensFromRefreshTokenClient } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../../../src/providers/cognito/factories';

import { mockAccessToken, mockRequestId } from './testUtils/data';

jest.mock(
	'../../../src/foundation/factories/serviceClients/cognitoIdentityProvider',
);
jest.mock('../../../src/providers/cognito/factories');

const mockCreateGetTokensFromRefreshTokenClient = jest.mocked(
	createGetTokensFromRefreshTokenClient,
);
const mockCreateCognitoUserPoolEndpointResolver = jest.mocked(
	createCognitoUserPoolEndpointResolver,
);

describe('refreshToken', () => {
	const mockedUsername = 'mockedUsername';
	const mockedRefreshToken = 'mockedRefreshToken';
	const mockGetTokensFromRefreshToken = jest.fn();

	beforeEach(() => {
		mockCreateGetTokensFromRefreshTokenClient.mockReturnValueOnce(
			mockGetTokensFromRefreshToken,
		);
	});

	afterEach(() => {
		mockCreateCognitoUserPoolEndpointResolver.mockClear();
	});

	describe('positive cases', () => {
		beforeEach(() => {
			mockGetTokensFromRefreshToken.mockResolvedValue({
				AuthenticationResult: {
					AccessToken: mockAccessToken,
					ExpiresIn: 3600,
					IdToken: mockAccessToken,
					TokenType: 'Bearer',
				},
				$metadata: {
					attempts: 1,
					httpStatusCode: 200,
					requestId: mockRequestId,
				},
			});
		});

		afterEach(() => {
			mockGetTokensFromRefreshToken.mockReset();
		});

		it('should refresh token', async () => {
			const clientMetadata = { 'app-version': '1.0.0' };
			const expectedOutput = {
				accessToken: decodeJWT(mockAccessToken),
				idToken: decodeJWT(mockAccessToken),
				refreshToken: mockedRefreshToken,
				username: mockedUsername,
			} as CognitoAuthTokens;

			const response = await refreshAuthTokens({
				tokens: {
					accessToken: { payload: {} },
					idToken: { payload: {} },
					clockDrift: 0,
					refreshToken: mockedRefreshToken,
					username: mockedUsername,
				},
				authConfig: {
					Cognito: {
						userPoolId: 'us-east-1_aaaaaaa',
						userPoolClientId: 'aaaaaaaaaaaa',
					},
				},
				username: mockedUsername,
				clientMetadata,
			});

			// stringify and re-parse for JWT equality
			expect(JSON.parse(JSON.stringify(response))).toMatchObject(
				JSON.parse(JSON.stringify(expectedOutput)),
			);
			expect(mockGetTokensFromRefreshToken).toHaveBeenCalledWith(
				expect.objectContaining({ region: 'us-east-1' }),
				expect.objectContaining({
					ClientId: 'aaaaaaaaaaaa',
					RefreshToken: mockedRefreshToken,
					ClientMetadata: clientMetadata,
				}),
			);
		});

		it('invokes mockCreateCognitoUserPoolEndpointResolver with expected parameters', async () => {
			const expectedParam = 'https://my-custom-endpoint.com';
			const expectedEndpointResolver = jest.fn();
			mockCreateCognitoUserPoolEndpointResolver.mockReturnValueOnce(
				expectedEndpointResolver,
			);

			await refreshAuthTokens({
				username: 'username',
				tokens: {
					accessToken: { payload: {} },
					idToken: { payload: {} },
					clockDrift: 0,
					refreshToken: 'refreshtoken',
					username: 'username',
				},
				authConfig: {
					Cognito: {
						userPoolId: 'us-east-1_aaaaaaa',
						userPoolClientId: 'aaaaaaaaaaaa',
						userPoolEndpoint: expectedParam,
					},
				},
			});

			expect(mockCreateCognitoUserPoolEndpointResolver).toHaveBeenCalledWith({
				endpointOverride: expectedParam,
			});
			expect(mockCreateGetTokensFromRefreshTokenClient).toHaveBeenCalledWith({
				endpointResolver: expectedEndpointResolver,
			});
		});
	});

	describe('negative cases', () => {
		const mockedError = new Error('Refresh Token has expired');
		mockedError.name = 'NotAuthorizedException';
		beforeEach(() => {
			mockGetTokensFromRefreshToken.mockImplementationOnce(() => {
				throw mockedError;
			});
		});

		afterEach(() => {
			mockGetTokensFromRefreshToken.mockReset();
		});

		it('should throw an exception when refresh_token is not available', async () => {
			await expect(
				refreshAuthTokens({
					tokens: {
						accessToken: { payload: {} },
						idToken: { payload: {} },
						clockDrift: 0,
						username: mockedUsername,
					},
					authConfig: {
						Cognito: {
							userPoolId: 'us-east-1_aaaaaaa',
							userPoolClientId: 'aaaaaaaaaaaa',
						},
					},
					username: mockedUsername,
				}),
			).rejects.toThrow(oAuthTokenRefreshException);
		});

		it('should throw an exception when cognito tokens are not available', async () => {
			await expect(
				refreshAuthTokens({
					tokens: {} as any,
					authConfig: {
						Cognito: {
							userPoolId: 'us-east-1_aaaaaaa',
							userPoolClientId: 'aaaaaaaaaaaa',
						},
					},
					username: mockedUsername,
				}),
			).rejects.toThrow(tokenRefreshException);
		});

		it('should throw an exception when the refresh_token is invalid', async () => {
			await expect(
				refreshAuthTokens({
					tokens: {
						accessToken: { payload: {} },
						idToken: { payload: {} },
						refreshToken: mockedRefreshToken,
						clockDrift: 0,
						username: mockedUsername,
					},
					authConfig: {
						Cognito: {
							userPoolId: 'us-east-1_aaaaaaa',
							userPoolClientId: 'aaaaaaaaaaaa',
						},
					},
					username: mockedUsername,
				}),
			).rejects.toThrow(mockedError);
		});
	});
});
