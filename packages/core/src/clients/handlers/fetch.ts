// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import 'isomorphic-unfetch'; // TODO: remove this dependency in v6
import { HttpRequest, HttpResponse, HttpTransferOptions } from '../types/http';
import { TransferHandler } from '../types/core';

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
		text: withPayloadCaching(() => resp.text()),
		blob: withPayloadCaching(() => resp.blob()),
		json: withPayloadCaching(() => resp.json()),
	});

	return {
		...httpResponse,
		body: bodyWithMixin,
	};
};

/**
 * Cache the payload of a response body. It allows multiple calls to the body,
 * for example, when reading the body in both retry decider and error deserializer.
 * Caching body is allowed here because we call the body accessor(blob(), json(),
 * etc.) when body is small or streaming implementation is not available(RN).
 */
const withPayloadCaching = <T>(payloadAccessor: () => Promise<T>) => {
	let cached: T;
	return async () => {
		if (!cached) {
			cached = await payloadAccessor();
		}
		return cached;
	};
};
