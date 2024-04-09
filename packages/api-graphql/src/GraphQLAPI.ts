// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AmplifyClassV6 } from '@aws-amplify/core';
import { ApiAction, Category } from '@aws-amplify/core/internals/utils';
import { CustomHeaders } from '@aws-amplify/data-schema/runtime';
import { Observable } from 'rxjs';

import { GraphQLOptions, GraphQLResult } from './types';
import { InternalGraphQLAPIClass } from './internals/InternalGraphQLAPI';

export const graphqlOperation = (
	query: any,
	variables = {},
	authToken?: string,
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
	 * @param [additionalHeaders] - headers to merge in after any `libraryConfigHeaders` set in the config
	 * @returns An Observable if the query is a subscription query, else a promise of the graphql result.
	 */
	graphql<T = any>(
		amplify: AmplifyClassV6 | (() => Promise<AmplifyClassV6>),
		options: GraphQLOptions,
		additionalHeaders?: CustomHeaders,
	): Observable<GraphQLResult<T>> | Promise<GraphQLResult<T>> {
		return super.graphql(amplify, options, additionalHeaders, {
			category: Category.API,
			action: ApiAction.GraphQl,
		});
	}

	/**
	 * Checks to see if an error thrown is from an api request cancellation
	 * @param error - Any error
	 * @returns A boolean indicating if the error was from an api request cancellation
	 */
	isCancelError(error: any): boolean {
		return super.isCancelError(error);
	}

	/**
	 * Cancels an inflight request. Only applicable for graphql queries and mutations
	 * @param {any} request - request to cancel
	 * @returns A boolean indicating if the request was cancelled
	 */
	cancel(request: Promise<any>, message?: string): boolean {
		return super.cancel(request, message);
	}
}

export const GraphQLAPI = new GraphQLAPIClass();
