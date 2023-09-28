// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	AWSAppSyncRealTimeProvider,
	GraphQLOperation,
	GraphQLOptions,
	GraphQLResult,
	OperationTypeNode,
	GraphQLQuery,
	GraphQLSubscription,
} from '@aws-amplify/api-graphql';
import { InternalGraphQLAPIClass } from '@aws-amplify/api-graphql/internals';
import { cancel, isCancel } from '@aws-amplify/api-rest';
import { Cache } from '@aws-amplify/core';
import {
	ApiAction,
	Category,
	ConsoleLogger as Logger,
	CustomUserAgentDetails,
} from '@aws-amplify/core/internals/utils';
import { Observable } from 'rxjs';

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
	private _graphqlApi: InternalGraphQLAPIClass;

	Cache = Cache;

	/**
	 * Initialize API with AWS configuration
	 * @param {Object} options - Configuration object for API
	 */
	constructor(options) {
		this._options = options;
		this._graphqlApi = new InternalGraphQLAPIClass(options);
		logger.debug('API Options', this._options);
	}

	public getModuleName() {
		return 'InternalAPI';
	}

	/**
	 * Checks to see if an error thrown is from an api request cancellation
	 * @param error - Any error
	 * @return If the error was from an api request cancellation
	 */
	isCancel(error: any): boolean {
		return isCancel(error);
	}
	/**
	 * Cancels an inflight request for either a GraphQL request or a Rest API request.
	 * @param request - request to cancel
	 * @param [message] - custom error message
	 * @return If the request was cancelled
	 */
	cancel(request: Promise<any>, message?: string): boolean {
		// TODO: awaiting REST API implementation - do we check for token?
		return cancel(request, message);
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
