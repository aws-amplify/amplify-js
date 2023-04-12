import 'isomorphic-unfetch'; // TODO: remove this dependency in v6
import { HttpRequest, HttpResponse, HttpTransferOptions } from '../types/http';
import { TransferHandler } from '../types/core';

const shouldSendBody = (method: string) =>
	!['HEAD', 'GET', 'DELETE'].includes(method.toUpperCase());

export const fetchTransferHandler: TransferHandler<
	HttpRequest,
	HttpResponse,
	HttpTransferOptions
> = async (request, options) => {
	let resp: Response;
	try {
		resp = await fetch(request.url, {
			method: request.method,
			headers: request.headers,
			body: shouldSendBody(request.method) ? request.body : undefined,
			signal: options.abortSignal,
		});
	} catch (e) {
		// TODO: needs to revise error handling in v6
		if (e instanceof TypeError) {
			throw new Error(`Network error`);
		}
		throw e;
	}

	const headersBag = {};
	resp.headers?.forEach((value, key) => {
		headersBag[key.toLowerCase()] = value;
	});
	const httpResponse = {
		statusCode: resp.status,
		headers: headersBag,
		body: null,
	};

	// resp.body is a ReadableStream according to Fetch API spec, but React Native
	// does not implement it.
	const bodyWithMixin = Object.assign(resp.body ?? ({} as ReadableStream), {
		text: () => resp.text(),
		blob: () => resp.blob(),
		json: () => resp.json(),
	});

	return {
		...httpResponse,
		body: bodyWithMixin,
	};
};
