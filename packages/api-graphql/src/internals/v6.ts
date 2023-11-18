// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { GraphQLAPI } from '../GraphQLAPI';
import {
	__amplify,
	__authMode,
	__authToken,
	V6Client,
	GraphQLOptionsV6,
	GraphQLResponseV6,
} from '../types';
import { CustomHeaders } from '@aws-amplify/data-schema-types';

/**
 * Invokes graphql operations against a graphql service, providing correct input and
 * output types if Amplify-generated graphql from a recent version of the CLI/codegen
 * are used *or* correct typing is provided via the type argument.
 *
 * Amplify-generated "branded" graphql queries will look similar to this:
 *
 * ```ts
 *                               //
 *                               // |-- branding
 *                               // v
 * export const getModel = `...` as GeneratedQuery<
 * 	GetModelQueryVariables,
 * 	GetModelQuery
 * >;
 * ```
 *
 * If this branding is not in your generated graphql, update to a newer version of
 * CLI/codegen and regenerate your graphql using `amplify codegen`.
 *
 * ## Using Amplify-generated graphql
 *
 * ```ts
 * import * as queries from './graphql/queries';
 *
 * //
 * //    |-- correctly typed graphql response containing a Widget
 * //    v
 * const queryResult = await graphql({
 * 	query: queries.getWidget,
 * 	variables: {
 * 		id: "abc", // <-- type hinted/enforced
 * 	},
 * });
 *
 * //
 * //    |-- a correctly typed Widget
 * //    v
 * const fetchedWidget = queryResult.data?.getWidget!;
 * ```
 *
 * ## Custom input + result types
 *
 * To provide input types (`variables`) and result types:
 *
 * ```ts
 * type GetById_NameOnly = {
 * 	variables: {
 * 		id: string
 * 	},
 * 	result: Promise<{
 * 		data: { getWidget: { name: string } }
 * 	}>
 * }
 *
 * //
 * //    |-- type is GetById_NameOnly["result"]
 * //    v
 * const result = graphql<GetById_NameOnly>({
 * 	query: "...",
 * 	variables: { id: "abc" }  // <-- type of GetById_NameOnly["variables"]
 * });
 * ```
 *
 * ## Custom result type only
 *
 * To specify result types only, use a type that is *not* in the `{variables, result}` shape:
 *
 * ```ts
 * type MyResultType = Promise<{
 * 	data: {
 * 		getWidget: { name: string }
 * 	}
 * }>
 *
 * //
 * //    |-- type is MyResultType
 * //    v
 * const result = graphql<MyResultType>({query: "..."});
 * ```
 *
 * @param options
 * @param additionalHeaders
 */
export function graphql<
	FALLBACK_TYPES = unknown,
	TYPED_GQL_STRING extends string = string,
>(
	this: V6Client,
	options: GraphQLOptionsV6<FALLBACK_TYPES, TYPED_GQL_STRING>,
	additionalHeaders?: CustomHeaders
): GraphQLResponseV6<FALLBACK_TYPES, TYPED_GQL_STRING> {
	// inject client-level auth 
	options.authMode = options.authMode || this[__authMode];
	options.authToken = options.authToken || this[__authToken];
	
	/**
	 * The correctness of these typings depends on correct string branding or overrides.
	 * Neither of these can actually be validated at runtime. Hence, we don't perform
	 * any validation or type-guarding here.
	 */
	const result = GraphQLAPI.graphql(
		this[__amplify],
		options,
		additionalHeaders
	);
	return result as any;
}

/**
 * Cancels an inflight request. Only applicable for graphql queries and mutations
 * @param {any} request - request to cancel
 * @returns - A boolean indicating if the request was cancelled
 */
export function cancel(
	this: V6Client,
	promise: Promise<any>,
	message?: string
): boolean {
	return GraphQLAPI.cancel(promise, message);
}

/**
 * Checks to see if an error thrown is from an api request cancellation
 * @param {any} error - Any error
 * @returns - A boolean indicating if the error was from an api request cancellation
 */
export function isCancelError(this: V6Client, error: any): boolean {
	return GraphQLAPI.isCancelError(error);
}

export { GraphQLOptionsV6, GraphQLResponseV6 };
