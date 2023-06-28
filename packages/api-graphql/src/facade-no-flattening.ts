import { GraphQLAPI } from './GraphQLAPI';
import { Observable } from 'zen-observable-ts';
import { parse, print, OperationDefinitionNode } from 'graphql';

/**
 * `GraphQLOptions` currently includes `{ query: string | DocumentNode, ... }`, but I'm thinking
 * we swap that for `query: string` or `query: string | T extends Whatever`.
 */
import { GraphQLOptions, GraphQLResult } from './types';

import {
	GraphqlQueryParams,
	GraphqlQueryResult,
	GraphqlMutationParams,
	GraphqlMutationResult,
	GraphqlSubscriptionParams,
	GraphqlSubscriptionResult,
} from './types/facade-no-flattening';

export function graphql<T = any>(
	options: GraphQLOptions,
	additionalHeaders?: { [key: string]: string }
): Observable<GraphqlSubscriptionResult<'', T>> | Promise<GraphQLResult<T>> {
	const parsedQuery =
		typeof options.query === 'string'
			? parse(options.query)
			: parse(print(options.query));

	const [operationDef = {}] = parsedQuery.definitions.filter(
		def => def.kind === 'OperationDefinition'
	);
	const { operation: operationType } = operationDef as OperationDefinitionNode;

	const childOptions = {
		...options,
		query: print(parsedQuery),
	} as any; // todo

	switch (operationType) {
		case 'query':
			return query(childOptions.query, childOptions, additionalHeaders);
		case 'mutation':
			return mutate(childOptions.query, childOptions, additionalHeaders);
		case 'subscription':
			return subscribe(childOptions.query, childOptions, additionalHeaders);
		default:
			throw new Error(`invalid operation type: ${operationType}`);
	}
}

export function query<
	FALLBACK_TYPES = unknown,
	TYPED_GQL_STRING extends string = string
>(
	document: TYPED_GQL_STRING,
	queryParams?: GraphqlQueryParams<TYPED_GQL_STRING, FALLBACK_TYPES>,
	additionalHeaders?: { [key: string]: string }
): Promise<GraphqlQueryResult<TYPED_GQL_STRING, FALLBACK_TYPES>> {
	return GraphQLAPI.graphql(
		{
			...((queryParams || {}) as any), // todo
			query: document,
		},
		additionalHeaders
	) as Promise<GraphqlQueryResult<TYPED_GQL_STRING, FALLBACK_TYPES>>;
}

export function mutate<
	FALLBACK_TYPES = unknown,
	TYPED_GQL_STRING extends string = string
>(
	document: TYPED_GQL_STRING,
	queryParams?: GraphqlMutationParams<TYPED_GQL_STRING, FALLBACK_TYPES>,
	additionalHeaders?: { [key: string]: string }
): Promise<GraphqlMutationResult<TYPED_GQL_STRING, FALLBACK_TYPES>> {
	return GraphQLAPI.graphql(
		{
			...((queryParams || {}) as any), // todo
			query: document,
		},
		additionalHeaders
	) as Promise<GraphqlMutationResult<TYPED_GQL_STRING, FALLBACK_TYPES>>;
}

export function subscribe<
	FALLBACK_TYPES = unknown,
	TYPED_GQL_STRING extends string = string
>(
	document: TYPED_GQL_STRING,
	queryParams?: GraphqlSubscriptionParams<TYPED_GQL_STRING, FALLBACK_TYPES>,
	additionalHeaders?: { [key: string]: string }
): Observable<GraphqlSubscriptionResult<TYPED_GQL_STRING, FALLBACK_TYPES>> {
	return GraphQLAPI.graphql(
		{
			...((queryParams || {}) as any), // todo
			query: document,
		},
		additionalHeaders
	) as Observable<GraphqlSubscriptionResult<TYPED_GQL_STRING, FALLBACK_TYPES>>;
}
