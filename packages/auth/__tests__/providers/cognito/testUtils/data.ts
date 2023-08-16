// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HttpResponse } from '@aws-amplify/core/src/clients/types';

// Common
const region = 'us-east-1';

export const MOCK_REQUEST_ID = 'requestId';
export const MOCK_EXTENDED_REQUEST_ID = 'requestId2';
export const DEFAULT_RESPONSE_HEADERS = {
	'x-amz-id-2': MOCK_EXTENDED_REQUEST_ID,
	'x-amz-request-id': MOCK_REQUEST_ID,
};

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

export const mockTokens = {
	SecretKey: 'secret-access-key',
	SessionToken: 'session-token',
	Expiration: 1442877512.0,
	AccessKeyId: 'access-key-id',
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

export function buildMockErrorResponse(errorName: string): {
	status: 403;
	headers: {
		'x-amzn-requestid': string;
		'x-amzn-errortype': string;
	};
	body: {
		__type: string;
		message: string;
	};
} {
	return {
		status: 403,
		headers: {
			'x-amzn-requestid': mockRequestId,
			'x-amzn-errortype': errorName,
		},
		body: {
			__type: errorName,
			message: 'Error message',
		},
	};
}

