// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { GraphQLResult } from '@aws-amplify/api';
import { InternalAPI } from '@aws-amplify/api/internals';
import { Observable } from 'rxjs';
import {
	InternalSchema,
	ModelInstanceMetadata,
	SchemaModel,
	ModelPredicate,
	PredicatesGroup,
	GraphQLFilter,
	AuthModeStrategy,
	ErrorHandler,
	ProcessName,
	AmplifyContext,
} from '../../types';
import {
	buildGraphQLOperation,
	getModelAuthModes,
	getClientSideAuthError,
	getForbiddenError,
	predicateToGraphQLFilter,
	getTokenForCustomAuth,
} from '../utils';
import {
	jitteredExponentialRetry,
	Category,
	CustomUserAgentDetails,
	DataStoreAction,
	NonRetryableError,
	BackgroundProcessManager,
	GraphQLAuthMode,
	AmplifyError,
} from '@aws-amplify/core/internals/utils';

import { Amplify, ConsoleLogger, Hub } from '@aws-amplify/core';

import { ModelPredicateCreator } from '../../predicates';
import { getSyncErrorType } from './errorMaps';
const opResultDefaults = {
	items: [],
	nextToken: null,
	startedAt: null,
};

const logger = new ConsoleLogger('DataStore');

class SyncProcessor {
	private readonly typeQuery = new WeakMap<SchemaModel, [string, string]>();

	private runningProcesses = new BackgroundProcessManager();

	constructor(
		private readonly schema: InternalSchema,
		private readonly syncPredicates: WeakMap<
			SchemaModel,
			ModelPredicate<any> | null
		>,
		private readonly amplifyConfig: Record<string, any> = {},
		private readonly authModeStrategy: AuthModeStrategy,
		private readonly errorHandler: ErrorHandler,
		private readonly amplifyContext: AmplifyContext
	) {
		amplifyContext.InternalAPI = amplifyContext.InternalAPI || InternalAPI;
		this.generateQueries();
	}

	private generateQueries() {
		Object.values(this.schema.namespaces).forEach(namespace => {
			Object.values(namespace.models)
				.filter(({ syncable }) => syncable)
				.forEach(model => {
					const [[, ...opNameQuery]] = buildGraphQLOperation(
						namespace,
						model,
						'LIST'
					);

					this.typeQuery.set(model, opNameQuery);
				});
		});
	}

	private graphqlFilterFromPredicate(model: SchemaModel): GraphQLFilter {
		if (!this.syncPredicates) {
			return null!;
		}
		const predicatesGroup: PredicatesGroup<any> =
			ModelPredicateCreator.getPredicates(
				this.syncPredicates.get(model)!,
				false
			)!;

		if (!predicatesGroup) {
			return null!;
		}

		return predicateToGraphQLFilter(predicatesGroup);
	}

	private async retrievePage<T extends ModelInstanceMetadata>(
		modelDefinition: SchemaModel,
		lastSync: number,
		nextToken: string,
		limit: number = null!,
		filter: GraphQLFilter,
		onTerminate: Promise<void>
	): Promise<{ nextToken: string; startedAt: number; items: T[] }> {
		const [opName, query] = this.typeQuery.get(modelDefinition)!;

		const variables = {
			limit,
			nextToken,
			lastSync,
			filter,
		};

		const modelAuthModes = await getModelAuthModes({
			authModeStrategy: this.authModeStrategy,
			defaultAuthMode: this.amplifyConfig.aws_appsync_authenticationType,
			modelName: modelDefinition.name,
			schema: this.schema,
		});

		// sync only needs the READ auth mode(s)
		const readAuthModes = modelAuthModes.READ;

		let authModeAttempts = 0;
		const authModeRetry = async () => {
			if (!this.runningProcesses.isOpen) {
				throw new Error(
					'sync.retreievePage termination was requested. Exiting.'
				);
			}

			try {
				logger.debug(
					`Attempting sync with authMode: ${readAuthModes[authModeAttempts]}`
				);
				const response = await this.jitteredRetry<T>({
					query,
					variables,
					opName,
					modelDefinition,
					authMode: readAuthModes[authModeAttempts],
					onTerminate,
				});
				logger.debug(
					`Sync successful with authMode: ${readAuthModes[authModeAttempts]}`
				);
				return response;
			} catch (error) {
				authModeAttempts++;
				if (authModeAttempts >= readAuthModes.length) {
					const authMode = readAuthModes[authModeAttempts - 1];
					logger.debug(`Sync failed with authMode: ${authMode}`, error);
					if (getClientSideAuthError(error) || getForbiddenError(error)) {
						// return empty list of data so DataStore will continue to sync other models
						logger.warn(
							`User is unauthorized to query ${opName} with auth mode ${authMode}. No data could be returned.`
						);

						return {
							data: {
								[opName]: opResultDefaults,
							},
						};
					}
					throw error;
				}
				logger.debug(
					`Sync failed with authMode: ${
						readAuthModes[authModeAttempts - 1]
					}. Retrying with authMode: ${readAuthModes[authModeAttempts]}`
				);
				return await authModeRetry();
			}
		};

		const { data } = await authModeRetry();

		const { [opName]: opResult } = data;

		const { items, nextToken: newNextToken, startedAt } = opResult;

		return {
			nextToken: newNextToken,
			startedAt,
			items,
		};
	}

	private async jitteredRetry<T>({
		query,
		variables,
		opName,
		modelDefinition,
		authMode,
		onTerminate,
	}: {
		query: string;
		variables: { limit: number; lastSync: number; nextToken: string };
		opName: string;
		modelDefinition: SchemaModel;
		authMode: GraphQLAuthMode;
		onTerminate: Promise<void>;
	}): Promise<
		GraphQLResult<{
			[opName: string]: {
				items: T[];
				nextToken: string;
				startedAt: number;
			};
		}>
	> {
		return await jitteredExponentialRetry(
			async (query, variables) => {
				try {
					const authToken = await getTokenForCustomAuth(
						authMode,
						this.amplifyConfig
					);

					const customUserAgentDetails: CustomUserAgentDetails = {
						category: Category.DataStore,
						action: DataStoreAction.GraphQl,
					};

					return await this.amplifyContext.InternalAPI.graphql(
						{
							query,
							variables,
							authMode,
							authToken,
						},
						undefined,
						customUserAgentDetails
					);

					// TODO: onTerminate.then(() => API.cancel(...))
				} catch (error) {
					// Catch client-side (GraphQLAuthError) & 401/403 errors here so that we don't continue to retry
					const clientOrForbiddenErrorMessage =
						getClientSideAuthError(error) || getForbiddenError(error);

					if (clientOrForbiddenErrorMessage) {
						logger.error('Sync processor retry error:', error);
						throw new NonRetryableError(clientOrForbiddenErrorMessage);
					}

					const hasItems = Boolean(error?.data?.[opName]?.items);

					const unauthorized =
						error?.errors &&
						(error.errors as [any]).some(
							err => err.errorType === 'Unauthorized'
						);

					const otherErrors =
						error?.errors &&
						(error.errors as [any]).filter(
							err => err.errorType !== 'Unauthorized'
						);

					const result = error;

					if (hasItems) {
						result.data[opName].items = result.data[opName].items.filter(
							item => item !== null
						);
					}

					if (hasItems && otherErrors?.length) {
						await Promise.all(
							otherErrors.map(async err => {
								try {
									await this.errorHandler({
										recoverySuggestion:
											'Ensure app code is up to date, auth directives exist and are correct on each model, and that server-side data has not been invalidated by a schema change. If the problem persists, search for or create an issue: https://github.com/aws-amplify/amplify-js/issues',
										localModel: null!,
										message: err.message,
										model: modelDefinition.name,
										operation: opName,
										errorType: getSyncErrorType(err),
										process: ProcessName.sync,
										remoteModel: null!,
										cause: err,
									});
								} catch (e) {
									logger.error('Sync error handler failed with:', e);
								}
							})
						);
						Hub.dispatch('datastore', {
							event: 'nonApplicableDataReceived',
							data: {
								errors: otherErrors,
								modelName: modelDefinition.name,
							},
						});
					}

					/**
					 * Handle $util.unauthorized() in resolver request mapper, which responses with something
					 * like this:
					 *
					 * ```
					 * {
					 * 	data: { syncYourModel: null },
					 * 	errors: [
					 * 		{
					 * 			path: ['syncLegacyJSONComments'],
					 * 			data: null,
					 * 			errorType: 'Unauthorized',
					 * 			errorInfo: null,
					 * 			locations: [{ line: 2, column: 3, sourceName: null }],
					 * 			message:
					 * 				'Not Authorized to access syncYourModel on type Query',
					 * 			},
					 * 		],
					 * 	}
					 * ```
					 *
					 * The correct handling for this is to signal that we've encountered a non-retryable error,
					 * since the server has responded with an auth error and *NO DATA* at this point.
					 */
					if (unauthorized) {
						this.errorHandler({
							recoverySuggestion:
								'Ensure app code is up to date, auth directives exist and are correct on each model, and that server-side data has not been invalidated by a schema change. If the problem persists, search for or create an issue: https://github.com/aws-amplify/amplify-js/issues',
							localModel: null!,
							message: error.message,
							model: modelDefinition.name,
							operation: opName,
							errorType: getSyncErrorType(error.errors[0]),
							process: ProcessName.sync,
							remoteModel: null!,
							cause: error,
						});
						throw new NonRetryableError(error);
					}

					if (result.data?.[opName]?.items?.length) {
						return result;
					}

					throw error;
				}
			},
			[query, variables],
			undefined,
			onTerminate
		);
	}

	start(
		typesLastSync: Map<SchemaModel, [string, number]>
	): Observable<SyncModelPage> {
		const { maxRecordsToSync, syncPageSize } = this.amplifyConfig;
		const parentPromises = new Map<string, Promise<void>>();
		const observable = new Observable<SyncModelPage>(observer => {
			const sortedTypesLastSyncs = Object.values(this.schema.namespaces).reduce(
				(map, namespace) => {
					for (const modelName of Array.from(
						namespace.modelTopologicalOrdering!.keys()
					)) {
						const typeLastSync = typesLastSync.get(namespace.models[modelName]);
						map.set(namespace.models[modelName], typeLastSync!);
					}
					return map;
				},
				new Map<SchemaModel, [string, number]>()
			);

			const allModelsReady = Array.from(sortedTypesLastSyncs.entries())
				.filter(([{ syncable }]) => syncable)
				.map(
					([modelDefinition, [namespace, lastSync]]) =>
						this.runningProcesses.isOpen &&
						this.runningProcesses.add(async onTerminate => {
							let done = false;
							let nextToken: string = null!;
							let startedAt: number = null!;
							let items: ModelInstanceMetadata[] = null!;

							let recordsReceived = 0;
							const filter = this.graphqlFilterFromPredicate(modelDefinition);

							const parents = this.schema.namespaces[
								namespace
							].modelTopologicalOrdering!.get(modelDefinition.name);
							const promises = parents!.map(parent =>
								parentPromises.get(`${namespace}_${parent}`)
							);

							const promise = new Promise<void>(async res => {
								await Promise.all(promises);

								do {
									/**
									 * If `runningProcesses` is not open, it means that the sync processor has been
									 * stopped (for example by calling `DataStore.clear()` upstream) and has not yet
									 * finished terminating and/or waiting for its background processes to complete.
									 */
									if (!this.runningProcesses.isOpen) {
										logger.debug(
											`Sync processor has been stopped, terminating sync for ${modelDefinition.name}`
										);
										return res();
									}

									const limit = Math.min(
										maxRecordsToSync - recordsReceived,
										syncPageSize
									);

									/**
									 * It's possible that `retrievePage` will fail.
									 * If it does fail, continue merging the rest of the data,
									 * and invoke the error handler for non-applicable data.
									 */
									try {
										({ items, nextToken, startedAt } = await this.retrievePage(
											modelDefinition,
											lastSync,
											nextToken,
											limit,
											filter,
											onTerminate
										));
									} catch (error) {
										try {
											await this.errorHandler({
												recoverySuggestion:
													'Ensure app code is up to date, auth directives exist and are correct on each model, and that server-side data has not been invalidated by a schema change. If the problem persists, search for or create an issue: https://github.com/aws-amplify/amplify-js/issues',
												localModel: null!,
												message: error.message,
												model: modelDefinition.name,
												operation: null!,
												errorType: getSyncErrorType(error),
												process: ProcessName.sync,
												remoteModel: null!,
												cause: error,
											});
										} catch (e) {
											logger.error('Sync error handler failed with:', e);
										}
										/**
										 * If there's an error, this model fails, but the rest of the sync should
										 * continue. To facilitate this, we explicitly mark this model as `done`
										 * with no items and allow the loop to continue organically. This ensures
										 * all callbacks (subscription messages) happen as normal, so anything
										 * waiting on them knows the model is as done as it can be.
										 */
										done = true;
										items = [];
									}

									recordsReceived += items.length;

									done =
										nextToken === null || recordsReceived >= maxRecordsToSync;

									observer.next({
										namespace,
										modelDefinition,
										items,
										done,
										startedAt,
										isFullSync: !lastSync,
									});
								} while (!done);

								res();
							});

							parentPromises.set(
								`${namespace}_${modelDefinition.name}`,
								promise
							);

							await promise;
						}, `adding model ${modelDefinition.name}`)
				);

			Promise.all(allModelsReady as Promise<any>[]).then(() => {
				observer.complete();
			});
		});

		return observable;
	}

	async stop() {
		logger.debug('stopping sync processor');
		await this.runningProcesses.close();
		await this.runningProcesses.open();
		logger.debug('sync processor stopped');
	}
}

export type SyncModelPage = {
	namespace: string;
	modelDefinition: SchemaModel;
	items: ModelInstanceMetadata[];
	startedAt: number;
	done: boolean;
	isFullSync: boolean;
};

export { SyncProcessor };
