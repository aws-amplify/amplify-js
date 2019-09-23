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
import { RestAPI } from './RestAPI';
import { GraphQLAPI } from './GraphQLAPI';
import { GraphQLOptions } from './types';
import { Amplify, ConsoleLogger as Logger } from '@aws-amplify/core';
import * as Observable from 'zen-observable';

const logger = new Logger('API');
/**
 * @deprecated
 * Export Cloud Logic APIs
 */
export class APIClass {
	/**
	 * Initialize API with AWS configuration
	 * @param {Object} options - Configuration object for API
	 */
	constructor() {}

	public getModuleName() {
		return 'API';
	}

	/**
	 * Configure API part with aws configurations
	 * @param {Object} config - Configuration of the API
	 * @return {Object} - The current configuration
	 */
	configure(options) {
		const restAPIConfig = RestAPI.configure(options);
		const graphQLAPIConfig = GraphQLAPI.configure(options);

		return { ...restAPIConfig, ...graphQLAPIConfig };
	}

	/**
	 * Make a GET request
	 * @param {string} apiName  - The api name of the request
	 * @param {string} path - The path of the request
	 * @param {json} [init] - Request extra params
	 * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
	 */
	async get(apiName, path, init) {
		return RestAPI.get(apiName, path, init);
	}

	/**
	 * Make a POST request
	 * @param {string} apiName  - The api name of the request
	 * @param {string} path - The path of the request
	 * @param {json} [init] - Request extra params
	 * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
	 */
	async post(apiName, path, init) {
		return RestAPI.post(apiName, path, init);
	}

	/**
	 * Make a PUT request
	 * @param {string} apiName  - The api name of the request
	 * @param {string} path - The path of the request
	 * @param {json} [init] - Request extra params
	 * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
	 */
	async put(apiName, path, init) {
		return RestAPI.put(apiName, path, init);
	}

	/**
	 * Make a PATCH request
	 * @param {string} apiName  - The api name of the request
	 * @param {string} path - The path of the request
	 * @param {json} [init] - Request extra params
	 * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
	 */
	async patch(apiName, path, init) {
		return RestAPI.patch(apiName, path, init);
	}

	/**
	 * Make a DEL request
	 * @param {string} apiName  - The api name of the request
	 * @param {string} path - The path of the request
	 * @param {json} [init] - Request extra params
	 * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
	 */
	async del(apiName, path, init) {
		return RestAPI.del(apiName, path, init);
	}

	/**
	 * Make a HEAD request
	 * @param {string} apiName  - The api name of the request
	 * @param {string} path - The path of the request
	 * @param {json} [init] - Request extra params
	 * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
	 */
	async head(apiName, path, init) {
		return RestAPI.head(apiName, path, init);
	}

	/**
	 * to get the operation type
	 * @param operation
	 */
	getGraphqlOperationType(operation) {
		return GraphQLAPI.getGraphqlOperationType(operation);
	}

	/**
	 * Executes a GraphQL operation
	 *
	 * @param {GraphQLOptions} GraphQL Options
	 * @returns {Promise<GraphQLResult> | Observable<object>}
	 */
	graphql(options: GraphQLOptions) {
		return GraphQLAPI.graphql(options);
	}
}

let _instance: APIClass = null;

if (!_instance) {
	logger.debug('Creating API Instance');
	_instance = new APIClass();
	Amplify.register(_instance);
}

export { _instance as API };

/**
 * @deprecated use named import
 */
export default APIClass;
