// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Source, DocumentNode, GraphQLError, OperationTypeNode } from 'graphql';
export { OperationTypeNode } from 'graphql';
import { GRAPHQL_AUTH_MODE } from '@aws-amplify/auth';
export { GRAPHQL_AUTH_MODE };
import { Observable } from 'zen-observable-ts';
// import { CustomUserAgentDetails } from '@aws-amplify/core';

export interface GraphQLOptions {
	query: string | DocumentNode;
	variables?: object;
	authMode?: keyof typeof GRAPHQL_AUTH_MODE;
	authToken?: string;
	/**
	 * @deprecated This property should not be used
	 */
	userAgentSuffix?: string; // TODO: remove in v6
}

export interface GraphQLResult<T = object> {
	data?: T;
	errors?: GraphQLError[];
	extensions?: {
		[key: string]: any;
	};
}

export enum GraphQLAuthError {
	NO_API_KEY = 'No api-key configured',
	NO_CURRENT_USER = 'No current user',
	NO_CREDENTIALS = 'No credentials',
	NO_FEDERATED_JWT = 'No federated jwt',
	NO_AUTH_TOKEN = 'No auth token specified',
}

/**
 * GraphQLSource or string, the type of the parameter for calling graphql.parse
 * @see: https://graphql.org/graphql-js/language/#parse
 */
export type GraphQLOperation = Source | string;

export interface GraphQLOptionsV6<
	FALLBACK_TYPES = unknown,
	TYPED_GQL_STRING extends string = string
> {
	query: TYPED_GQL_STRING | DocumentNode;
	variables?: GraphQLVariablesV6<FALLBACK_TYPES, TYPED_GQL_STRING>;
	authMode?: keyof typeof GRAPHQL_AUTH_MODE;
	authToken?: string;
	/**
	 * @deprecated This property should not be used
	 */
	userAgentSuffix?: string; // TODO: remove in v6
}

export type UnknownGraphQLResponse = Promise<{
	data?: any;
	errors?: any;
	extensions?: any;
}> &
	Partial<
		Observable<{
			provider: any;
			value: any;
		}>
	>;

/**
 * Returns a proper `variables` type with respect to the given `FALLBACK_TYPES` or
 * `TYPED_GQL_STRING`. If the `TYPED_GQL_STRING` isn't a generated/tagged string,
 * and `FALLBACK_TYPES` specifies `variables` and `result` types, it is used instead.
 * Otherwise, broad catch-all types are used instead.
 */
export type GraphQLVariablesV6<
	FALLBACK_TYPES = unknown,
	TYPED_GQL_STRING extends string = string
> = TYPED_GQL_STRING extends GeneratedQuery<infer IN, infer OUT>
	? IN
	: TYPED_GQL_STRING extends GeneratedMutation<infer IN, infer OUT>
	? IN
	: TYPED_GQL_STRING extends GeneratedSubscription<infer IN, infer OUT>
	? IN
	: FALLBACK_TYPES extends GraphqlQueryOverrides<infer IN, infer OUT>
	? IN
	: any;

/**
 * Returns a proper response type with respect to the given `FALLBACK_TYPES` or
 * `TYPED_GQL_STRING`. If the `TYPED_GQL_STRING` isn't a generated/tagged string,
 * and `FALLBACK_TYPES` specifies `variables` and `result` types, it is used instead.
 * Otherwise, broad catch-all types are used instead.
 */
export type GraphQLResponseV6<
	FALLBACK_TYPES = unknown,
	TYPED_GQL_STRING extends string = string
> = TYPED_GQL_STRING extends GeneratedQuery<any, any>
	? Promise<GraphqlQueryResult<TYPED_GQL_STRING, FALLBACK_TYPES>>
	: TYPED_GQL_STRING extends GeneratedMutation<any, any>
	? Promise<GraphqlMutationResult<TYPED_GQL_STRING, FALLBACK_TYPES>>
	: TYPED_GQL_STRING extends GeneratedSubscription<any, any>
	? Observable<GraphqlSubscriptionResult<TYPED_GQL_STRING, FALLBACK_TYPES>>
	: UnknownGraphQLResponse;

export type GeneratedQuery<InputType, OutputType> = string & {
	__generatedQueryInput: InputType;
	__generatedQueryOutput: OutputType;
};

export type GraphqlQueryOverrides<IN extends {}, OUT extends {}> = {
	variables: IN;
	result: OUT;
};

export type GraphqlQueryResult<T extends string, S> = T extends GeneratedQuery<
	infer IN,
	infer OUT
>
	? GraphQLResult<OUT>
	: S extends GraphqlQueryOverrides<infer IN, infer OUT>
	? GraphQLResult<OUT>
	: any;

/** GraphQL mutate */

export type GeneratedMutation<InputType, OutputType> = string & {
	__generatedMutationInput: InputType;
	__generatedMutationOutput: OutputType;
};

export type GraphqlMutationResult<
	TYPED_GQL_STRING extends string,
	FALLBACK_TYPES
> = TYPED_GQL_STRING extends GeneratedMutation<infer IN, infer OUT>
	? GraphQLResult<OUT>
	: FALLBACK_TYPES extends GraphqlQueryOverrides<infer IN, infer OUT>
	? GraphQLResult<OUT>
	: any;

/** GraphQL subscribe */

export type GeneratedSubscription<InputType, OutputType> = string & {
	__generatedSubscriptionInput: InputType;
	__generatedSubscriptionOutput: OutputType;
};

export type GraphqlSubscriptionResult<
	TYPED_GQL_STRING extends string,
	FALLBACK_TYPES
> = {
	provider: any;
	value: {
		data: TYPED_GQL_STRING extends GeneratedSubscription<infer IN, infer OUT>
			? OUT
			: FALLBACK_TYPES extends GraphqlQueryOverrides<infer IN, infer OUT>
			? OUT
			: any;
	};
};
