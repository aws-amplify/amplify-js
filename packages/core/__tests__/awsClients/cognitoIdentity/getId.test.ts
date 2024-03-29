import { fetchTransferHandler } from '../../../src/clients/handlers/fetch';
import {
	GetIdInput,
	GetIdOutput,
	getId,
} from '../../../src/awsClients/cognitoIdentity';
import {
	cognitoIdentityHandlerOptions,
	mockIdentityId,
	mockJsonResponse,
	mockRequestId,
} from '../testUtils/data';

jest.mock('../../../src/clients/handlers/fetch');

// API reference: https://docs.aws.amazon.com/cognitoidentity/latest/APIReference/API_GetId.html
describe('CognitoIdentity - getId', () => {
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
				'x-amz-user-agent': expect.stringContaining('aws-amplify'),
			}),
			body: JSON.stringify({
				IdentityPoolId: IDENTITY_POOL_ID,
				AccountId: ACCOUNT_ID,
			}),
		};
		const succeedResponse = {
			status: 200,
			headers: {
				'x-amzn-requestid': mockRequestId,
			},
			body: {
				IdentityId: mockIdentityId,
			},
		};
		const expectedOutput: GetIdOutput = {
			IdentityId: mockIdentityId,
			$metadata: expect.objectContaining({
				attempts: 1,
				requestId: mockRequestId,
				httpStatusCode: 200,
			}),
		};
		(fetchTransferHandler as jest.Mock).mockResolvedValue(
			mockJsonResponse(succeedResponse),
		);
		const response = await getId(cognitoIdentityHandlerOptions, params);
		expect(response).toEqual(expectedOutput);
		expect(fetchTransferHandler).toHaveBeenCalledWith(
			expectedRequest,
			expect.anything(),
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
				message: `Identity pool ${IDENTITY_POOL_ID} does not exist.`,
			},
		};
		const expectedError = {
			name: 'NotAuthorizedException',
			message: failureResponse.body.message,
		};
		(fetchTransferHandler as jest.Mock).mockResolvedValue(
			mockJsonResponse(failureResponse),
		);
		expect.assertions(1);
		try {
			await getId(cognitoIdentityHandlerOptions, params);
			fail('test should fail');
		} catch (e) {
			expect(e).toEqual(expect.objectContaining(expectedError));
		}
	});
});
