import { decodeJWT } from '@aws-amplify/core/internals/utils';
import { refreshAuthTokens } from '../../../src/providers/cognito/utils/refreshAuthTokens';
import { CognitoAuthTokens } from '../../../src/providers/cognito/tokenProvider/types';
import { initiateAuth } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { mockAccessToken, mockRequestId } from './testUtils/data';

jest.mock(
	'../../../src/providers/cognito/utils/clients/CognitoIdentityProvider'
);

describe('refreshToken', () => {
	const mockedUsername = 'mockedUsername';
	const mockedRefreshToken = 'mockedRefreshToken';
	// assert mocks
	const mockInitiateAuth = initiateAuth as jest.Mock;

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
			JSON.parse(JSON.stringify(expectedOutput))
		);
		expect(mockInitiateAuth).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-east-1' }),
			expect.objectContaining({
				ClientId: 'aaaaaaaaaaaa',
				AuthFlow: 'REFRESH_TOKEN_AUTH',
				AuthParameters: {
					REFRESH_TOKEN: mockedRefreshToken,
				},
			})
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
					'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0'
				),
				idToken: decodeJWT(
					'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0'
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
			})
		);
		window['AmazonCognitoAdvancedSecurityData'] = undefined;
	});
});
