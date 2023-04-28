// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchTransferHandler } from '../../../src/clients/handlers/fetch';
import {
	updateEndpoint,
	UpdateEndpointInput,
	UpdateEndpointOutput,
} from '../../../src/AwsClients/Pinpoint';
import {
	mockJsonResponse,
	mockRequestId,
	pinpointHandlerOptions,
} from '../testUtils/data';

jest.mock('../../../src/clients/handlers/fetch');

// API reference: https://docs.aws.amazon.com/pinpoint/latest/apireference/apps-application-id-endpoints-endpoint-id.html#UpdateEndpoint
describe('Pinpoint - updateEndpoint', () => {
	const ApplicationId = 'fls189ysample154app128idpdsadk31';
	const EndpointId = '41232bb8-1c62-448f-a295-89019bbdce5a';
	const EndpointRequest = {
		Attributes: {
			hobbies: ['cooking', 'knitting'],
		},
		Demographic: {
			AppVersion: '1.0',
		},
		RequestId: mockRequestId,
	};
	const MessageBody = {
		Message: 'success',
		RequestID: mockRequestId,
	};
	const params: UpdateEndpointInput = {
		ApplicationId,
		EndpointId,
		EndpointRequest,
	};

	test('happy case', async () => {
		const expectedRequest = expect.objectContaining({
			url: expect.objectContaining({
				href: `https://pinpoint.us-east-1.amazonaws.com/v1/apps/${ApplicationId}/endpoints/${EndpointId}`,
			}),
			method: 'PUT',
			headers: expect.objectContaining({
				authorization: expect.stringContaining('Signature'),
				'content-type': 'application/json',
				host: 'pinpoint.us-east-1.amazonaws.com',
				'x-amz-date': expect.anything(),
				'x-amz-user-agent': expect.stringContaining('aws-amplify'),
			}),
			body: JSON.stringify(EndpointRequest),
		});
		const successfulResponse = {
			status: 200,
			headers: {
				'x-amzn-requestid': mockRequestId,
			},
			body: { ...MessageBody },
		};
		const expectedOutput: UpdateEndpointOutput = {
			MessageBody,
			$metadata: expect.objectContaining({
				attempts: 1,
				requestId: mockRequestId,
				httpStatusCode: 200,
			}),
		};
		(fetchTransferHandler as jest.Mock).mockResolvedValue(
			mockJsonResponse(successfulResponse)
		);
		const response = await updateEndpoint(pinpointHandlerOptions, params);
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
				'x-amzn-errortype': 'ForbiddenException',
			},
			body: {
				__type: 'ForbiddenException',
				message: `Forbidden`,
			},
		};
		const expectedError = {
			name: 'ForbiddenException',
			message: failureResponse.body.message,
		};
		(fetchTransferHandler as jest.Mock).mockResolvedValue(
			mockJsonResponse(failureResponse)
		);
		expect.assertions(1);
		try {
			await updateEndpoint(pinpointHandlerOptions, params);
			fail('test should fail');
		} catch (e) {
			expect(e).toEqual(expect.objectContaining(expectedError));
		}
	});
});
