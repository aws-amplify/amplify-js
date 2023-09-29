// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { GraphQLOptions, GraphQLResult } from './types';
import { InternalGraphQLAPIClass } from './internals';
import { Observable } from 'rxjs';

export const graphqlOperation = (
	query,
	variables = {},
	authToken?: string
) => ({
	query,
	variables,
	authToken,
});

/**
 * Export Cloud Logic APIs
 */
export class GraphQLAPIClass extends InternalGraphQLAPIClass {
	public getModuleName() {
		return 'GraphQLAPI';
	}

	/**
	 * Executes a GraphQL operation
	 *
	 * @param options - GraphQL Options
	 * @param [additionalHeaders] - headers to merge in after any `graphql_headers` set in the config
	 * @returns An Observable if the query is a subscription query, else a promise of the graphql result.
	 */
	graphql<T = any>(
		options: GraphQLOptions,
		additionalHeaders?: { [key: string]: string }
	): Observable<GraphQLResult<T>> | Promise<GraphQLResult<T>> {
		return super.graphql(options, additionalHeaders);
	}

	/**
	 * Checks to see if an error thrown is from an api request cancellation
	 * @param {any} error - Any error
	 * @return {boolean} - A boolean indicating if the error was from an api request cancellation
	 */
	isCancelError(error: any): boolean {
		return super.isCancelError(error);
	}

	/**
	 * Cancels an inflight request. Only applicable for graphql queries and mutations
	 * @param {any} request - request to cancel
	 * @return {boolean} - A boolean indicating if the request was cancelled
	 */
	cancel(request: Promise<any>, message?: string): Promise<any> {
		return super.cancel(request, message);
	}
}

export const GraphQLAPI = new GraphQLAPIClass(null);
