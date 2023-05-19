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
} from './types/v6-types';

export function graphql<T = any>(
	options: GraphQLOptions,
	additionalHeaders?: { [key: string]: string }
): Observable<GraphQLResult<T>> | Promise<GraphQLResult<T>> {
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
	};

	switch (operationType) {
		case 'query':
			return query(childOptions, additionalHeaders);
		case 'mutation':
			return mutate(childOptions, additionalHeaders);
		case 'subscription':
			return subscribe(childOptions, additionalHeaders);
		default:
			throw new Error(`invalid operation type: ${operationType}`);
	}
}

export declare function query<S = never, T extends string = string>(
	document: T,
	queryParams?: GraphqlQueryParams<T, S>,
	additionalHeaders?: { [key: string]: string }
): Promise<GraphqlQueryResult<T, S>> {
	return GraphQLAPI.graphql<GraphqlQueryResult<T, S>>(
		{
			query: document,
			variables: queryParams || {},
		},
		additionalHeaders
	) as Promise<GraphqlQueryResult<T, S>>;
};

export function mutate<S = never, T extends string = string>(
	document: T,
	queryParams?: GraphqlMutationParams<T, S>,
	additionalHeaders?: { [key: string]: string }
): Promise<GraphqlMutationResult<T, S>> {
	return GraphQLAPI.graphql<GraphqlMutationResult<T, S>>(
		{
			query: document,
			variables: queryParams || {},
		},
		additionalHeaders
	) as Promise<GraphqlMutationResult<T, S>>;
}

export declare function subscribe<S = never, T extends string = string>(
	document: T,
	queryParams?: GraphqlSubscriptionParams<T, S>,
	additionalHeaders?: { [key: string]: string }
): Observable<GraphqlSubscriptionResult<T, S>> {
	return GraphQLAPI.graphql<GraphqlSubscriptionResult<T, S>>(
		{
			query: document,
			variables: queryParams || {},
		},
		additionalHeaders
	) as Observable<GraphqlSubscriptionResult<T, S>>;
};
