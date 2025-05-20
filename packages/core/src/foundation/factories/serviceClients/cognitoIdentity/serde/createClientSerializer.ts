// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Endpoint, Headers, HttpRequest } from '../../../../../clients';

export const createClientSerializer =
	<Input>(operation: string) =>
	(input: Input, endpoint: Endpoint): HttpRequest => {
		const headers = getSharedHeaders(operation);
		const body = JSON.stringify(input);

		return buildHttpRpcRequest(endpoint, headers, body);
	};

const getSharedHeaders = (operation: string): Headers => ({
	'content-type': 'application/x-amz-json-1.1',
	'x-amz-target': `AWSCognitoIdentityService.${operation}`,
});

export const buildHttpRpcRequest = (
	{ url }: Endpoint,
	headers: Headers,
	body: any,
): HttpRequest => ({
	headers,
	url,
	body,
	method: 'POST',
});
