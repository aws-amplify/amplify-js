/*
 * Copyright 2017-2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
import { Auth } from '@aws-amplify/auth';
import { BrowserStorageCache as Cache } from '@aws-amplify/cache';
import { AWSAppSyncRealTimeProvider } from '@aws-amplify/pubsub';
import { RestAPIClass } from '@aws-amplify/api-rest';
import {
	GraphQLAPIClass,
	GraphQLOptions,
	GraphQLResult,
	GraphQLOperation,
	OperationTypeNode,
} from '@aws-amplify/api-graphql';
import {
	Amplify,
	ConsoleLogger as Logger,
	Credentials,
} from '@aws-amplify/core';
import Observable from 'zen-observable-ts';
import { GraphQLQuery, GraphQLSubscription } from './types';

const logger = new Logger('API');
/**
 * @deprecated
 * Use RestApi or GraphQLAPI to reduce your application bundle size
 * Export Cloud Logic APIs
 */
export class APIClass {
	/**
	 * Initialize API with AWS configuration
	 * @param {Object} options - Configuration object for API
	 */
	private _options;
	private _restApi: RestAPIClass;
	private _graphqlApi: GraphQLAPIClass;

	Auth = Auth;
	Cache = Cache;
	Credentials = Credentials;

	/**
	 * Initialize API with AWS configuration
	 * @param {Object} options - Configuration object for API
	 */
	constructor(options) {
		this._options = options;
		this._restApi = new RestAPIClass(options);
		this._graphqlApi = new GraphQLAPIClass(options);
		logger.debug('API Options', this._options);
	}

	public getModuleName() {
		return 'API';
	}

	/**
	 * Configure API part with aws configurations
	 * @param {Object} config - Configuration of the API
	 * @return {Object} - The current configuration
	 */
	configure(options) {
		this._options = Object.assign({}, this._options, options);

		// Share Amplify instance with client for SSR
		this._restApi.Credentials = this.Credentials;

		this._graphqlApi.Auth = this.Auth;
		this._graphqlApi.Cache = this.Cache;
		this._graphqlApi.Credentials = this.Credentials;

		const restAPIConfig = this._restApi.configure(this._options);
		const graphQLAPIConfig = this._graphqlApi.configure(this._options);

		return { ...restAPIConfig, ...graphQLAPIConfig };
	}

	/**
	 * Make a GET request
	 * @param apiName - The api name of the request
	 * @param path - The path of the request
	 * @param [init] - Request extra params
	 * @return A promise that resolves to an object with response status and JSON data, if successful.
	 */
	get(
		apiName: string,
		path: string,
		init: { [key: string]: any }
	): Promise<any> {
		return this._restApi.get(apiName, path, init);
	}

	/**
	 * Make a POST request
	 * @param apiName - The api name of the request
	 * @param path - The path of the request
	 * @param [init] - Request extra params
	 * @return A promise that resolves to an object with response status and JSON data, if successful.
	 */
	post(
		apiName: string,
		path: string,
		init: { [key: string]: any }
	): Promise<any> {
		return this._restApi.post(apiName, path, init);
	}

	/**
	 * Make a PUT request
	 * @param apiName - The api name of the request
	 * @param path - The path of the request
	 * @param [init] - Request extra params
	 * @return A promise that resolves to an object with response status and JSON data, if successful.
	 */
	put(
		apiName: string,
		path: string,
		init: { [key: string]: any }
	): Promise<any> {
		return this._restApi.put(apiName, path, init);
	}

	/**
	 * Make a PATCH request
	 * @param apiName - The api name of the request
	 * @param path - The path of the request
	 * @param [init] - Request extra params
	 * @return A promise that resolves to an object with response status and JSON data, if successful.
	 */
	patch(
		apiName: string,
		path: string,
		init: { [key: string]: any }
	): Promise<any> {
		return this._restApi.patch(apiName, path, init);
	}

	/**
	 * Make a DEL request
	 * @param apiName - The api name of the request
	 * @param path - The path of the request
	 * @param [init] - Request extra params
	 * @return A promise that resolves to an object with response status and JSON data, if successful.
	 */
	del(
		apiName: string,
		path: string,
		init: { [key: string]: any }
	): Promise<any> {
		return this._restApi.del(apiName, path, init);
	}

	/**
	 * Make a HEAD request
	 * @param apiName - The api name of the request
	 * @param path - The path of the request
	 * @param [init] - Request extra params
	 * @return A promise that resolves to an object with response status and JSON data, if successful.
	 */
	head(
		apiName: string,
		path: string,
		init: { [key: string]: any }
	): Promise<any> {
		return this._restApi.head(apiName, path, init);
	}

	/**
	 * Checks to see if an error thrown is from an api request cancellation
	 * @param error - Any error
	 * @return If the error was from an api request cancellation
	 */
	isCancel(error: any): boolean {
		return this._restApi.isCancel(error);
	}
	/**
	 * Cancels an inflight request for either a GraphQL request or a Rest API request.
	 * @param request - request to cancel
	 * @param [message] - custom error message
	 * @return If the request was cancelled
	 */
	cancel(request: Promise<any>, message?: string): boolean {
		if (this._restApi.hasCancelToken(request)) {
			return this._restApi.cancel(request, message);
		} else if (this._graphqlApi.hasCancelToken(request)) {
			return this._graphqlApi.cancel(request, message);
		}
		return false;
	}

	/**
	 * Getting endpoint for API
	 * @param apiName - The name of the api
	 * @return The endpoint of the api
	 */
	async endpoint(apiName: string): Promise<string> {
		return this._restApi.endpoint(apiName);
	}

	/**
	 * to get the operation type
	 * @param operation
	 */
	getGraphqlOperationType(operation: GraphQLOperation): OperationTypeNode {
		return this._graphqlApi.getGraphqlOperationType(operation);
	}

	/**
	 * Executes a GraphQL operation
	 *
	 * @param options - GraphQL Options
	 * @param [additionalHeaders] - headers to merge in after any `graphql_headers` set in the config
	 * @returns An Observable if queryType is 'subscription', else a promise of the graphql result from the query.
	 */
	graphql<T>(
		options: GraphQLOptions,
		additionalHeaders?: { [key: string]: string }
	): T extends GraphQLQuery<T>
		? Promise<GraphQLResult<T>>
		: T extends GraphQLSubscription<T>
		? Observable<{
				provider: AWSAppSyncRealTimeProvider;
				value: GraphQLResult<T>;
		  }>
		: Promise<GraphQLResult<any>> | Observable<object>;
	graphql<T = any>(
		options: GraphQLOptions,
		additionalHeaders?: { [key: string]: string }
	): Promise<GraphQLResult<any>> | Observable<object> {
		return this._graphqlApi.graphql(options, additionalHeaders);
	}
}

export const API = new APIClass(null);
Amplify.register(API);
