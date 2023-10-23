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
import { V6Client, GraphqlSubscriptionResult } from '../types';
import { Observable, map } from 'rxjs';

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
							const { data, extensions } = (await client.graphql({
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
											nextToken: data[key].nextToken,
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
											nextToken: data[key].nextToken,
											extensions,
										};
									}
								}

								return {
									data: data[key],
									nextToken: data[key].nextToken,
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
				} else if (['ONCREATE', 'ONUPDATE', 'ONDELETE'].includes(operation)) {
					models[name][operationPrefix] = (arg?: any, options?: any) => {
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

						const observable = client.graphql({
							query,
							variables,
						}) as GraphqlSubscriptionResult<object>;

						return observable.pipe(
							map(value => {
								const [key] = Object.keys(value.data);
								return value.data[key];
							})
						);
					};
				} else if (operation === 'OBSERVE_QUERY') {
					models[name][operationPrefix] = (arg?: any, options?: any) =>
						new Observable(subscriber => {
							// what we'll be sending to our subscribers
							const items: object[] = [];

							// To enqueue subscription messages while we collect our initial
							// result set.
							const messageQueue = [] as {
								type: 'create' | 'update' | 'delete';
								item: object;
							}[];

							// start subscriptions
							const onCreateSub = models[name]
								.onCreate(arg, options)
								.subscribe({
									next(item) {
										messageQueue.push({ item, type: 'create' });
									},
									error(error) {
										subscriber.error({ type: 'onCreate', error });
									},
								});
							const onUpdateSub = models[name]
								.onUpdate(arg, options)
								.subscribe({
									next(item) {
										messageQueue.push({ item, type: 'update' });
									},
									error(error) {
										subscriber.error({ type: 'onUpdate', error });
									},
								});
							const onDeleteSub = models[name]
								.onDelete(arg, options)
								.subscribe({
									next(item) {
										messageQueue.push({ item, type: 'delete' });
									},
									error(error) {
										subscriber.error({ type: 'onDelete', error });
									},
								});

							// util function (to be moved to utils)
							function findIndexByKeyFields<T>(
								needle: T,
								haystack: T[],
								keyFields: Array<keyof T>
							): number {
								const searchObject = Object.fromEntries(
									keyFields.map(fieldName => [fieldName, needle[fieldName]])
								);

								for (let i = 0; i < haystack.length; i++) {
									if (
										Object.keys(searchObject).every(
											k => searchObject[k] === haystack[i][k]
										)
									) {
										return i;
									}
								}

								// if not found, return -1 as is traditional.
								return -1;
							}

							// util function (to be moved to utils)
							function getPkFields(model: any) {
								const { primaryKeyFieldName, sortKeyFieldNames } =
									model.primaryKeyInfo as {
										primaryKeyFieldName: string;
										sortKeyFieldNames: string[];
									};
								return [primaryKeyFieldName, ...sortKeyFieldNames];
							}

							// obervable collection collection
							function ingestMessages(messages: typeof messageQueue) {
								for (const message of messages) {
									const idx = findIndexByKeyFields(
										message.item,
										items,
										pkFields as any
									);
									switch (message.type) {
										case 'create':
											if (idx < 0) items.push(message.item);
											break;
										case 'update':
											if (idx >= 0) items[idx] = message.item;
											break;
										case 'delete':
											if (idx >= 0) items.splice(idx, 1);
											break;
										default:
											console.error(
												'Unrecognized message in observeQuery.',
												message
											);
									}
								}
								subscriber.next({
									items,
									isSynced: true,
								});
							}

							const pkFields = getPkFields(model);

							// initial results
							(async () => {
								let firstPage = true;
								let nextToken: string | null = null;
								while (!subscriber.closed && (firstPage || nextToken)) {
									firstPage = false;

									const {
										data: page,
										errors,
										nextToken: _nextToken,
									} = await models[name].list({ ...arg, nextToken }, options);
									nextToken = _nextToken;

									items.push(...page);

									// if there are no more pages and no items we already know about
									// that need to be merged in from sub, we're "synced"
									const isSynced =
										messageQueue.length === 0 &&
										(nextToken === null || nextToken === undefined);

									subscriber.next({
										items,
										isSynced,
									});

									if (Array.isArray(errors)) {
										for (const error of errors) {
											subscriber.error(error);
										}
									}
								}

								// play through the queue
								if (messageQueue.length > 0) {
									ingestMessages(messageQueue);
								}

								// switch the queue to write directly to the items collection
								messageQueue.push = (...messages: typeof messageQueue) => {
									ingestMessages(messages);
									return items.length;
								};
							})();

							// when subscriber unsubscribes, tear down internal subs
							return () => {
								// 1. tear down internal subs
								onCreateSub.unsubscribe();
								onUpdateSub.unsubscribe();
								onDeleteSub.unsubscribe();

								// 2. there is no need to explicitly stop paging. instead, we
								// just check `subscriber.closed` above before fetching each page.
							};
						});
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
									return { data: flattenedResult, extensions };
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
