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
import { RestClient } from './RestClient';
import Amplify, { ConsoleLogger as Logger } from '@aws-amplify/core';

const logger = new Logger('RestAPI');

/**
 * Export Cloud Logic APIs
 */
export class RestAPIClass {
	/**
	 * @private
	 */
	private _options;
	private _api = null;

	/**
	 * Initialize Rest API with AWS configuration
	 * @param {Object} options - Configuration object for API
	 */
	constructor(options) {
		this._options = options;
		Amplify.register(this);
		logger.debug('API Options', this._options);
	}

	public getModuleName() {
		return 'RestAPI';
	}

	/**
	 * Configure API part with aws configurations
	 * @param {Object} config - Configuration of the API
	 * @return {Object} - The current configuration
	 */
	configure(options) {
		const { API = {}, ...otherOptions } = options || {};
		let opt = { ...otherOptions, ...API };
		logger.debug('configure Rest API', { opt });

		if (opt['aws_project_region']) {
			if (opt['aws_cloud_logic_custom']) {
				const custom = opt['aws_cloud_logic_custom'];
				opt.endpoints =
					typeof custom === 'string' ? JSON.parse(custom) : custom;
			}

			opt = Object.assign({}, opt, {
				region: opt['aws_project_region'],
				header: {},
			});
		}

		if (!Array.isArray(opt.endpoints)) {
			opt.endpoints = [];
		}

		// Check if endpoints has custom_headers and validate if is a function
		opt.endpoints.forEach(endpoint => {
			if (
				typeof endpoint.custom_header !== 'undefined' &&
				typeof endpoint.custom_header !== 'function'
			) {
				logger.warn(
					'Rest API ' + endpoint.name + ', custom_header should be a function'
				);
				endpoint.custom_header = undefined;
			}
		});

		this._options = Object.assign({}, this._options, opt);

		this.createInstance();

		return this._options;
	}

	/**
	 * Create an instance of API for the library
	 * @return - A promise of true if Success
	 */
	createInstance() {
		logger.debug('create Rest API instance');
		this._api = new RestClient(this._options);
		return true;
	}

	/**
	 * Make a GET request
	 * @param {string} apiName  - The api name of the request
	 * @param {string} path - The path of the request
	 * @param {json} [init] - Request extra params
	 * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
	 */
	get(apiName, path, init): Promise<any> {
		const endpoint = this._api.endpoint(apiName);
		if (endpoint.length === 0) {
			return Promise.reject('API ' + apiName + ' does not exist');
		}
		const cancellableToken = this._api.getCancellableToken();
		const initParams = Object.assign({}, init);
		initParams.cancellableToken = cancellableToken;
		const responsePromise = this._api.get(endpoint + path, initParams);
		this._api.updateRequestToBeCancellable(responsePromise, cancellableToken);
		return responsePromise;
	}

	/**
	 * Make a POST request
	 * @param {string} apiName  - The api name of the request
	 * @param {string} path - The path of the request
	 * @param {json} [init] - Request extra params
	 * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
	 */
	post(apiName, path, init): Promise<any> {
		const endpoint = this._api.endpoint(apiName);
		if (endpoint.length === 0) {
			return Promise.reject('API ' + apiName + ' does not exist');
		}
		const cancellableToken = this._api.getCancellableToken();
		const initParams = Object.assign({}, init);
		initParams.cancellableToken = cancellableToken;
		const responsePromise = this._api.post(endpoint + path, initParams);
		this._api.updateRequestToBeCancellable(responsePromise, cancellableToken);
		return responsePromise;
	}

	/**
	 * Make a PUT request
	 * @param {string} apiName  - The api name of the request
	 * @param {string} path - The path of the request
	 * @param {json} [init] - Request extra params
	 * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
	 */
	put(apiName, path, init): Promise<any> {
		const endpoint = this._api.endpoint(apiName);
		if (endpoint.length === 0) {
			return Promise.reject('API ' + apiName + ' does not exist');
		}
		const cancellableToken = this._api.getCancellableToken();
		const initParams = Object.assign({}, init);
		initParams.cancellableToken = cancellableToken;
		const responsePromise = this._api.put(endpoint + path, initParams);
		this._api.updateRequestToBeCancellable(responsePromise, cancellableToken);
		return responsePromise;
	}

	/**
	 * Make a PATCH request
	 * @param {string} apiName  - The api name of the request
	 * @param {string} path - The path of the request
	 * @param {json} [init] - Request extra params
	 * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
	 */
	patch(apiName, path, init): Promise<any> {
		const endpoint = this._api.endpoint(apiName);
		if (endpoint.length === 0) {
			return Promise.reject('API ' + apiName + ' does not exist');
		}
		const cancellableToken = this._api.getCancellableToken();
		const initParams = Object.assign({}, init);
		initParams.cancellableToken = cancellableToken;
		const responsePromise = this._api.patch(endpoint + path, initParams);
		this._api.updateRequestToBeCancellable(responsePromise, cancellableToken);
		return responsePromise;
	}

	/**
	 * Make a DEL request
	 * @param {string} apiName  - The api name of the request
	 * @param {string} path - The path of the request
	 * @param {json} [init] - Request extra params
	 * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
	 */
	del(apiName, path, init): Promise<any> {
		const endpoint = this._api.endpoint(apiName);
		if (endpoint.length === 0) {
			return Promise.reject('API ' + apiName + ' does not exist');
		}
		const cancellableToken = this._api.getCancellableToken();
		const initParams = Object.assign({}, init);
		initParams.cancellableToken = cancellableToken;
		const responsePromise = this._api.del(endpoint + path, initParams);
		this._api.updateRequestToBeCancellable(responsePromise, cancellableToken);
		return responsePromise;
	}

	/**
	 * Make a HEAD request
	 * @param {string} apiName  - The api name of the request
	 * @param {string} path - The path of the request
	 * @param {json} [init] - Request extra params
	 * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
	 */
	head(apiName, path, init): Promise<any> {
		const endpoint = this._api.endpoint(apiName);
		if (endpoint.length === 0) {
			return Promise.reject('API ' + apiName + ' does not exist');
		}
		const cancellableToken = this._api.getCancellableToken();
		const initParams = Object.assign({}, init);
		initParams.cancellableToken = cancellableToken;
		const responsePromise = this._api.head(endpoint + path, initParams);
		this._api.updateRequestToBeCancellable(responsePromise, cancellableToken);
		return responsePromise;
	}

	/**
	 * Checks to see if an error thrown is from an api request cancellation
	 * @param {any} error - Any error
	 * @return {boolean} - A boolean indicating if the error was from an api request cancellation
	 */
	isCancel(error) {
		return this._api.isCancel(error);
	}

	/**
	 * Cancels an inflight request
	 * @param {any} request - request to cancel
	 * @return {boolean} - A boolean indicating if the request was cancelled
	 */
	cancel(request: Promise<any>, message?: string) {
		return this._api.cancel(request, message);
	}

	/**
	 * Getting endpoint for API
	 * @param {string} apiName - The name of the api
	 * @return {string} - The endpoint of the api
	 */
	async endpoint(apiName) {
		return this._api.endpoint(apiName);
	}
}

export const RestAPI = new RestAPIClass(null);
