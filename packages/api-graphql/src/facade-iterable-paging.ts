import { GraphQLAPI } from './GraphQLAPI';
import { Observable } from 'zen-observable-ts';
import { parse, print, OperationDefinitionNode } from 'graphql';

/**
 * `GraphQLOptions` currently includes `{ query: string | DocumentNode, ... }`, but I'm thinking
 * we swap that for `query: string` or `query: string | T extends Whatever`.
 */
import { GraphQLOptions } from './types';

import {
	GraphQLResult,
	GraphqlQueryParams,
	GraphqlQueryResult,
	GraphqlMutationParams,
	GraphqlMutationResult,
	GraphqlSubscriptionParams,
	GraphqlSubscriptionResult,
} from './types/facade-iterable-paging';

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
	} as any;

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
	return (
		GraphQLAPI.graphql(
			{
				...((queryParams || {}) as any),
				query: document,
			},
			additionalHeaders
		) as any
	).then(raw => {
		const responseKey = raw.data ? Object.keys(raw.data)[0] : undefined;
		if (responseKey) {
			if (Array.isArray(raw.data[responseKey]?.items)) {
				return {
					data: (async function* _() {
						for (const item of raw.data[responseKey]?.items) {
							yield item;
						}
					})(),
					errors: raw.errors,
				};
			} else {
				return {
					data: raw.data[responseKey],
					errors: raw.errors,
				};
			}
		} else {
			return raw;
		}
	}) as Promise<GraphqlQueryResult<TYPED_GQL_STRING, FALLBACK_TYPES>>;
}

export function mutate<
	FALLBACK_TYPES = unknown,
	TYPED_GQL_STRING extends string = string
>(
	document: TYPED_GQL_STRING,
	queryParams?: GraphqlMutationParams<TYPED_GQL_STRING, FALLBACK_TYPES>,
	additionalHeaders?: { [key: string]: string }
): Promise<GraphqlMutationResult<TYPED_GQL_STRING, FALLBACK_TYPES>> {
	return (
		GraphQLAPI.graphql(
			{
				...((queryParams || {}) as any),
				query: document,
			},
			additionalHeaders
		) as any
	).then(raw => {
		const responseKey = raw.data ? Object.keys(raw.data)[0] : undefined;
		if (responseKey) {
			return {
				data: raw.data[responseKey],
				errors: raw.errors,
			};
		} else {
			return raw;
		}
	}) as Promise<GraphqlMutationResult<TYPED_GQL_STRING, FALLBACK_TYPES>>;
}

export function subscribe<
	FALLBACK_TYPES = unknown,
	TYPED_GQL_STRING extends string = string
>(
	document: TYPED_GQL_STRING,
	queryParams?: GraphqlSubscriptionParams<TYPED_GQL_STRING, FALLBACK_TYPES>,
	additionalHeaders?: { [key: string]: string }
): Observable<GraphqlSubscriptionResult<TYPED_GQL_STRING, FALLBACK_TYPES>> {
	return (
		GraphQLAPI.graphql(
			{
				...((queryParams || {}) as any),
				query: document,
			},
			additionalHeaders
		) as Observable<any>
	).map(raw => {
		const messageKey = raw.value.data
			? Object.keys(raw.value.data)[0]
			: undefined;
		return {
			value: {
				data: messageKey ? raw.value.data[messageKey] : undefined,
				provider: raw.provider,
			},
		};
	}) as unknown as Observable<
		GraphqlSubscriptionResult<TYPED_GQL_STRING, FALLBACK_TYPES>
	>;
}
