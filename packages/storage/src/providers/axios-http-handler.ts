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
import { BrowserHttpOptions } from '@aws-sdk/fetch-http-handler';

const logger = new Logger('axios-http-handler');
export const SEND_PROGRESS_EVENT = 'sendProgress';

export class AxiosHttpHandler implements HttpHandler {
	constructor(
		private readonly httpOptions: BrowserHttpOptions = {},
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
		axiosRequest.data = request.body;
		if (emitter) {
			axiosRequest.onUploadProgress = function(event) {
				emitter.emit(SEND_PROGRESS_EVENT, event);
				logger.debug(event);
			};
		}

		if (this.httpOptions.bufferBody) {
			axiosRequest.responseType = 'blob';
		}

		const raceOfPromises = [
			axios(axiosRequest).then(response => {
				return {
					response: new HttpResponse({
						headers: response.headers,
						statusCode: response.status,
						body: response.data,
					}),
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
