import { decodeJWT } from '@aws-amplify/core/internals/utils';
import { createAuthTokenRefresher } from '../../../src/providers/cognito/utils/createAuthTokenRefresher';
import { CognitoAuthTokens } from '../../../src/providers/cognito/tokenProvider/types';
import { initiateAuth } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { mockAccessToken, mockRequestId } from './testUtils/data';
import {
	oAuthTokenRefreshException,
	tokenRefreshException,
} from '../../../src/providers/cognito/utils/types';
jest.mock(
	'../../../src/providers/cognito/utils/clients/CognitoIdentityProvider',
);

describe('refreshToken', () => {
	const mockedUsername = 'mockedUsername';
	const mockedRefreshToken = 'mockedRefreshToken';
	const refreshAuthTokens = createAuthTokenRefresher();
	// assert mocks
	const mockInitiateAuth = initiateAuth as jest.Mock;
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
			window['AmazonCognitoAdvancedSecurityData'] = {
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
			window['AmazonCognitoAdvancedSecurityData'] = undefined;
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
					// @ts-ignore
					tokens: {},
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
