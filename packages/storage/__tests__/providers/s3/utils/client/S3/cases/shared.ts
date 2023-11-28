// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const EMPTY_SHA256 =
	'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

export const MOCK_REQUEST_ID = 'requestId';
export const MOCK_EXTENDED_REQUEST_ID = 'requestId2';
export const DEFAULT_RESPONSE_HEADERS = {
	'x-amz-id-2': MOCK_EXTENDED_REQUEST_ID,
	'x-amz-request-id': MOCK_REQUEST_ID,
};

export const expectedMetadata = {
	requestId: MOCK_REQUEST_ID,
	extendedRequestId: MOCK_EXTENDED_REQUEST_ID,
	httpStatusCode: 200,
};

export const defaultConfig = {
	region: 'us-east-1',
	credentials: {
		accessKeyId: 'key',
		secretAccessKey: 'secret',
	},
};
