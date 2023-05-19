import { Observable } from 'zen-observable-ts';
import { GraphQLOptions, GraphQLResult } from './index';

// #region shared API types ... probably to be pulled from core or something later.

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

// export type GraphqlQueryParams<T extends string, S extends {}> = {
//   input?: T extends GeneratedQuery<infer IN, infer OUT> ? IN : S;
// } & AuthMode;

export type GraphqlQueryOverrides<IN, OUT> = {
	variables: IN;
	result: OUT;
};

export type GraphqlQueryParams<T extends string, S> = (T extends GeneratedQuery<
	infer IN,
	infer OUT
>
	? IN
	: S extends GraphqlQueryOverrides<infer IN, infer OUT>
	? IN
	: any) &
	AuthMode;

export type GraphqlQueryResult<T extends string, S> = T extends GeneratedQuery<
	infer IN,
	infer OUT
>
	? GraphQLResult<OUT>
	: S extends GraphqlQueryOverrides<infer IN, infer OUT>
	? GraphQLResult<OUT>
	: any;

export declare function query<S = never, T extends string = string>(
	document: T,
	queryParams: GraphqlQueryParams<T, S>
): Promise<GraphqlQueryResult<T, S>>;

/** GraphQL mutate */

export type GeneratedMutation<InputType, OutputType> = string & {
	__generatedMutationInput: InputType;
	__generatedMutationOutput: OutputType;
};

export type GraphqlMutationParams<
	T extends string,
	S
> = (T extends GeneratedMutation<infer IN, infer OUT>
	? IN
	: S extends GraphqlQueryOverrides<infer IN, infer OUT>
	? IN
	: any) &
	AuthMode;

export type GraphqlMutationResult<
	T extends string,
	S
> = T extends GeneratedMutation<infer IN, infer OUT>
	? GraphQLResult<OUT>
	: S extends GraphqlQueryOverrides<infer IN, infer OUT>
	? GraphQLResult<OUT>
	: any;

export declare function mutate<S = never, T extends string = string>(
	document: T,
	queryParams: GraphqlMutationParams<T, S>
): Promise<GraphqlMutationResult<T, S>>;

/** GraphQL subscribe */

export type GeneratedSubscription<InputType, OutputType> = string & {
	__generatedSubscriptionInput: InputType;
	__generatedSubscriptionOutput: OutputType;
};

export type GraphqlSubscriptionParams<
	T extends string,
	S
> = (T extends GeneratedSubscription<infer IN, infer OUT>
	? IN
	: S extends GraphqlQueryOverrides<infer IN, infer OUT>
	? IN
	: any) &
	AuthMode;

export type GraphqlSubscriptionResult<
	T extends string,
	S
> = T extends GeneratedSubscription<infer IN, infer OUT>
	? OUT
	: S extends GraphqlQueryOverrides<infer IN, infer OUT>
	? OUT
	: any;

export declare function subscribe<S = never, T extends string = string>(
	document: T,
	queryParams?: GraphqlSubscriptionParams<T, S>
): Observable<GraphqlSubscriptionResult<T, S>>;
