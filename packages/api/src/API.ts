// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	AWSAppSyncRealTimeProvider,
	GraphQLOptions,
	GraphQLResult,
	GraphQLQuery,
	GraphQLSubscription,
} from '@aws-amplify/api-graphql';
import { graphql as v6graphql } from '@aws-amplify/api-graphql/internals';
import Observable from 'zen-observable-ts';
import { InternalAPIClass } from './internals/InternalAPI';

/**
 * @deprecated
 * Use RestApi or GraphQLAPI to reduce your application bundle size
 * Export Cloud Logic APIs
 */
export class APIClass extends InternalAPIClass {
	public getModuleName() {
		return 'API';
	}

	/**
	 * Executes a GraphQL operation
	 *
	 * @param options - GraphQL Options
	 * @param [additionalHeaders] - headers to merge in after any `graphql_headers` set in the config
	 * @returns An Observable if queryType is 'subscription', else a promise of the graphql result from the query.
	 */
	graphql<T>(
		options: GraphQLOptions,
		additionalHeaders?: { [key: string]: string }
	): T extends GraphQLQuery<T>
		? Promise<GraphQLResult<T>>
		: T extends GraphQLSubscription<T>
		? Observable<{
				provider: AWSAppSyncRealTimeProvider;
				value: GraphQLResult<T>;
		  }>
		: Promise<GraphQLResult<any>> | Observable<object>;
	graphql<T = any>(
		options: GraphQLOptions,
		additionalHeaders?: { [key: string]: string }
	): Promise<GraphQLResult<any>> | Observable<object> {
		return super.graphql(options, additionalHeaders);
	}

	/**
	 * Generates an API client that can work with models or raw GraphQL
	 */
	generateClient<T extends Record<any, any> = never>(): V6Client<T> {
		const client: V6Client<any> = {
			graphql: v6graphql,
		};

		return client as V6Client<T>;
	}
}

type FilteredKeys<T> = {
	[P in keyof T]: T[P] extends never ? never : P;
}[keyof T];
type ExcludeNeverFields<O> = {
	[K in FilteredKeys<O>]: O[K];
};

// If no T is passed, ExcludeNeverFields removes "models" from the client
declare type V6Client<T extends Record<any, any> = never> = ExcludeNeverFields<{
	graphql: typeof v6graphql;
}>;

export const API = new APIClass(null);
