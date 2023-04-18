/**
 * @jest-environment jsdom
 */

import { fetchTransferHandler } from '../../src/clients/handlers/fetch';
import {
	getId,
	GetIdInput,
	getCredentialsForIdentity,
	GetIdOutput,
	GetCredentialsForIdentityInput,
	GetCredentialsForIdentityOutput,
} from '../../src/AwsClients/CognitoIdentity';
import { HttpResponse } from '../../src/clients/types';
jest.mock('../../src/clients/handlers/fetch');

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
	const REQUEST_ID = 'ff1ca798-b930-4b81-9ef3-c02e770188af';
	const IDENTITY_ID = 'us-east-1:88859bc9-0149-4183-bf10-39e36EXAMPLE';
	const handlerOptions = {
		region: 'us-east-1',
	};

	// API reference: https://docs.aws.amazon.com/cognitoidentity/latest/APIReference/API_GetId.html
	describe('getId', () => {
		const IDENTITY_POOL_ID = 'us-east-1:177a950c-2c08-43f0-9983-28727EXAMPLE';
		const ACCOUNT_ID = '123456789012';
		const params: GetIdInput = {
			IdentityPoolId: IDENTITY_POOL_ID,
			AccountId: ACCOUNT_ID,
		};

		test('happy case', async () => {
			const expectedRequest = {
				url: new URL('https://cognito-identity.us-east-1.amazonaws.com/'),
				method: 'POST',
				headers: expect.objectContaining({
					'cache-control': 'no-store',
					'content-type': 'application/x-amz-json-1.1',
					'x-amz-target': 'AWSCognitoIdentityService.GetId',
				}),
				body: JSON.stringify({
					IdentityPoolId: IDENTITY_POOL_ID,
					AccountId: ACCOUNT_ID,
				}),
			};
			const succeedResponse = {
				status: 200,
				headers: {
					'x-amzn-requestid': REQUEST_ID,
				},
				body: {
					IdentityId: IDENTITY_ID,
				},
			};
			const expectedOutput: GetIdOutput = {
				IdentityId: IDENTITY_ID,
				$metadata: expect.objectContaining({
					attempts: 1,
					requestId: REQUEST_ID,
					httpStatusCode: 200,
				}),
			};
			(fetchTransferHandler as jest.Mock).mockResolvedValue(
				mockJsonResponse(succeedResponse)
			);
			const response = await getId(handlerOptions, params);
			expect(response).toEqual(expectedOutput);
			expect(fetchTransferHandler).toBeCalledWith(
				expectedRequest,
				expect.anything()
			);
		});

		test('error case', async () => {
			const failureResponse = {
				status: 400,
				headers: {
					'x-amzn-requestid': REQUEST_ID,
					'x-amzn-errortype': 'NotAuthorizedException',
				},
				body: {
					__type: 'NotAuthorizedException',
					message: `Identity pool ${IDENTITY_POOL_ID} does not exist.`,
				},
			};
			const expectedError = {
				name: 'NotAuthorizedException',
				message: failureResponse.body.message,
			};
			(fetchTransferHandler as jest.Mock).mockResolvedValue(
				mockJsonResponse(failureResponse)
			);
			expect.assertions(1);
			try {
				await getId(handlerOptions, params);
				fail('test should fail');
			} catch (e) {
				expect(e).toEqual(expect.objectContaining(expectedError));
			}
		});
	});

	// API reference: https://docs.aws.amazon.com/cognitoidentity/latest/APIReference/API_GetCredentialsForIdentity.html
	describe('getCredentialsForIdentity', () => {
		const CREDENTIALS = {
			SecretKey: 'secretKey',
			SessionToken: 'sessionToken',
			Expiration: 1442877512.0,
			AccessKeyId: 'accessKeyId',
		};
		const params: GetCredentialsForIdentityInput = { IdentityId: IDENTITY_ID };

		test('happy case', async () => {
			const succeedResponse = {
				status: 200,
				headers: {
					'x-amzn-requestid': REQUEST_ID,
				},
				body: {
					Credentials: CREDENTIALS,
					IdentityId: IDENTITY_ID,
				},
			};
			const expectedOutput: GetCredentialsForIdentityOutput = {
				Credentials: {
					...CREDENTIALS,
					Expiration: new Date(CREDENTIALS.Expiration * 1000),
				},
				IdentityId: IDENTITY_ID,
				$metadata: expect.objectContaining({
					attempts: 1,
					requestId: REQUEST_ID,
					httpStatusCode: 200,
				}),
			};
			const expectedRequest = {
				url: new URL('https://cognito-identity.us-east-1.amazonaws.com/'),
				method: 'POST',
				headers: expect.objectContaining({
					'cache-control': 'no-store',
					'content-type': 'application/x-amz-json-1.1',
					'x-amz-target': 'AWSCognitoIdentityService.GetCredentialsForIdentity',
				}),
				body: JSON.stringify({
					IdentityId: IDENTITY_ID,
				}),
			};

			(fetchTransferHandler as jest.Mock).mockResolvedValue(
				mockJsonResponse(succeedResponse)
			);
			const response = await getCredentialsForIdentity(handlerOptions, params);
			expect(response).toEqual(expectedOutput);
			expect(fetchTransferHandler).toBeCalledWith(
				expectedRequest,
				expect.anything()
			);
		});

		test('error case', async () => {
			const failureResponse = {
				status: 400,
				headers: {
					'x-amzn-requestid': REQUEST_ID,
					'x-amzn-errortype': 'NotAuthorizedException',
				},
				body: {
					__type: 'NotAuthorizedException',
					message: `Identity ${IDENTITY_ID} does not exist.`,
				},
			};
			const expectedError = {
				name: 'NotAuthorizedException',
				message: failureResponse.body.message,
			};
			(fetchTransferHandler as jest.Mock).mockResolvedValue(
				mockJsonResponse(failureResponse)
			);
			expect.assertions(1);
			try {
				await getCredentialsForIdentity(handlerOptions, params);
				fail('test should fail');
			} catch (e) {
				expect(e).toEqual(expect.objectContaining(expectedError));
			}
		});
	});
});
