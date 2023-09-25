// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AWSAppSyncRealTimeProvider } from '@aws-amplify/pubsub';
import {
	GraphQLOptions,
	GraphQLResult,
	GraphQLQuery,
	GraphQLSubscription,
} from '@aws-amplify/api-graphql';
import { graphql as v6graphql } from '@aws-amplify/api-graphql/internals';
import { Amplify, ConsoleLogger as Logger } from '@aws-amplify/core';
import Observable from 'zen-observable-ts';
import { InternalAPIClass } from './internals/InternalAPI';
import {
	initializeModel,
	generateGraphQLDocument,
	buildGraphQLVariables,
	graphQLOperationsInfo,
	ModelOperation,
} from './APIClient';
import type { ModelTypes } from '@aws-amplify/types-package-alpha';

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

	/**
	 * Generates an API client that can work with models or raw GraphQL
	 */
	generateClient<T extends Record<any, any> = never>(): V6Client<T> {
		const config = super.configure({});

		const { modelIntrospection } = config;

		const client: V6Client<any> = {
			graphql: v6graphql,
			models: {},
		};

		// TODO: refactor this to use separate methods for each CRUDL.
		// Doesn't make sense to gen the methods dynamically given the different args and return values
		for (const model of Object.values(modelIntrospection.models)) {
			const { name } = model as any;

			client.models[name] = {} as any;

			Object.entries(graphQLOperationsInfo).forEach(
				([key, { operationPrefix }]) => {
					const operation = key as ModelOperation;

					if (operation === 'LIST') {
						client.models[name][operationPrefix] = async (args?: any) => {
							const query = generateGraphQLDocument(
								modelIntrospection.models,
								name,
								'LIST',
								args
							);
							const variables = buildGraphQLVariables(
								model,
								'LIST',
								args,
								modelIntrospection
							);

							console.log('API list', query, variables);

							const res = (await this.graphql({
								query,
								variables,
							})) as any;

							// flatten response
							if (res.data !== undefined) {
								const [key] = Object.keys(res.data);

								if (res.data[key].items) {
									const flattenedResult = res.data[key].items;

									// don't init if custom selection set
									if (args?.selectionSet) {
										return flattenedResult;
									} else {
										const initialized = initializeModel(
											client,
											name,
											flattenedResult,
											modelIntrospection
										);

										console.log('initialized', initialized);

										return initialized;
									}
								}

								return res.data[key];
							}

							return res as any;
						};
					} else {
						client.models[name][operationPrefix] = async (
							arg?: any,
							options?: any
						) => {
							const query = generateGraphQLDocument(
								modelIntrospection.models,
								name,
								operation
							);
							const variables = buildGraphQLVariables(
								model,
								operation,
								arg,
								modelIntrospection
							);

							console.log(`API ${operationPrefix}`, query, variables);

							const res = (await this.graphql({
								query,
								variables,
							})) as any;

							// flatten response
							if (res.data !== undefined) {
								const [key] = Object.keys(res.data);

								// TODO: refactor to avoid destructuring here
								const [initialized] = initializeModel(
									client,
									name,
									[res.data[key]],
									modelIntrospection
								);

								return initialized;
							}

							return res;
						};
					}
				}
			);
		}

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
	models: ModelTypes<T>;
}>;

export const API = new APIClass(null);
Amplify.register(API);
