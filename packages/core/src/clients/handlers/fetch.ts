// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HttpRequest, HttpResponse, HttpTransferOptions } from '../types/http';
import { TransferHandler } from '../types/core';
import { AmplifyError } from '../../errors';
import { withMemoization } from '../utils/memoization';
import { AmplifyErrorCode } from '../../types';

const shouldSendBody = (method: string) =>
	!['HEAD', 'GET', 'DELETE'].includes(method.toUpperCase());

// TODO[AllanZhengYP]: we need to provide isCanceledError utility
export const fetchTransferHandler: TransferHandler<
	HttpRequest,
	HttpResponse,
	HttpTransferOptions
> = async (
	{ url, method, headers, body },
	{ abortSignal, cache, withCrossDomainCredentials },
) => {
	let resp: Response;
	try {
		resp = await fetch(url, {
			method,
			headers,
			body: shouldSendBody(method) ? body : undefined,
			signal: abortSignal,
			cache,
			credentials: withCrossDomainCredentials ? 'include' : 'same-origin',
		});
	} catch (e) {
		if (e instanceof TypeError) {
			throw new AmplifyError({
				name: AmplifyErrorCode.NetworkError,
				message: 'A network error has occurred.',
				underlyingError: e,
			});
		}
		throw e;
	}

	const responseHeaders: Record<string, string> = {};
	resp.headers?.forEach((value: string, key: string) => {
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
