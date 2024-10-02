import { decodeJWT } from '@aws-amplify/core/internals/utils';

import { refreshAuthTokens } from '../../../src/providers/cognito/utils/refreshAuthTokens';
import { CognitoAuthTokens } from '../../../src/providers/cognito/tokenProvider/types';
import {
	oAuthTokenRefreshException,
	tokenRefreshException,
} from '../../../src/providers/cognito/utils/types';
import { createInitiateAuthClient } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../../../src/providers/cognito/factories';

import { mockAccessToken, mockRequestId } from './testUtils/data';

jest.mock(
	'../../../src/foundation/factories/serviceClients/cognitoIdentityProvider',
);
jest.mock('../../../src/providers/cognito/factories');

const mockCreateInitiateAuthClient = jest.mocked(createInitiateAuthClient);
const mockCreateCognitoUserPoolEndpointResolver = jest.mocked(
	createCognitoUserPoolEndpointResolver,
);

describe('refreshToken', () => {
	const mockedUsername = 'mockedUsername';
	const mockedRefreshToken = 'mockedRefreshToken';
	const mockInitiateAuth = jest.fn();

	beforeEach(() => {
		mockCreateInitiateAuthClient.mockReturnValueOnce(mockInitiateAuth);
	});

	afterEach(() => {
		mockCreateInitiateAuthClient.mockClear();
		mockCreateCognitoUserPoolEndpointResolver.mockClear();
	});

	describe('positive cases', () => {
		beforeEach(() => {
			mockInitiateAuth.mockResolvedValue({
				AuthenticationResult: {
					AccessToken: mockAccessToken,
					ExpiresIn: 3600,
					IdToken: mockAccessToken,
					TokenType: 'Bearer',
				},
				ChallengeParameters: {},
				$metadata: {
					attempts: 1,
					httpStatusCode: 200,
					requestId: mockRequestId,
				},
			});
		});

		afterEach(() => {
			mockInitiateAuth.mockReset();
		});

		it('should refresh token', async () => {
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
			});

			// stringify and re-parse for JWT equality
			expect(JSON.parse(JSON.stringify(response))).toMatchObject(
				JSON.parse(JSON.stringify(expectedOutput)),
			);
			expect(mockInitiateAuth).toHaveBeenCalledWith(
				expect.objectContaining({ region: 'us-east-1' }),
				expect.objectContaining({
					ClientId: 'aaaaaaaaaaaa',
					AuthFlow: 'REFRESH_TOKEN_AUTH',
					AuthParameters: {
						REFRESH_TOKEN: mockedRefreshToken,
					},
				}),
			);
		});

		it('should send UserContextData', async () => {
			(window as any).AmazonCognitoAdvancedSecurityData = {
				getData() {
					return 'abcd';
				},
			};
			await refreshAuthTokens({
				username: 'username',
				tokens: {
					accessToken: decodeJWT(
						'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0',
					),
					idToken: decodeJWT(
						'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0',
					),
					clockDrift: 0,
					refreshToken: 'refreshtoken',
					username: 'username',
				},
				authConfig: {
					Cognito: {
						userPoolId: 'us-east-1_aaaaaaa',
						userPoolClientId: 'aaaaaaaaaaaa',
					},
				},
			});
			expect(mockInitiateAuth).toHaveBeenCalledWith(
				expect.objectContaining({ region: 'us-east-1' }),
				expect.objectContaining({
					AuthFlow: 'REFRESH_TOKEN_AUTH',
					AuthParameters: { REFRESH_TOKEN: 'refreshtoken' },
					ClientId: 'aaaaaaaaaaaa',
					UserContextData: { EncodedData: 'abcd' },
				}),
			);
			(window as any).AmazonCognitoAdvancedSecurityData = undefined;
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
			expect(mockCreateInitiateAuthClient).toHaveBeenCalledWith({
				endpointResolver: expectedEndpointResolver,
			});
		});
	});

	describe('negative cases', () => {
		const mockedError = new Error('Refresh Token has expired');
		mockedError.name = 'NotAuthorizedException';
		beforeEach(() => {
			mockInitiateAuth.mockImplementationOnce(() => {
				throw mockedError;
			});
		});

		afterEach(() => {
			mockInitiateAuth.mockReset();
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
