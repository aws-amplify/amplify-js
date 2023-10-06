/**
 * @jest-environment jsdom
 */

import { fetchTransferHandler } from '../../../src/clients/handlers/fetch';
import {
	getCredentialsForIdentity,
	GetCredentialsForIdentityInput,
	GetCredentialsForIdentityOutput,
} from '../../../src/awsClients/cognitoIdentity';
import {
	cognitoIdentityHandlerOptions,
	mockCredentials,
	mockIdentityId,
	mockJsonResponse,
	mockRequestId,
} from '../testUtils/data';

jest.mock('../../../src/clients/handlers/fetch');

// API reference: https://docs.aws.amazon.com/cognitoidentity/latest/APIReference/API_GetCredentialsForIdentity.html
describe('CognitoIdentity - getCredentialsForIdentity', () => {
	const params: GetCredentialsForIdentityInput = {
		IdentityId: mockIdentityId,
	};

	test('happy case', async () => {
		const succeedResponse = {
			status: 200,
			headers: {
				'x-amzn-requestid': mockRequestId,
			},
			body: {
				Credentials: mockCredentials,
				IdentityId: mockIdentityId,
			},
		};
		const expectedOutput: GetCredentialsForIdentityOutput = {
			Credentials: {
				...mockCredentials,
				Expiration: new Date(mockCredentials.Expiration * 1000),
			},
			IdentityId: mockIdentityId,
			$metadata: expect.objectContaining({
				attempts: 1,
				requestId: mockRequestId,
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
				'x-amz-user-agent': expect.stringContaining('aws-amplify'),
			}),
			body: JSON.stringify({
				IdentityId: mockIdentityId,
			}),
		};

		(fetchTransferHandler as jest.Mock).mockResolvedValue(
			mockJsonResponse(succeedResponse)
		);
		const response = await getCredentialsForIdentity(
			cognitoIdentityHandlerOptions,
			params
		);
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
				'x-amzn-requestid': mockRequestId,
				'x-amzn-errortype': 'NotAuthorizedException',
			},
			body: {
				__type: 'NotAuthorizedException',
				message: `Identity ${mockIdentityId} does not exist.`,
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
			await getCredentialsForIdentity(cognitoIdentityHandlerOptions, params);
			fail('test should fail');
		} catch (e) {
			expect(e).toEqual(expect.objectContaining(expectedError));
		}
	});
});
