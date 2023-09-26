// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	AWSCredentialsAndIdentityId,
	fetchAuthSession,
} from '@aws-amplify/core';
import { apiOptions } from './types';
import axios, { CancelTokenSource } from 'axios';
import { parse, format } from 'url';
import { signRequest } from '@aws-amplify/core/internals/aws-client-utils';
export class RestClient {
	private _options;
	private _region: string = 'us-east-1'; // this will be updated by endpoint function
	private _service: string = 'execute-api'; // this can be updated by endpoint function
	private _custom_header = undefined; // this can be updated by endpoint function

	/**
	 * This weak map provides functionality to let clients cancel
	 * in-flight axios requests. https://github.com/axios/axios#cancellation
	 *
	 * 1. For every axios request, a unique cancel token is generated and added in the request.
	 * 2. Promise for fulfilling the request is then mapped to that unique cancel token.
	 * 3. The promise is returned to the client.
	 * 4. Clients can either wait for the promise to fulfill or call `API.cancel(promise)` to cancel the request.
	 * 5. If `API.cancel(promise)` is called, then the corresponding cancel token is retrieved from the map below.
	 * 6. Promise returned to the client will be in rejected state with the error provided during cancel.
	 * 7. Clients can check if the error is because of cancelling by calling `API.isCancel(error)`.
	 *
	 * For more details, see https://github.com/aws-amplify/amplify-js/pull/3769#issuecomment-552660025
	 */
	private _cancelTokenMap: WeakMap<Promise<any>, CancelTokenSource> | null =
		null;
	/**
	 * @param {RestClientOptions} [options] - Instance options
	 */
	constructor(options: apiOptions) {
		this._options = options;
		if (this._cancelTokenMap == null) {
			this._cancelTokenMap = new WeakMap();
		}
	}

	/**
	 * Basic HTTP request. Customizable
	 * @param {string | ApiInfo } urlOrApiInfo - Full request URL or Api information
	 * @param {string} method - Request HTTP method
	 * @param {json} [init] - Request extra params
	 * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
	 */
	ajax(url: string, method: string, init: any) {
		const source = axios.CancelToken.source();
		const promise = new Promise(async (res, rej) => {
			const parsed_url = new URL(url);

			const region: string = init.region || 'us-east-1';
			const service: string = init.serviceName || 'execute-api';

			const params = {
				method,
				url,
				host: parsed_url.host,
				path: parsed_url.pathname,
				headers: {},
				data: JSON.stringify(''),
				responseType: 'json',
				timeout: 0,
			};

			const libraryHeaders: any = {};
			const initParams: any = Object.assign({}, init);
			const isAllResponse = initParams.response;
			if (initParams.body) {
				if (
					typeof FormData === 'function' &&
					initParams.body instanceof FormData
				) {
					libraryHeaders['Content-Type'] = 'multipart/form-data';
					params.data = initParams.body;
				} else {
					libraryHeaders['Content-Type'] = 'application/json; charset=UTF-8';
					params.data = JSON.stringify(initParams.body);
				}
			}
			if (initParams.responseType) {
				params.responseType = initParams.responseType;
			}
			if (initParams.withCredentials) {
				params['withCredentials'] = initParams.withCredentials;
			}
			if (initParams.timeout) {
				params.timeout = initParams.timeout;
			}

			params['signerServiceInfo'] = initParams.signerServiceInfo;

			params.headers = {
				...libraryHeaders,
				...initParams.headers,
			};

			// Intentionally discarding search
			const { search, ...parsedUrl } = parse(url, true, true);
			params.url = format({
				...parsedUrl,
				query: {
					...parsedUrl.query,
					...(initParams.queryStringParameters || {}),
				},
			});

			// Do not sign the request if client has added 'Authorization' or x-api-key header,
			// which means custom authorizer.
			if (
				(params.headers['Authorization'] &&
					typeof params.headers['Authorization'] !== 'undefined') ||
				(params.headers['X-Api-Key'] &&
					typeof params.headers['X-Api-Key'] !== 'undefined')
			) {
				params.headers = Object.keys(params.headers).reduce((acc, k) => {
					if (params.headers[k]) {
						acc[k] = params.headers[k];
					}
					return acc;
					// tslint:disable-next-line:align
				}, {});

				return res(await this._request(params, isAllResponse));
			}

			let credentials: AWSCredentialsAndIdentityId;

			try {
				const session = await fetchAuthSession();
				if (
					session.credentials === undefined &&
					session.identityId === undefined
				) {
					throw new Error('No credentials available');
				}
				credentials = {
					credentials: session.credentials,
					identityId: session.identityId,
				};
			} catch (error) {
				res(await this._request(params, isAllResponse));
			}

			let signedParams;
			// before signed PARAMS
			signedParams = this._sign({ ...params }, credentials, {
				region,
				service,
			});

			try {
				res(
					await this._request({
						...signedParams,
						data: signedParams.body,
						cancelToken: source.token,
					})
				);
			} catch (error) {
				rej(error);
			}
		});
		this._cancelTokenMap.set(promise, source);

		return promise;
	}

	/**
	 * GET HTTP request
	 * @param {string | ApiInfo } urlOrApiInfo - Full request URL or Api information
	 * @param {JSON} init - Request extra params
	 * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
	 */
	get(urlOrApiInfo: string, init) {
		return this.ajax(urlOrApiInfo, 'GET', init);
	}

	/**
	 * PUT HTTP request
	 * @param {string | ApiInfo } urlOrApiInfo - Full request URL or Api information
	 * @param {json} init - Request extra params
	 * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
	 */
	put(urlOrApiInfo: string, init) {
		return this.ajax(urlOrApiInfo, 'PUT', init);
	}

	/**
	 * PATCH HTTP request
	 * @param {string | ApiInfo } urlOrApiInfo - Full request URL or Api information
	 * @param {json} init - Request extra params
	 * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
	 */
	patch(urlOrApiInfo: string, init) {
		return this.ajax(urlOrApiInfo, 'PATCH', init);
	}

	/**
	 * POST HTTP request
	 * @param {string | ApiInfo } urlOrApiInfo - Full request URL or Api information
	 * @param {json} init - Request extra params
	 * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
	 */
	post(urlOrApiInfo: string, init) {
		return this.ajax(urlOrApiInfo, 'POST', init);
	}

	/**
	 * DELETE HTTP request
	 * @param {string | ApiInfo } urlOrApiInfo - Full request URL or Api information
	 * @param {json} init - Request extra params
	 * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
	 */
	del(urlOrApiInfo: string, init) {
		return this.ajax(urlOrApiInfo, 'DELETE', init);
	}

	/**
	 * HEAD HTTP request
	 * @param {string | ApiInfo } urlOrApiInfo - Full request URL or Api information
	 * @param {json} init - Request extra params
	 * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
	 */
	head(urlOrApiInfo: string, init) {
		return this.ajax(urlOrApiInfo, 'HEAD', init);
	}

	/**
	 * Cancel an inflight API request
	 * @param {Promise<any>} request - The request promise to cancel
	 * @param {string} [message] - A message to include in the cancelation exception
	 */
	cancel(request: Promise<any>, message?: string) {
		const source = this._cancelTokenMap?.get(request);
		if (source) {
			source.cancel(message);
			return true;
		}
		return false;
	}

	/**
	 * Check if the request has a corresponding cancel token in the WeakMap.
	 * @params request - The request promise
	 * @return if the request has a corresponding cancel token.
	 */
	hasCancelToken(request: Promise<any>) {
		return this._cancelTokenMap?.has(request);
	}

	/**
	 * Checks to see if an error thrown is from an api request cancellation
	 * @param {any} error - Any error
	 * @return {boolean} - A boolean indicating if the error was from an api request cancellation
	 */
	isCancel(error): boolean {
		return axios.isCancel(error);
	}

	/**
	 * Retrieves a new and unique cancel token which can be
	 * provided in an axios request to be cancelled later.
	 */
	getCancellableToken(): CancelTokenSource {
		return axios.CancelToken.source();
	}

	/**
	 * Updates the weakmap with a response promise and its
	 * cancel token such that the cancel token can be easily
	 * retrieved (and used for cancelling the request)
	 */
	updateRequestToBeCancellable(
		promise: Promise<any>,
		cancelTokenSource: CancelTokenSource
	) {
		this._cancelTokenMap?.set(promise, cancelTokenSource);
	}

	/**
	 * Getting endpoint for API
	 * @param {string} apiName - The name of the api
	 * @return {string} - The endpoint of the api
	 */
	endpoint(apiName: string) {
		const cloud_logic_array = this._options.endpoints;
		let response = '';

		if (!Array.isArray(cloud_logic_array)) {
			return response;
		}

		cloud_logic_array.forEach(v => {
			if (v.name === apiName) {
				response = v.endpoint;
				if (typeof v.region === 'string') {
					this._region = v.region;
				} else if (typeof this._options.region === 'string') {
					this._region = this._options.region;
				}
				if (typeof v.service === 'string') {
					this._service = v.service || 'execute-api';
				} else {
					this._service = 'execute-api';
				}
				if (typeof v.custom_header === 'function') {
					this._custom_header = v.custom_header;
				} else {
					this._custom_header = undefined;
				}
			}
		});
		return response;
	}

	/** private methods **/

	private _sign(
		params: {
			method: string;
			url: string;
			host: string;
			path: string;
			headers: {};
			data: BodyInit;
			responseType: string;
			timeout: number;
		},
		credentialsAndIdentityId: AWSCredentialsAndIdentityId,
		{ service, region }
	) {
		const signed_params = signRequest(
			{
				method: params.method,
				headers: params.headers,
				url: new URL(params.url),
				body: params.data,
			},
			{
				credentials: credentialsAndIdentityId.credentials,
				signingRegion: region,
				signingService: service,
			}
		);

		delete signed_params.headers['host'];

		return signed_params;
	}

	private _request(params, isAllResponse = false) {
		return axios(params)
			.then(response => (isAllResponse ? response : response.data))
			.catch(error => {
				throw error;
			});
	}
}
