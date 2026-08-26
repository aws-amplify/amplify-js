// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	AWSAppSyncRealTimeProvider,
	GraphQLOperation,
	GraphQLOptions,
	GraphQLQuery,
	GraphQLResult,
	GraphQLSubscription,
	OperationTypeNode,
} from '@aws-amplify/api-graphql';
import { InternalGraphQLAPIClass } from '@aws-amplify/api-graphql/internals';
import { Cache, getGlobalContext } from '@aws-amplify/core';
import {
	ApiAction,
	Category,
	CustomUserAgentDetails,
} from '@aws-amplify/core/internals/utils';
import { Observable, defer } from 'rxjs';
import { CustomHeaders } from '@aws-amplify/data-schema/runtime';

/**
 * NOTE!
 *
 * This is used only by DataStore.
 *
 * This can probably be pruned and/or removed. Just leaving it as much of the same
 * state as possible for V6 to reduce number of potentially impactful changes to DataStore.
 */

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
		customUserAgentDetails?: CustomUserAgentDetails,
	): T extends GraphQLQuery<T>
		? Promise<GraphQLResult<T>>
		: T extends GraphQLSubscription<T>
			? Observable<{
					provider: AWSAppSyncRealTimeProvider;
					value: GraphQLResult<T>;
				}>
			: Promise<GraphQLResult<any>> | Observable<object>;

	graphql<_ = any>(
		options: GraphQLOptions,
		additionalHeaders?: CustomHeaders,
		customUserAgentDetails?: CustomUserAgentDetails,
	): Promise<GraphQLResult<any>> | Observable<object> {
		const apiUserAgentDetails: CustomUserAgentDetails = {
			category: Category.API,
			action: ApiAction.GraphQl,
			...customUserAgentDetails,
		};

		/**
		 * IMPORTANT: do NOT resolve the global context eagerly (e.g. by passing
		 * `getGlobalContext()` directly as an argument). Because this method is
		 * synchronous, an eager call would throw SYNCHRONOUSLY out of `graphql()`
		 * when no global context has been set — breaking callers that expect
		 * setup errors on their async boundary. Most notably, DataStore's
		 * subscription processor expects an Observable whose errors arrive via
		 * `subscribe({ error })`, and query/mutation callers expect a rejected
		 * Promise.
		 *
		 * Instead we determine the operation type first (which does not touch the
		 * context) and defer context resolution to the appropriate boundary:
		 *   - subscription -> resolved lazily inside `defer()` so a missing context
		 *     surfaces on the Observable's error channel.
		 *   - query/mutation -> resolved inside a try/catch so a missing context
		 *     surfaces as a rejected Promise.
		 */
		const operationType = this.getGraphqlOperationTypeFromOptions(
			options.query,
		);

		switch (operationType) {
			case 'subscription':
				return defer(() =>
					this._graphqlApi.graphql(
						getGlobalContext(),
						options,
						additionalHeaders,
						apiUserAgentDetails,
					),
				);
			default:
				// `query` | `mutation`
				try {
					return this._graphqlApi.graphql(
						getGlobalContext(),
						options,
						additionalHeaders,
						apiUserAgentDetails,
					);
				} catch (error) {
					return Promise.reject(error);
				}
		}
	}

	/**
	 * Resolves the GraphQL operation type from the request options WITHOUT
	 * touching the Amplify context. This lets {@link graphql} pick the correct
	 * lazy-resolution strategy (rejected Promise vs. Observable error channel)
	 * before any context is resolved.
	 */
	private getGraphqlOperationTypeFromOptions(
		query: GraphQLOptions['query'],
	): OperationTypeNode {
		if (typeof query === 'string') {
			return this._graphqlApi.getGraphqlOperationType(query);
		}

		// `query` is a `DocumentNode`. Read the operation type off its first
		// operation definition directly, avoiding a `graphql` runtime dependency
		// in this package.
		for (const definition of query.definitions) {
			if (definition.kind === 'OperationDefinition') {
				return definition.operation;
			}
		}

		throw new Error('invalid operation: no operation definition found');
	}
}

export const InternalAPI = new InternalAPIClass();
