// import { Observable } from 'zen-observable-ts';
// import { GraphQLOptions } from './index';
import { GraphQLError } from 'graphql';

// #region shared API types ... probably to be pulled from core or something later.

// original
// export interface GraphQLResult<T = object> {
// 	data?: T;
// 	errors?: GraphQLError[];
// 	extensions?: {
// 		[key: string]: any;
// 	};
// }

/**
 *
 * ```
 * type T = UnionOfKeysOf<{x: string, y: string}>;
 *      ^
 *      "x" | "y"
 * ```
 */
type UnionOfKeysOf<T> = {
	[K in keyof T]: T extends Record<K, any> ? K : never;
}[keyof T];

/**
 * Digs down a layer into an object to extract a union of all the property
 * types.
 *
 * ```
 * type T = Dig<{ x: { a: string, b: number }, y: { c: boolean } }>;
 *      ^
 *      {
 *        a: string;
 *        b: number;
 *      } | {
 *        c: boolean;
 *      }
 * ```
 *
 * This is particularly useful for extracting the type when a single property
 * exists on an object and we just want to "skip" it or "dig it out".
 *
 * ```
 * type T = Dig<{x: { a: string, b: number }}>;
 *      ^
 *      {
 *        a: string;
 *        b: number;
 *      }
 * ```
 *
 */
type Dig<T> = T[keyof T];

export type GraphQLResult<T = object> = {
	data: Dig<T>;
	errors?: GraphQLError[];
	extensions?: {
		[key: string]: any;
	};
};

type UnionKeys<T> = T extends T ? keyof T : never;
type StrictUnionHelper<T, TAll> = T extends any
	? T & Partial<Record<Exclude<UnionKeys<TAll>, keyof T>, undefined>>
	: never;
export type StrictUnion<T> = StrictUnionHelper<T, T>;
export type SimpleAuthMode = {
	authMode?: 'AMAZON_COGNITO_USERPOOLS' | 'API_KEY' | 'AWS_IAM';
};

export type LambdaAuthMode = {
	authMode: 'AWS_LAMBDA';
	authToken: string;
};

export type AuthMode = StrictUnion<SimpleAuthMode | LambdaAuthMode>;

// #endregion

export type GeneratedQuery<InputType, OutputType> = string & {
	__generatedQueryInput: InputType;
	__generatedQueryOutput: OutputType;
};

export type GraphqlQueryOverrides<IN extends {}, OUT extends {}> = {
	variables: IN;
	result: OUT;
};

export type GraphqlQueryParams<
	TYPED_GQL_STRING extends string,
	FALLBACK_TYPES
> = AuthMode & {
	variables: TYPED_GQL_STRING extends GeneratedQuery<infer IN, infer OUT>
		? IN
		: FALLBACK_TYPES extends GraphqlQueryOverrides<infer IN, infer OUT>
		? IN
		: any;
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

export type GraphqlMutationParams<
	TYPED_GQL_STRING extends string,
	OVERRIDE_TYPE
> = AuthMode & {
	variables: TYPED_GQL_STRING extends GeneratedMutation<infer IN, infer OUT>
		? IN
		: OVERRIDE_TYPE extends GraphqlQueryOverrides<infer OVERRIDE_IN, infer OUT>
		? OVERRIDE_IN
		: any;
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

export type GraphqlSubscriptionParams<
	TYPED_GQL_STRING extends string,
	FALLBACK_TYPES
> = AuthMode & {
	variables: TYPED_GQL_STRING extends GeneratedSubscription<infer IN, infer OUT>
		? IN
		: FALLBACK_TYPES extends GraphqlQueryOverrides<infer IN, infer OUT>
		? IN
		: any;
};

export type GraphqlSubscriptionResult<
	TYPED_GQL_STRING extends string,
	FALLBACK_TYPES
> = {
	value: {
		data: TYPED_GQL_STRING extends GeneratedSubscription<infer IN, infer OUT>
			? Dig<OUT>
			: FALLBACK_TYPES extends GraphqlQueryOverrides<infer IN, infer OUT>
			? Dig<OUT>
			: any;
	};
	provider: any;
};
