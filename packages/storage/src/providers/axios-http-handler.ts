import {
	BrowserHttpOptions,
	HttpHandler,
	HttpHandlerOptions,
	HttpRequest,
	HttpResponse,
} from '@aws-sdk/types';
import { buildQueryString } from '@aws-sdk/querystring-builder';
import axios, { AxiosRequestConfig, Method } from 'axios';

export class AxiosHttpHandler implements HttpHandler<Blob, BrowserHttpOptions> {
	constructor(
		private readonly httpOptions: BrowserHttpOptions = {},
		private readonly emitter?: any
	) {}

	destroy(): void {
		// Do nothing. TLS and HTTP/2 connection pooling is handled by the
		// browser.
	}

	handle(
		request: HttpRequest<Blob>,
		options: HttpHandlerOptions
	): Promise<HttpResponse<Blob>> {
		const requestTimeoutInMs = this.httpOptions.requestTimeout;
		const emitter = this.emitter;

		let path = request.path;
		if (request.query) {
			const queryString = buildQueryString(request.query);
			if (queryString) {
				path += `?${queryString}`;
			}
		}

		const port = request.port;
		const url = `${request.protocol}//${request.hostname}${
			port ? `:${port}` : ''
		}${path}`;

		const axiosRequest: AxiosRequestConfig = {};
		axiosRequest.url = url;
		axiosRequest.method = request.method as Method;
		axiosRequest.headers = request.headers;
		axiosRequest.data = request.body;
		// axiosRequest.mode = 'cors';
		console.log(emitter);
		if (emitter) {
			axiosRequest.onUploadProgress = function(event) {
				emitter.emit('sendProgress', event);
				console.log(event);
			};
		}
		const raceOfPromises = [
			axios(axiosRequest).then(response => {
				return {
					headers: response.headers,
					statusCode: response.status,
					body: response.data,
				};
			}),
			requestTimeout(requestTimeoutInMs),
		];
		return Promise.race(raceOfPromises);
	}
}

function requestTimeout(timeoutInMs: number = 0): Promise<never> {
	return new Promise((resolve, reject) => {
		if (timeoutInMs) {
			setTimeout(() => {
				const timeoutError = new Error(
					`Request did not complete within ${timeoutInMs} ms`
				);
				timeoutError.name = 'TimeoutError';
				reject(timeoutError);
			}, timeoutInMs);
		}
	});
}
