// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HttpResponse } from '../../../src/clients/types';

// Common
const region = 'us-east-1';

export const mockJsonResponse = ({
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

export const mockRequestId = 'ff1ca798-b930-4b81-9ef3-c02e770188af';

export const mockCredentials = {
	SecretKey: 'secret-access-key',
	SessionToken: 'session-token',
	Expiration: 1442877512.0,
	AccessKeyId: 'access-key-id',
};

// CognitoIdentity
export const mockIdentityId = 'us-east-1:88859bc9-0149-4183-bf10-39e36EXAMPLE';

export const cognitoIdentityHandlerOptions = {
	region,
};

// Pinpoint
export const mockApplicationId = 'fls189ysample154app128idpdsadk31';

export const mockEndpointId = '41232bb8-1c62-448f-a295-89019bbdce5a';

export const mockEndpointRequest = {
	Attributes: {
		hobbies: ['cooking', 'knitting'],
	},
	Demographic: {
		AppVersion: '1.0',
	},
	RequestId: mockRequestId,
};

const mockEventId = '0e8f291b-e0dd-47d8-860a-6b7317bf7eba';

const mockEvent = {
	EventType: 'event-type',
	Timestamp: '2023-05-03T16:22:19.597Z',
};

export const mockEventsRequest = {
	BatchItem: {
		[mockEndpointId]: {
			Endpoint: mockEndpointRequest,
			Events: {
				[mockEventId]: mockEvent,
			},
		},
	},
};

export const mockFailureResponse = {
	status: 403,
	headers: {
		'x-amzn-requestid': mockRequestId,
		'x-amzn-errortype': 'ForbiddenException',
	},
	body: {
		__type: 'ForbiddenException',
		message: `Forbidden`,
	},
};

export const pinpointHandlerOptions = {
	credentials: {
		accessKeyId: mockCredentials.AccessKeyId,
		secretAccessKey: mockCredentials.SecretKey,
	},
	region,
};
