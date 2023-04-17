/**
 * @jest-environment jsdom
 */

import {
	CognitoIdentityClient,
	GetIdCommand,
} from '@aws-sdk/client-cognito-identity';
import { FetchHttpHandler } from '@aws-sdk/fetch-http-handler';
import { fetchTransferHandler } from '../../src/clients/handlers/fetch';
import { getId } from '../../src/AwsClients/CognitoIdentity';
import { HttpResponse } from '../../src/clients/types';
jest.mock('../../src/clients/handlers/fetch');
jest.mock('@aws-sdk/fetch-http-handler');

const mockJsonResponse = ({
	status,
	headers,
	body,
}: {
	status: number;
	headers: Record<string, string>;
	body: any;
}): HttpResponse => {
	const responseBody = {
		json: async () => body,
		blob: async () => fail('blob() should not be called'),
		text: async () => fail('text() should not be called'),
	} as HttpResponse['body'];
	return {
		statusCode: status,
		headers,
		body: responseBody,
	};
};

describe('cognito-identity service client', () => {
	// API reference: https://docs.aws.amazon.com/cognitoidentity/latest/APIReference/API_GetId.html
	describe('getId', () => {
		const IDENTITY_POOL_ID = 'us-east-1:177a950c-2c08-43f0-9983-28727EXAMPLE';
		const ACCOUNT_ID = '123456789012';
		const IDENTITY_ID = 'us-east-1:88859bc9-0149-4183-bf10-39e36EXAMPLE';
		const REQUEST_ID = 'ff1ca798-b930-4b81-9ef3-c02e770188af';

		test('happy case', async () => {
			(FetchHttpHandler as jest.Mock).mockImplementation(() => {
				return {
					handle: jest.fn(),
				};
			});
			const mockResponse = {
				status: 200,
				headers: {
					'x-amzn-requestid': REQUEST_ID,
				},
				body: {
					IdentityId: IDENTITY_ID,
				},
			};
			(fetchTransferHandler as jest.Mock).mockResolvedValue(
				mockJsonResponse(mockResponse)
			);
			const response = await getId(
				{ region: 'us-east-1' },
				{
					IdentityPoolId: IDENTITY_POOL_ID,
					AccountId: ACCOUNT_ID,
				}
			);
			expect(response).toEqual({
				IdentityId: 'us-east-1:88859bc9-0149-4183-bf10-39e36EXAMPLE',
				$metadata: expect.objectContaining({
					attempts: 1,
					requestId: mockResponse.headers['x-amzn-requestid'],
					httpStatusCode: mockResponse.status,
				}),
			});
			expect(fetchTransferHandler).toBeCalledWith(
				{
					url: new URL('https://cognito-identity.us-east-1.amazonaws.com/'),
					method: 'POST',
					headers: {
						'cache-control': 'no-store',
						'content-type': 'application/x-amz-json-1.1',
						'x-amz-target': 'AWSCognitoIdentityService.GetId',
					},
					body: JSON.stringify({
						IdentityPoolId: IDENTITY_POOL_ID,
						AccountId: ACCOUNT_ID,
					}),
				},
				expect.anything()
			);
		});

		test('error case', async () => {
			const mockResponse = {
				status: 400,
				headers: {
					'x-amzn-requestid': 'ff1ca798-b930-4b81-9ef3-c02e770188af',
					'x-amzn-errortype': 'NotAuthorizedException',
				},
				body: {
					Message:
						'Identity pool us-east-1:177a950c-2c08-43f0-9983-28727EXAMPLE does not exist.',
				},
			};
			(fetchTransferHandler as jest.Mock).mockResolvedValue(
				mockJsonResponse(mockResponse)
			);
			expect.assertions(1);
			try {
				await getId(
					{ region: 'us-east-1' },
					{
						IdentityPoolId: 'us-east-1:177a950c-2c08-43f0-9983-28727EXAMPLE',
						AccountId: '123456789012',
					}
				);
				fail('test should fail');
			} catch (e) {
				expect(e).toEqual(
					expect.objectContaining({
						name: 'NotAuthorizedException',
						message: mockResponse.body.Message,
					})
				);
			}
		});
	});

	// API reference: https://docs.aws.amazon.com/cognitoidentity/latest/APIReference/API_GetCredentialsForIdentity.html
	describe('getCredentialsForIdentity', () => {
		test('happy case', async () => {
			const mockResponse = {
				status: 200,
				headers: {
					'x-amzn-requestid': 'ff1ca798-b930-4b81-9ef3-c02e770188af',
				},
			};
		});
		test('error case', async () => {});
	});
});
