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
import { Amplify, Cache, ConsoleLogger } from '@aws-amplify/core';
import {
	ApiAction,
	Category,
	CustomUserAgentDetails,
} from '@aws-amplify/core/internals/utils';
import { Observable } from 'rxjs';
import { CustomHeaders } from '@aws-amplify/data-schema-types';

/**
 * NOTE!
 *
 * This is used only by DataStore.
 *
 * This can probably be pruned and/or removed. Just leaving it as much of the same
 * state as possible for V6 to reduce number of potentially impactful changes to DataStore.
 */

const logger = new ConsoleLogger('API');
/**
 * @deprecated
 * Use RestApi or GraphQLAPI to reduce your application bundle size
 * Export Cloud Logic APIs
 */
export class InternalAPIClass {
	private _graphqlApi: InternalGraphQLAPIClass;

	Cache = Cache;

	/**
	 * Initialize API
	 */
	constructor() {
		this._graphqlApi = new InternalGraphQLAPIClass();
	}

	public getModuleName() {
		return 'InternalAPI';
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
	 * @param [additionalHeaders] - headers to merge in after any `libraryConfigHeaders` set in the config
	 * @returns An Observable if queryType is 'subscription', else a promise of the graphql result from the query.
	 */
	graphql<T>(
		options: GraphQLOptions,
		additionalHeaders?: CustomHeaders,
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
		additionalHeaders?: CustomHeaders,
		customUserAgentDetails?: CustomUserAgentDetails
	): Promise<GraphQLResult<any>> | Observable<object> {
		const apiUserAgentDetails: CustomUserAgentDetails = {
			category: Category.API,
			action: ApiAction.GraphQl,
			...customUserAgentDetails,
		};

		return this._graphqlApi.graphql(
			Amplify,
			options,
			additionalHeaders,
			apiUserAgentDetails
		);
	}
}

export const InternalAPI = new InternalAPIClass();
