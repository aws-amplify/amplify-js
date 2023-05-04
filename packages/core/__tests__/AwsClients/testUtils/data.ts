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
export const pinpointHandlerOptions = {
	credentials: {
		accessKeyId: mockCredentials.AccessKeyId,
		secretAccessKey: mockCredentials.SecretKey,
	},
	region,
};
