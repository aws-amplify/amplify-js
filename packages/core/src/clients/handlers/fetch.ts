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
		text: () => resp.text(),
		blob: () => resp.blob(),
		json: () => resp.json(),
	});

	return {
		...httpResponse,
		body: bodyWithMixin,
	};
};
