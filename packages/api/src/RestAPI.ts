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
import { RestClient as RestClass } from './RestClient';
import {
	Amplify,
	ConsoleLogger as Logger,
	Credentials,
} from '@aws-amplify/core';

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
		if (this._options) {
			this._api = new RestClass(this._options);
			return true;
		} else {
			return Promise.reject('API not configured');
		}
	}

	/**
	 * Make a GET request
	 * @param {string} apiName  - The api name of the request
	 * @param {string} path - The path of the request
	 * @param {json} [init] - Request extra params
	 * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
	 */
	async get(apiName, path, init) {
		if (!this._api) {
			try {
				await this.createInstance();
			} catch (error) {
				return Promise.reject(error);
			}
		}

		const endpoint = this._api.endpoint(apiName);
		if (endpoint.length === 0) {
			return Promise.reject('API ' + apiName + ' does not exist');
		}
		return this._api.get(endpoint + path, init);
	}

	/**
	 * Make a POST request
	 * @param {string} apiName  - The api name of the request
	 * @param {string} path - The path of the request
	 * @param {json} [init] - Request extra params
	 * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
	 */
	async post(apiName, path, init) {
		if (!this._api) {
			try {
				await this.createInstance();
			} catch (error) {
				return Promise.reject(error);
			}
		}

		const endpoint = this._api.endpoint(apiName);
		if (endpoint.length === 0) {
			return Promise.reject('API ' + apiName + ' does not exist');
		}
		return this._api.post(endpoint + path, init);
	}

	/**
	 * Make a PUT request
	 * @param {string} apiName  - The api name of the request
	 * @param {string} path - The path of the request
	 * @param {json} [init] - Request extra params
	 * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
	 */
	async put(apiName, path, init) {
		if (!this._api) {
			try {
				await this.createInstance();
			} catch (error) {
				return Promise.reject(error);
			}
		}

		const endpoint = this._api.endpoint(apiName);
		if (endpoint.length === 0) {
			return Promise.reject('API ' + apiName + ' does not exist');
		}
		return this._api.put(endpoint + path, init);
	}

	/**
	 * Make a PATCH request
	 * @param {string} apiName  - The api name of the request
	 * @param {string} path - The path of the request
	 * @param {json} [init] - Request extra params
	 * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
	 */
	async patch(apiName, path, init) {
		if (!this._api) {
			try {
				await this.createInstance();
			} catch (error) {
				return Promise.reject(error);
			}
		}

		const endpoint = this._api.endpoint(apiName);
		if (endpoint.length === 0) {
			return Promise.reject('API ' + apiName + ' does not exist');
		}
		return this._api.patch(endpoint + path, init);
	}

	/**
	 * Make a DEL request
	 * @param {string} apiName  - The api name of the request
	 * @param {string} path - The path of the request
	 * @param {json} [init] - Request extra params
	 * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
	 */
	async del(apiName, path, init) {
		if (!this._api) {
			try {
				await this.createInstance();
			} catch (error) {
				return Promise.reject(error);
			}
		}

		const endpoint = this._api.endpoint(apiName);
		if (endpoint.length === 0) {
			return Promise.reject('API ' + apiName + ' does not exist');
		}
		return this._api.del(endpoint + path, init);
	}

	/**
	 * Make a HEAD request
	 * @param {string} apiName  - The api name of the request
	 * @param {string} path - The path of the request
	 * @param {json} [init] - Request extra params
	 * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
	 */
	async head(apiName, path, init) {
		if (!this._api) {
			try {
				await this.createInstance();
			} catch (error) {
				return Promise.reject(error);
			}
		}

		const endpoint = this._api.endpoint(apiName);
		if (endpoint.length === 0) {
			return Promise.reject('API ' + apiName + ' does not exist');
		}
		return this._api.head(endpoint + path, init);
	}

	/**
	 * Getting endpoint for API
	 * @param {string} apiName - The name of the api
	 * @return {string} - The endpoint of the api
	 */
	async endpoint(apiName) {
		if (!this._api) {
			try {
				await this.createInstance();
			} catch (error) {
				return Promise.reject(error);
			}
		}
		return this._api.endpoint(apiName);
	}

	/**
	 * @private
	 */
	_ensureCredentials() {
		return Credentials.get()
			.then(credentials => {
				if (!credentials) return false;
				const cred = Credentials.shear(credentials);
				logger.debug('set credentials for api', cred);

				return true;
			})
			.catch(err => {
				logger.warn('ensure credentials error', err);
				return false;
			});
	}
}

let _instance: RestAPIClass = null;

if (!_instance) {
	logger.debug('Creating Rest API Instance');
	_instance = new RestAPIClass(null);
	Amplify.register(_instance);
}

export { _instance as RestAPI };
