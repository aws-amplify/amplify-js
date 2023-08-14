import { decodeJWT } from '@aws-amplify/core';
import { fetchTransferHandler } from '@aws-amplify/core/internals/aws-client-utils';
import { mockJsonResponse, mockRequestId } from './testUtils/data';
import { CognitoUserPoolTokenRefresher } from '../../../src/providers/cognito/apis/tokenRefresher';
import { CognitoAuthTokens } from '../../../src/providers/cognito/tokenProvider/types';
jest.mock('@aws-amplify/core/lib/clients/handlers/fetch');

describe('refresh token tests', () => {
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
			metadata: {
				refreshToken: 'refreshtoken',
			},
			clockDrift: 0,
		};
		const expectedRequest = {
			url: new URL('https://cognito-idp.us-east-1.amazonaws.com/'),
			method: 'POST',
			headers: expect.objectContaining({
				'cache-control': 'no-store',
				'content-type': 'application/x-amz-json-1.1',
				'x-amz-target': 'AWSCognitoIdentityProviderService.InitiateAuth',
				'x-amz-user-agent': 'aws-amplify/6.0.0 framework/0',
			}),
			body: JSON.stringify({
				ClientId: 'aaaaaaaaaaaa',
				AuthFlow: 'REFRESH_TOKEN_AUTH',
				AuthParameters: {
					REFRESH_TOKEN: 'refreshtoken',
				},
			}),
		};

		(fetchTransferHandler as jest.Mock).mockResolvedValue(
			mockJsonResponse(succeedResponse)
		);
		const response = await CognitoUserPoolTokenRefresher({
			tokens: {
				accessToken: {
					payload: {},
				},
				clockDrift: 0,
				refreshToken: 'refreshtoken',
			},
			authConfig: {
				userPoolId: 'us-east-1_aaaaaaa',
				userPoolWebClientId: 'aaaaaaaaaaaa',
			},
		});

		expect(response.accessToken.toString()).toEqual(
			expectedOutput.accessToken.toString()
		);
		expect(fetchTransferHandler).toBeCalledWith(
			expectedRequest,
			expect.anything()
		);
	});
});
