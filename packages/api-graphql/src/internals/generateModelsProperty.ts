// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { ModelTypes } from '@aws-amplify/amplify-api-next-types-alpha';
import {
	initializeModel,
	generateGraphQLDocument,
	buildGraphQLVariables,
	graphQLOperationsInfo,
	ModelOperation,
	flattenItems,
} from './APIClient';
import { ClientGenerationParams } from './types';
import { V6Client } from '../types';

export function generateModelsProperty<T extends Record<any, any> = never>(
	client: V6Client,
	params: ClientGenerationParams
): ModelTypes<T> {
	const models = {} as any;
	const config = params.amplify.getConfig();

	const modelIntrospection = config.API?.GraphQL?.modelIntrospection;
	if (!modelIntrospection) {
		return {} as any;
	}

	// TODO: refactor this to use separate methods for each CRUDL.
	// Doesn't make sense to gen the methods dynamically given the different args and return values
	for (const model of Object.values(modelIntrospection.models)) {
		const { name } = model as any;

		models[name] = {} as any;

		Object.entries(graphQLOperationsInfo).forEach(
			([key, { operationPrefix }]) => {
				const operation = key as ModelOperation;

				if (operation === 'LIST') {
					models[name][operationPrefix] = async (args?: any) => {
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

						try {
							const { data, nextToken, extensions } = (await client.graphql({
								query,
								variables,
							})) as any;

							// flatten response
							if (data !== undefined) {
								const [key] = Object.keys(data);

								if (data[key].items) {
									const flattenedResult = flattenItems(data)[key];

									// don't init if custom selection set
									if (args?.selectionSet) {
										return {
											data: flattenedResult,
											nextToken,
											extensions,
										};
									} else {
										const initialized = initializeModel(
											client,
											name,
											flattenedResult,
											modelIntrospection
										);

										return {
											data: initialized,
											nextToken,
											extensions,
										};
									}
								}

								return {
									data: data[key],
									nextToken,
									extensions,
								};
							}
						} catch (error) {
							if (error.errors) {
								// graphql errors pass through
								return error as any;
							} else {
								// non-graphql errors re re-thrown
								throw error;
							}
						}
					};
				} else {
					models[name][operationPrefix] = async (arg?: any, options?: any) => {
						const query = generateGraphQLDocument(
							modelIntrospection.models,
							name,
							operation,
							options
						);
						const variables = buildGraphQLVariables(
							model,
							operation,
							arg,
							modelIntrospection
						);

						try {
							const { data, extensions } = (await client.graphql({
								query,
								variables,
							})) as any;

							// flatten response
							if (data !== undefined) {
								const [key] = Object.keys(data);
								const flattenedResult = flattenItems(data)[key];

								if (options?.selectionSet) {
									return flattenedResult;
								} else {
									// TODO: refactor to avoid destructuring here
									const [initialized] = initializeModel(
										client,
										name,
										[flattenedResult],
										modelIntrospection
									);

									return { data: initialized, extensions };
								}
							} else {
								return { data: null, extensions };
							}
						} catch (error) {
							if (error.errors) {
								// graphql errors pass through
								return error as any;
							} else {
								// non-graphql errors re re-thrown
								throw error;
							}
						}
					};
				}
			}
		);
	}

	return models;
}
