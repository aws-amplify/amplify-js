import { decodeJWT } from '@aws-amplify/core/internals/utils';
import { fetchTransferHandler } from '@aws-amplify/core/internals/aws-client-utils';
import { mockJsonResponse, mockRequestId } from './testUtils/data';
import { refreshAuthTokens } from '../../../src/providers/cognito/utils/refreshAuthTokens';
import { CognitoAuthTokens } from '../../../src/providers/cognito/tokenProvider/types';
import * as clients from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';

jest.mock('@aws-amplify/core/dist/cjs/clients/handlers/fetch');

describe('refresh token tests', () => {
	const mockedUsername = 'mockedUsername';
	const mockedRefreshToken = 'mockedRefreshToken';
	test('Default Cognito Token Refresh Handler', async () => {
		const succeedResponse = {
			status: 200,
			headers: {
				'x-amzn-requestid': mockRequestId,
			},
			body: {
				AuthenticationResult: {
					AccessToken:
						'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0',
					ExpiresIn: 3600,
					IdToken:
						'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0',
					TokenType: 'Bearer',
				},
				ChallengeParameters: {},
				$metadata: {
					attempts: 1,
					httpStatusCode: 200,
					requestId: mockRequestId,
				},
			},
		};
		const expectedOutput: CognitoAuthTokens = {
			accessToken: decodeJWT(
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0'
			),
			idToken: decodeJWT(
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0'
			),

			refreshToken: mockedRefreshToken,

			clockDrift: 0,
			username: mockedUsername,
		};
		const expectedRequest = {
			url: new URL('https://cognito-idp.us-east-1.amazonaws.com/'),
			method: 'POST',
			headers: expect.objectContaining({
				'cache-control': 'no-store',
				'content-type': 'application/x-amz-json-1.1',
				'x-amz-target': 'AWSCognitoIdentityProviderService.InitiateAuth',
				'x-amz-user-agent': expect.any(String),
			}),
			body: JSON.stringify({
				ClientId: 'aaaaaaaaaaaa',
				AuthFlow: 'REFRESH_TOKEN_AUTH',
				AuthParameters: {
					REFRESH_TOKEN: mockedRefreshToken,
				},
			}),
		};

		(fetchTransferHandler as jest.Mock).mockResolvedValue(
			mockJsonResponse(succeedResponse)
		);
		const response = await refreshAuthTokens({
			tokens: {
				accessToken: {
					payload: {},
				},
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

		expect(response.accessToken.toString()).toEqual(
			expectedOutput.accessToken.toString()
		);

		expect(response.refreshToken).toEqual(expectedOutput.refreshToken);

		expect(fetchTransferHandler).toBeCalledWith(
			expectedRequest,
			expect.anything()
		);
	});
});

describe('Cognito ASF', () => {
	let initiateAuthSpy;
	afterAll(() => {
		jest.restoreAllMocks();
	});
	beforeEach(() => {
		initiateAuthSpy = jest
			.spyOn(clients, 'initiateAuth')
			.mockImplementationOnce(async () => ({
				AuthenticationResult: {
					AccessToken:
						'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0',
					ExpiresIn: 3600,
					IdToken:
						'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0',
					TokenType: 'Bearer',
				},
				ChallengeParameters: {},
				$metadata: {
					attempts: 1,
					httpStatusCode: 200,
					requestId: mockRequestId,
				},
			}));
		// load Cognito ASF polyfill
		window['AmazonCognitoAdvancedSecurityData'] = {
			getData() {
				return 'abcd';
			},
		};
	});

	afterEach(() => {
		initiateAuthSpy.mockClear();
		window['AmazonCognitoAdvancedSecurityData'] = undefined;
	});

	test('refreshTokens API should send UserContextData', async () => {
		const response = await refreshAuthTokens({
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
		expect(initiateAuthSpy).toBeCalledWith(
			expect.objectContaining({
				region: 'us-east-1',
			}),
			expect.objectContaining({
				AuthFlow: 'REFRESH_TOKEN_AUTH',
				AuthParameters: { REFRESH_TOKEN: 'refreshtoken' },
				ClientId: 'aaaaaaaaaaaa',
				UserContextData: { EncodedData: 'abcd' },
			})
		);
	});
});
