// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
export {
	graphqlOperation,
	GraphQLAuthError,
	GraphQLResult,
	GRAPHQL_AUTH_MODE,
} from '@aws-amplify/api-graphql';

// Opaque type used for determining the graphql query type
declare const queryType: unique symbol;

export type GraphQLQuery<T> = T & { readonly [queryType]: 'query' };
export type GraphQLSubscription<T> = T & {
	readonly [queryType]: 'subscription';
};
