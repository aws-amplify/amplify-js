// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	GraphQLOperation,
	// GraphQLOptions,
	GraphQLOptionsV6,
	GraphQLResult,
	OperationTypeNode,
	GraphQLQuery,
	GraphQLSubscription,
} from '@aws-amplify/api-graphql';
// TODO V6
import { InternalGraphQLAPIClass } from '@aws-amplify/api-graphql/internals';
// import { RestAPIClass } from '@aws-amplify/api-rest';
import { post, cancel, isCancel } from '@aws-amplify/api-rest';
// TODO this doesn't exist anymore:
// import { Auth } from '@aws-amplify/auth';
import { Cache } from '@aws-amplify/core';
// TODO V6
// import {
// 	Amplify,
// 	ApiAction,
// 	Category,
// 	Credentials,
// 	CustomUserAgentDetails,
// 	ConsoleLogger as Logger,
// } from '@aws-amplify/core';
import { ConsoleLogger as Logger } from '@aws-amplify/core/internals/utils';
// import { AmplifyV6 } from '@aws-amplify';
import {
	ApiAction,
	Category,
	CustomUserAgentDetails,
} from '@aws-amplify/core/internals/utils';

// import { AWSAppSyncRealTimeProvider } from '@aws-amplify/pubsub';
import { AWSAppSyncRealTimeProvider } from '@aws-amplify/api-graphql';
import Observable from 'zen-observable-ts';

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
	// private _restApi: RestAPIClass;
	private _graphqlApi: InternalGraphQLAPIClass;

	// Auth = Auth;
	Cache = Cache;
	// Credentials = Credentials;

	/**
	 * Initialize API with AWS configuration
	 * @param {Object} options - Configuration object for API
	 */
	constructor(options) {
		this._options = options;
		// TODO V6
		// this._restApi = new RestAPIClass(options);
		// TODO V6 - support for options:
		// const config = Amplify.getConfig();
		// debugger;
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
	// configure(options) {
	// 	this._options = Object.assign({}, this._options, options);

	// 	// Share Amplify instance with client for SSR
	// 	// this._restApi.Credentials = this.Credentials;

	// 	// this._graphqlApi.Auth = this.Auth;
	// 	this._graphqlApi.Cache = this.Cache;
	// 	// this._graphqlApi.Credentials = this.Credentials;

	// 	// TODO V6 - `Amplify.getConfig` for REST?
	// 	// const restAPIConfig = Amplify.getConfig().RestApi;

	// 	// V5:
	// 	// const restAPIConfig = this._restApi.configure(this._options);
	// 	const graphQLAPIConfig = this._graphqlApi.configure(this._options);

	// 	// return { ...restAPIConfig, ...graphQLAPIConfig };
	// 	return { ...graphQLAPIConfig };
	// }

	/**
	 * Make a GET request
	 * @param apiName - The api name of the request
	 * @param path - The path of the request
	 * @param [init] - Request extra params
	 * @return A promise that resolves to an object with response status and JSON data, if successful.
	 */
	// TODO: need REST API `get` method
	// get(
	// 	apiName: string,
	// 	path: string,
	// 	init: { [key: string]: any }
	// ): Promise<any> {
	// 	return this._restApi.get(
	// 		apiName,
	// 		path,
	// 		this.getInitWithCustomUserAgentDetails(init, ApiAction.Get)
	// 	);
	// }

	/**
	 * Make a POST request
	 * @param apiName - The api name of the request
	 * @param path - The path of the request
	 * @param [init] - Request extra params
	 * @return A promise that resolves to an object with response status and JSON data, if successful.
	 */
	// post(
	// 	apiName: string,
	// 	path: string,
	// 	init: { [key: string]: any }
	// ): Promise<any> {
	// 	return this._restApi.post(
	// 		apiName,
	// 		path,
	// 		this.getInitWithCustomUserAgentDetails(init, ApiAction.Post)
	// 	);
	// }

	/**
	 * Make a PUT request
	 * @param apiName - The api name of the request
	 * @param path - The path of the request
	 * @param [init] - Request extra params
	 * @return A promise that resolves to an object with response status and JSON data, if successful.
	 */
	// TODO: need REST API `put` method
	// put(
	// 	apiName: string,
	// 	path: string,
	// 	init: { [key: string]: any }
	// ): Promise<any> {
	// 	return this._restApi.put(
	// 		apiName,
	// 		path,
	// 		this.getInitWithCustomUserAgentDetails(init, ApiAction.Put)
	// 	);
	// }

	/**
	 * Make a PATCH request
	 * @param apiName - The api name of the request
	 * @param path - The path of the request
	 * @param [init] - Request extra params
	 * @return A promise that resolves to an object with response status and JSON data, if successful.
	 */
	// TODO: need REST API `patch` method
	// patch(
	// 	apiName: string,
	// 	path: string,
	// 	init: { [key: string]: any }
	// ): Promise<any> {
	// 	return this._restApi.patch(
	// 		apiName,
	// 		path,
	// 		this.getInitWithCustomUserAgentDetails(init, ApiAction.Patch)
	// 	);
	// }

	/**
	 * Make a DEL request
	 * @param apiName - The api name of the request
	 * @param path - The path of the request
	 * @param [init] - Request extra params
	 * @return A promise that resolves to an object with response status and JSON data, if successful.
	 */
	// TODO: need REST API `del` method
	// del(
	// 	apiName: string,
	// 	path: string,
	// 	init: { [key: string]: any }
	// ): Promise<any> {
	// 	return this._restApi.del(
	// 		apiName,
	// 		path,
	// 		this.getInitWithCustomUserAgentDetails(init, ApiAction.Del)
	// 	);
	// }

	/**
	 * Make a HEAD request
	 * @param apiName - The api name of the request
	 * @param path - The path of the request
	 * @param [init] - Request extra params
	 * @return A promise that resolves to an object with response status and JSON data, if successful.
	 */
	// TODO: need REST API `head` method
	// head(
	// 	apiName: string,
	// 	path: string,
	// 	init: { [key: string]: any }
	// ): Promise<any> {
	// 	return this._restApi.head(
	// 		apiName,
	// 		path,
	// 		this.getInitWithCustomUserAgentDetails(init, ApiAction.Head)
	// 	);
	// }

	/**
	 * Checks to see if an error thrown is from an api request cancellation
	 * @param error - Any error
	 * @return If the error was from an api request cancellation
	 */
	isCancel(error: any): boolean {
		// return this._restApi.isCancel(error);
		return isCancel(error);
	}
	/**
	 * Cancels an inflight request for either a GraphQL request or a Rest API request.
	 * @param request - request to cancel
	 * @param [message] - custom error message
	 * @return If the request was cancelled
	 */
	// TODO V6 - need `hasCancelToken` from REST API, or
	// `isCancel` needs to accept both errors and requests.
	cancel(request: Promise<any>, message?: string): boolean {
		// if (this._restApi.hasCancelToken(request)) {
		// 	return this._restApi.cancel(request, message);
		// } else if (this._graphqlApi.hasCancelToken(request)) {
		// 	return this._graphqlApi.cancel(request, message);
		// }
		// return false;
		return cancel(request, message);
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
	// TODO: need REST API `endpoint` method
	// async endpoint(apiName: string): Promise<string> {
	// 	return this._restApi.endpoint(apiName);
	// }

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
		options: GraphQLOptionsV6,
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
		options: GraphQLOptionsV6,
		additionalHeaders?: { [key: string]: string },
		customUserAgentDetails?: CustomUserAgentDetails
	): Promise<GraphQLResult<any>> | Observable<object> {
		const apiUserAgentDetails: CustomUserAgentDetails = {
			category: Category.API,
			action: ApiAction.GraphQl,
			...customUserAgentDetails,
		};

		// debugger;
		return this._graphqlApi.graphql(
			options,
			additionalHeaders,
			apiUserAgentDetails
		);
	}
}

export const InternalAPI = new InternalAPIClass(null);
// Amplify.register(InternalAPI);
