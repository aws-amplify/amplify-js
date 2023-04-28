// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchTransferHandler } from '../../../src/clients/handlers/fetch';
import {
	putEvents,
	PutEventsInput,
	PutEventsOutput,
} from '../../../src/AwsClients/Pinpoint';
import {
	mockApplicationId,
	mockEventsRequest,
	mockJsonResponse,
	mockRequestId,
	pinpointHandlerOptions,
} from '../testUtils/data';

jest.mock('../../../src/clients/handlers/fetch');

// API reference: https://docs.aws.amazon.com/pinpoint/latest/apireference/apps-application-id-endpoints-endpoint-id.html#UpdateEndpoint
describe('Pinpoint - putEvents', () => {
	const MessageBody = {
		Message: 'success',
		RequestID: mockRequestId,
	};
	const params: PutEventsInput = {
		ApplicationId: mockApplicationId,
		EventsRequest: mockEventsRequest,
	};

	test('happy case', async () => {
		const expectedRequest = expect.objectContaining({
			url: expect.objectContaining({
				href: `https://pinpoint.us-east-1.amazonaws.com/v1/apps/${mockApplicationId}/events`,
			}),
			method: 'POST',
			headers: expect.objectContaining({
				authorization: expect.stringContaining('Signature'),
				'content-type': 'application/json',
				host: 'pinpoint.us-east-1.amazonaws.com',
				'x-amz-date': expect.anything(),
				'x-amz-user-agent': expect.stringContaining('aws-amplify'),
			}),
			body: JSON.stringify(mockEventsRequest),
		});
		const successfulResponse = {
			status: 200,
			headers: {
				'x-amzn-requestid': mockRequestId,
			},
			body: { ...MessageBody },
		};
		const expectedOutput: PutEventsOutput = {
			EventsResponse: {},
			$metadata: expect.objectContaining({
				attempts: 1,
				requestId: mockRequestId,
				httpStatusCode: 200,
			}),
		};
		(fetchTransferHandler as jest.Mock).mockResolvedValue(
			mockJsonResponse(successfulResponse)
		);
		const response = await putEvents(pinpointHandlerOptions, params);
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
			await putEvents(pinpointHandlerOptions, params);
			fail('test should fail');
		} catch (e) {
			expect(e).toEqual(expect.objectContaining(expectedError));
		}
	});
});
