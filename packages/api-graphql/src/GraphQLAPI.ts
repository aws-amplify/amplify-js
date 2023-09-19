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
		// ): Observable<GraphQLResult<T>> | Promise<GraphQLResult<T>> {
	): any {
		return super.graphql(options, additionalHeaders);
	}
}

export const GraphQLAPI = new GraphQLAPIClass(null);
