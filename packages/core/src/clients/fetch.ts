import 'isomorphic-unfetch'; // TODO: remove this dependency in v6
import { HttpRequest, HttpResponse, HttpTransferOptions } from './types/http';
import { TransferHandler } from './types/core';

const shouldSendBody = (method: string) =>
	!['HEAD', 'GET', 'DELETE'].includes(method.toUpperCase());

export const fetchTransferHandler: TransferHandler<
	HttpRequest,
	HttpResponse,
	HttpTransferOptions
> = async (request, options) => {
	const resp = await fetch(request.url, {
		method: request.method,
		headers: request.headers,
		body: shouldSendBody(request.method) ? request.body : undefined,
		signal: options.abortSignal,
	});

	const headersBag = {};
	resp.headers?.forEach?.((key, value) => {
		headersBag[key.toLowerCase()] = value;
	});
	const httpResponse = {
		statusCode: resp.status,
		headers: headersBag,
		body: null,
	};

	if (resp.body) {
		const bodyWithMixin = Object.assign(resp.body, {
			text: () => resp.text(),
			blob: () => resp.blob(),
			json: () => resp.json(),
		});
		return {
			...httpResponse,
			body: bodyWithMixin,
		};
	}
	return httpResponse;
};
