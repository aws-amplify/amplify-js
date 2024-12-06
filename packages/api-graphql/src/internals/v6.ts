// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { CustomHeaders } from '@aws-amplify/data-schema/runtime';

import { GraphQLAPI } from '../GraphQLAPI';
import {
	GraphQLOptionsV6,
	GraphQLResponseV6,
	V6Client,
	getInternals,
} from '../types';

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
	additionalHeaders?: CustomHeaders,
): GraphQLResponseV6<FALLBACK_TYPES, TYPED_GQL_STRING> {
	// inject client-level auth
	const internals = getInternals(this as any);

	/**
	 * The custom `endpoint` (or `undefined`) specific to `generateClient()`.
	 */
	const clientEndpoint: string = (internals as any).endpoint;

	/**
	 * The `authMode` requested by the individual GraphQL request.
	 *
	 * If an `endpoint` is present in the request, we create a "gate" at the request
	 * level to prevent "more general" `authMode` settings (from the client or config)
	 * from being exposed unintentionally to an unrelated API.
	 */
	const requestAuthMode =
		options.authMode ?? (options.endpoint ? 'none' : undefined);

	/**
	 * The `authMode` requested by the generated client.
	 *
	 * If an `endpoint` is present on the client, we create a "gate" around at the
	 * client level to prevent "more general" `authMode` settings (from the config)
	 * from being exposed unintentionally to an unrelated API.
	 */
	const clientAuthMode =
		internals.authMode ?? (clientEndpoint ? 'none' : undefined);

	/**
	 * The most specific `authMode` wins. Setting an `endpoint` value without also
	 * setting an `authMode` value is treated as explicitly setting `authMode` to "none".
	 *
	 * E.g., if `.graphql({ endpoint })`, `authMode` is treated as explicitly 'none' at
	 * the request level, and any `authMode` provided to `generateClient()` or to
	 * `Amplify.configure()` is ignored.
	 *
	 * Reiterating, this serves as a gating mechanism to ensure auth details are not
	 * unexpected sent to API's they don't belong to. However, if `authMode` has been
	 * explicitly set alongside `endpoint`, we will assume this was intentional and
	 * use the normal/configured auth details for the endpoint.
	 */
	options.authMode = requestAuthMode || clientAuthMode;

	options.authToken = options.authToken || internals.authToken;
	const headers = additionalHeaders || internals.headers;

	/**
	 * The correctness of these typings depends on correct string branding or overrides.
	 * Neither of these can actually be validated at runtime. Hence, we don't perform
	 * any validation or type-guarding here.
	 */
	const result = GraphQLAPI.graphql(
		// TODO: move V6Client back into this package?
		internals.amplify as any,
		{
			...options,
			endpoint: options.endpoint || clientEndpoint,
		},
		headers,
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
	message?: string,
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
