/*
 * Copyright 2017-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

import { HttpHandlerOptions } from '@aws-sdk/types';
import { HttpHandler, HttpRequest, HttpResponse } from '@aws-sdk/protocol-http';
import { buildQueryString } from '@aws-sdk/querystring-builder';
import axios, { AxiosRequestConfig, Method } from 'axios';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { FetchHttpHandlerOptions } from '@aws-sdk/fetch-http-handler';

const logger = new Logger('axios-http-handler');
export const SEND_PROGRESS_EVENT = 'sendProgress';

export class AxiosHttpHandler implements HttpHandler {
	constructor(
		private readonly httpOptions: FetchHttpHandlerOptions = {},
		private readonly emitter?: any
	) {}

	destroy(): void {
		// Do nothing. TLS and HTTP/2 connection pooling is handled by the
		// browser.
	}

	handle(
		request: HttpRequest,
		options: HttpHandlerOptions
	): Promise<{ response: HttpResponse }> {
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

		// The host header is automatically added by the browser and adding it explicitly in the
		// axios request throws an error https://github.com/aws-amplify/amplify-js/issues/5376
		// This is because the host header is a forbidden header for the http client to set
		// see https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name and
		// https://fetch.spec.whatwg.org/#forbidden-header-name
		// The reason we are removing this header here instead of in the aws-sdk's client
		// middleware is that the host header is required to be in the request signature and if
		// we remove it from the middlewares, then the request fails because the header is added
		// by the browser but is absent from the signature.
		delete axiosRequest.headers['host'];

		if (request.body) {
			axiosRequest.data = request.body;
		} else {
			// Fix for https://github.com/aws-amplify/amplify-js/issues/5432

			// If the POST request body is empty but content-type header is set, axios is forcibly removing it
			// See https://github.com/axios/axios/issues/1535 and refusing to fix it https://github.com/axios/axios/issues/755
			// This change is a workaround to set the data as null (instead of undefined) to prevent axios from
			// removing the content-type header. Link for the source code
			// https://github.com/axios/axios/blob/dc4bc49673943e35280e5df831f5c3d0347a9393/lib/adapters/xhr.js#L121-L123

			if (axiosRequest.headers['Content-Type']) {
				axiosRequest.data = null;
			}
		}
		if (emitter) {
			axiosRequest.onUploadProgress = function(event) {
				emitter.emit(SEND_PROGRESS_EVENT, event);
				logger.debug(event);
			};
		}

		// From gamma release, aws-sdk now expects all response type to be of blob or streams
		axiosRequest.responseType = 'blob';

		const raceOfPromises = [
			axios
				.request(axiosRequest)
				.then(response => {
					return {
						response: new HttpResponse({
							headers: response.headers,
							statusCode: response.status,
							body: response.data,
						}),
					};
				})
				.catch(error => {
					// Error
					logger.error(error);
					throw error;
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
