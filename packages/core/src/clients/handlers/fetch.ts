// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import 'isomorphic-unfetch'; // TODO: remove this dependency in v6
import { HttpRequest, HttpResponse, HttpTransferOptions } from '../types/http';
import { TransferHandler } from '../types/core';
import { withMemoization } from '../utils/memoization';

const shouldSendBody = (method: string) =>
	!['HEAD', 'GET', 'DELETE'].includes(method.toUpperCase());

export const fetchTransferHandler: TransferHandler<
	HttpRequest,
	HttpResponse,
	HttpTransferOptions
> = async ({ url, method, headers, body }, { abortSignal }) => {
	let resp: Response;
	try {
		resp = await fetch(url, {
			method,
			headers,
			body: shouldSendBody(method) ? body : undefined,
			signal: abortSignal,
		});
	} catch (e) {
		// TODO: needs to revise error handling in v6
		// For now this is a thin wrapper over original fetch error similar to cognito-identity-js package.
		// Ref: https://github.com/aws-amplify/amplify-js/blob/4fbc8c0a2be7526aab723579b4c95b552195a80b/packages/amazon-cognito-identity-js/src/Client.js#L103-L108
		if (e instanceof TypeError) {
			throw new Error('Network error');
		}
		throw e;
	}

	const responseHeaders = {};
	resp.headers?.forEach((value, key) => {
		responseHeaders[key.toLowerCase()] = value;
	});
	const httpResponse = {
		statusCode: resp.status,
		headers: responseHeaders,
		body: null,
	};

	// resp.body is a ReadableStream according to Fetch API spec, but React Native
	// does not implement it.
	const bodyWithMixin = Object.assign(resp.body ?? {}, {
		text: withMemoization(() => resp.text()),
		blob: withMemoization(() => resp.blob()),
		json: withMemoization(() => resp.json()),
	});

	return {
		...httpResponse,
		body: bodyWithMixin,
	};
};
