// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AWSAppSyncRealTimeProvider } from '@aws-amplify/pubsub';
import { GraphQLOptions, GraphQLResult } from '@aws-amplify/api-graphql';
import { Amplify, ConsoleLogger as Logger } from '@aws-amplify/core';
import Observable from 'zen-observable-ts';
import { GraphQLQuery, GraphQLSubscription } from './types';
import { InternalAPIClass } from './internals/InternalAPI';

const logger = new Logger('API');
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
}

export const API = new APIClass(null);
Amplify.register(API);
