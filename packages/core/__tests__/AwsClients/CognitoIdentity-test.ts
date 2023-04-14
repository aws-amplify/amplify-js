/**
 * @jest-environment jsdom
 */

import { fetchTransferHandler } from '../../src/clients/handlers/fetch';
import { getId } from '../../src/AwsClients/CognitoIdentity';
import { HttpResponse } from '../../src/clients/types';
jest.mock('../../src/clients/handlers/fetch');

const mockJsonResponse = (
	status: number,
	headers: Record<string, string>,
	body: any
): HttpResponse => {
	const responseBody = {
		json: async () => body,
		blob: async () => fail('blob() should not be called'),
		text: async () => fail('text() should not be called'),
	} as unknown as HttpResponse['body'];
	return {
		statusCode: status,
		headers,
		body: responseBody,
	};
};

describe('cognito-identity service client', () => {
	describe('getId', () => {
		test('happy case', async () => {
			const status = 200;
			const headers = {
				'x-amzn-requestid': 'ff1ca798-b930-4b81-9ef3-c02e770188af',
			};
			const body = {
				IdentityId: 'us-east-1:88859bc9-0149-4183-bf10-39e36EXAMPLE',
			};
			(fetchTransferHandler as jest.Mock).mockResolvedValue(
				mockJsonResponse(status, headers, body)
			);
			const response = await getId(
				{ region: 'us-east-1' },
				{
					IdentityPoolId: 'us-east-1:177a950c-2c08-43f0-9983-28727EXAMPLE',
					AccountId: '123456789012',
				}
			);
			expect(response).toEqual({
				IdentityId: 'us-east-1:88859bc9-0149-4183-bf10-39e36EXAMPLE',
				$metadata: expect.objectContaining({
					attempts: 1,
					requestId: headers['x-amzn-requestid'],
					httpStatusCode: status,
				}),
			});
		});
	});
});
