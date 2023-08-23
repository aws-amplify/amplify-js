// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	GraphQLOperation,
	GraphQLOptions,
	GraphQLResult,
	OperationTypeNode,
} from '@aws-amplify/api-graphql';
import { InternalGraphQLAPIClass } from '@aws-amplify/api-graphql/internals';
import { RestAPIClass } from '@aws-amplify/api-rest';
import { Auth } from '@aws-amplify/auth';
import { Cache } from '@aws-amplify/cache';
import {
	Amplify,
	ApiAction,
	Category,
	Credentials,
	CustomUserAgentDetails,
	ConsoleLogger as Logger,
} from '@aws-amplify/core';
import { AWSAppSyncRealTimeProvider } from '@aws-amplify/pubsub';
import Observable from 'zen-observable-ts';
import { GraphQLQuery, GraphQLSubscription } from '../types';

const logger = new Logger('API');
/**
 * @deprecated
 * Use RestApi or GraphQLAPI to reduce your application bundle size
 * Export Cloud Logic APIs
 */
export class InternalAPIClass {
	/**
	 * Initialize API with AWS configuration
	 * @param {Object} options - Configuration object for API
	 */
	private _options;
	private _restApi: RestAPIClass;
	private _graphqlApi: InternalGraphQLAPIClass;

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
		this._graphqlApi = new InternalGraphQLAPIClass(options);
		logger.debug('API Options', this._options);
	}

	public getModuleName() {
		return 'InternalAPI';
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
		return this._restApi.get(
			apiName,
			path,
			this.getInitWithCustomUserAgentDetails(init, ApiAction.Get)
		);
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
		return this._restApi.post(
			apiName,
			path,
			this.getInitWithCustomUserAgentDetails(init, ApiAction.Post)
		);
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
		return this._restApi.put(
			apiName,
			path,
			this.getInitWithCustomUserAgentDetails(init, ApiAction.Put)
		);
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
		return this._restApi.patch(
			apiName,
			path,
			this.getInitWithCustomUserAgentDetails(init, ApiAction.Patch)
		);
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
		return this._restApi.del(
			apiName,
			path,
			this.getInitWithCustomUserAgentDetails(init, ApiAction.Del)
		);
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
		return this._restApi.head(
			apiName,
			path,
			this.getInitWithCustomUserAgentDetails(init, ApiAction.Head)
		);
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

	private getInitWithCustomUserAgentDetails(
		init: { [key: string]: any },
		action: ApiAction
	) {
		const customUserAgentDetails: CustomUserAgentDetails = {
			category: Category.API,
			action,
		};
		const initParams = { ...init, customUserAgentDetails };
		return initParams;
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
		additionalHeaders?: { [key: string]: string },
		customUserAgentDetails?: CustomUserAgentDetails
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
		additionalHeaders?: { [key: string]: string },
		customUserAgentDetails?: CustomUserAgentDetails
	): Promise<GraphQLResult<any>> | Observable<object> {
		const apiUserAgentDetails: CustomUserAgentDetails = {
			category: Category.API,
			action: ApiAction.GraphQl,
			...customUserAgentDetails,
		};

		return this._graphqlApi.graphql(
			options,
			additionalHeaders,
			apiUserAgentDetails
		);
	}
}

export const InternalAPI = new InternalAPIClass(null);
Amplify.register(InternalAPI);
