import { GraphQLAPI } from '../GraphQLAPI';
import { GraphQLOptionsV6, GraphQLResponseV6 } from '../types';

/**
 * TODO: Usage notes and examples.
 *
 *
 * The types on this function depends on either:
 *
 * 1. The generated `options.query` being correctly branded.
 *
 *  ***OR***
 *
 * 2. The caller providing the correct `FALLBACK_TYPES`.
 *
 * If you use the Amplify-generated graphql from a recent version of the CLI/codegen,
 * your query will be correctly branced, and the types will be correct.
 *
 * @param options
 * @param additionalHeaders
 */
export function graphql<
	FALLBACK_TYPES = unknown,
	TYPED_GQL_STRING extends string = string
>(
	options: GraphQLOptionsV6<TYPED_GQL_STRING>,
	additionalHeaders?: { [key: string]: string }
): GraphQLResponseV6<FALLBACK_TYPES, TYPED_GQL_STRING> {
	/**
	 * Some consideration was given to using a type guard on `result` before returning it.
	 * And, with some graphql parsing, a type guard could validate that `result` matches the
	 * shape dictated by `options`. But, `options.query` is only "branded" as `TYPED_GRAPHQL_STRING`.
	 * Validating that `options` and `result` match *each other* does not prove anything we don't
	 * already know &mdash; or that `result` is an instance of
	 * `GraphQLResponseV6<FALLBACK_TYPES, TYPED_GQL_STRING>`.
	 *
	 * Per the note at the top, the correctness of these typings depends on the correct
	 * branding or type overrides, neither of which can actually be validated at runtime.
	 */
	const result = GraphQLAPI.graphql(options, additionalHeaders);
	return result as any;
}

export { GraphQLOptionsV6, GraphQLResponseV6 };
