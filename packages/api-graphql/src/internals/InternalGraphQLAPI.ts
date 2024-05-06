// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	DocumentNode,
	OperationDefinitionNode,
	OperationTypeNode,
	parse,
	print,
} from 'graphql';
import { Observable, catchError } from 'rxjs';
import { AmplifyClassV6 } from '@aws-amplify/core';
import {
	AmplifyUrl,
	CustomUserAgentDetails,
	GraphQLAuthMode,
	getAmplifyUserAgent,
} from '@aws-amplify/core/internals/utils';
import { isCancelError as isCancelErrorREST } from '@aws-amplify/api-rest';
import {
	cancel as cancelREST,
	post,
	updateRequestToBeCancellable,
} from '@aws-amplify/api-rest/internals';
import {
	CustomHeaders,
	RequestOptions,
} from '@aws-amplify/data-schema/runtime';

import { AWSAppSyncRealTimeProvider } from '../Providers/AWSAppSyncRealTimeProvider';
import { GraphQLOperation, GraphQLOptions, GraphQLResult } from '../types';
import { resolveConfig, resolveLibraryOptions } from '../utils';
import { repackageUnauthorizedError } from '../utils/errors/repackageAuthError';
import {
	NO_API_KEY,
	NO_AUTH_TOKEN_HEADER,
	NO_ENDPOINT,
	NO_SIGNED_IN_USER,
	NO_VALID_AUTH_TOKEN,
	NO_VALID_CREDENTIALS,
} from '../utils/errors/constants';
import { GraphQLApiError, createGraphQLResultWithError } from '../utils/errors';

import { isGraphQLResponseWithErrors } from './utils/runtimeTypeGuards/isGraphQLResponseWithErrors';

const USER_AGENT_HEADER = 'x-amz-user-agent';

const isAmplifyInstance = (
	amplify:
		| AmplifyClassV6
		| ((fn: (amplify: any) => Promise<any>) => Promise<AmplifyClassV6>),
): amplify is AmplifyClassV6 => {
	return typeof amplify !== 'function';
};

/**
 * Export Cloud Logic APIs
 */
export class InternalGraphQLAPIClass {
	/**
	 * @private
	 */
	private appSyncRealTime = new AWSAppSyncRealTimeProvider();

	private _api = {
		post,
		cancelREST,
		isCancelErrorREST,
		updateRequestToBeCancellable,
	};

	public getModuleName() {
		return 'InternalGraphQLAPI';
	}

	private async _headerBasedAuth(
		amplify: AmplifyClassV6,
		authMode: GraphQLAuthMode,
		additionalHeaders: Record<string, string> = {},
	) {
		const { apiKey } = resolveConfig(amplify);

		let headers = {};

		switch (authMode) {
			case 'apiKey':
				if (!apiKey) {
					throw new GraphQLApiError(NO_API_KEY);
				}
				headers = {
					'X-Api-Key': apiKey,
				};
				break;
			case 'iam': {
				const session = await amplify.Auth.fetchAuthSession();
				if (session.credentials === undefined) {
					throw new GraphQLApiError(NO_VALID_CREDENTIALS);
				}
				break;
			}
			case 'oidc':
			case 'userPool': {
				let token: string | undefined;

				try {
					token = (
						await amplify.Auth.fetchAuthSession()
					).tokens?.accessToken.toString();
				} catch (e) {
					// fetchAuthSession failed
					throw new GraphQLApiError({
						...NO_SIGNED_IN_USER,
						underlyingError: e,
					});
				}

				// `fetchAuthSession()` succeeded but didn't return `tokens`.
				// This may happen when unauthenticated access is enabled and there is
				// no user signed in.
				if (!token) {
					throw new GraphQLApiError(NO_VALID_AUTH_TOKEN);
				}

				headers = {
					Authorization: token,
				};
				break;
			}
			case 'lambda':
				if (
					typeof additionalHeaders === 'object' &&
					!additionalHeaders.Authorization
				) {
					throw new GraphQLApiError(NO_AUTH_TOKEN_HEADER);
				}

				headers = {
					Authorization: additionalHeaders.Authorization,
				};
				break;
			case 'none':
				break;
			default:
				break;
		}

		return headers;
	}

	/**
	 * to get the operation type
	 * @param operation
	 */
	getGraphqlOperationType(operation: GraphQLOperation): OperationTypeNode {
		const doc = parse(operation);
		const definitions = doc.definitions as readonly OperationDefinitionNode[];
		const [{ operation: operationType }] = definitions;

		return operationType;
	}

	/**
	 * Executes a GraphQL operation
	 *
	 * @param options - GraphQL Options
	 * @param [additionalHeaders] - headers to merge in after any `libraryConfigHeaders` set in the config
	 * @returns An Observable if the query is a subscription query, else a promise of the graphql result.
	 */
	graphql<T = any>(
		amplify:
			| AmplifyClassV6
			| ((fn: (amplify: any) => Promise<any>) => Promise<AmplifyClassV6>),
		{ query: paramQuery, variables = {}, authMode, authToken }: GraphQLOptions,
		additionalHeaders?: CustomHeaders,
		customUserAgentDetails?: CustomUserAgentDetails,
	): Observable<GraphQLResult<T>> | Promise<GraphQLResult<T>> {
		const query =
			typeof paramQuery === 'string'
				? parse(paramQuery)
				: parse(print(paramQuery));

		const [operationDef = {}] = query.definitions.filter(
			def => def.kind === 'OperationDefinition',
		);
		const { operation: operationType } =
			operationDef as OperationDefinitionNode;

		const headers = additionalHeaders || {};

		switch (operationType) {
			case 'query':
			case 'mutation': {
				const abortController = new AbortController();

				let responsePromise: Promise<GraphQLResult<T>>;

				if (isAmplifyInstance(amplify)) {
					responsePromise = this._graphql<T>(
						amplify,
						{ query, variables, authMode },
						headers,
						abortController,
						customUserAgentDetails,
						authToken,
					);
				} else {
					// NOTE: this wrapper function must be await-able so the Amplify server context manager can
					// destroy the context only after it completes
					const wrapper = async (amplifyInstance: AmplifyClassV6) => {
						const result = await this._graphql<T>(
							amplifyInstance,
							{ query, variables, authMode },
							headers,
							abortController,
							customUserAgentDetails,
							authToken,
						);

						return result;
					};

					responsePromise = amplify(wrapper) as unknown as Promise<
						GraphQLResult<T>
					>;
				}

				this._api.updateRequestToBeCancellable(
					responsePromise,
					abortController,
				);

				return responsePromise;
			}
			case 'subscription':
				return this._graphqlSubscribe(
					amplify as AmplifyClassV6,
					{ query, variables, authMode },
					headers,
					customUserAgentDetails,
					authToken,
				);
			default:
				throw new Error(`invalid operation type: ${operationType}`);
		}
	}

	private async _graphql<T = any>(
		amplify: AmplifyClassV6,
		{ query, variables, authMode: explicitAuthMode }: GraphQLOptions,
		additionalHeaders: CustomHeaders = {},
		abortController: AbortController,
		customUserAgentDetails?: CustomUserAgentDetails,
		authToken?: string,
	): Promise<GraphQLResult<T>> {
		const {
			region,
			endpoint: appSyncGraphqlEndpoint,
			customEndpoint,
			customEndpointRegion,
			defaultAuthMode,
		} = resolveConfig(amplify);

		const initialAuthMode = explicitAuthMode || defaultAuthMode || 'iam';
		// identityPool is an alias for iam. TODO: remove 'iam' in v7
		const authMode =
			initialAuthMode === 'identityPool' ? 'iam' : initialAuthMode;

		/**
		 * Retrieve library options from Amplify configuration.
		 * `customHeaders` here are from the Amplify configuration options,
		 * and are for non-AppSync endpoints only. These are *not* the same as
		 * `additionalHeaders`, which are custom headers that are either 1)
		 * included when configuring the API client or 2) passed along with
		 * individual requests.
		 */
		const { headers: customHeaders, withCredentials } =
			resolveLibraryOptions(amplify);

		/**
		 * Client or request-specific custom headers that may or may not be
		 * returned by a function:
		 */
		let additionalCustomHeaders: Record<string, string>;

		if (typeof additionalHeaders === 'function') {
			const requestOptions: RequestOptions = {
				method: 'POST',
				url: new AmplifyUrl(
					customEndpoint || appSyncGraphqlEndpoint || '',
				).toString(),
				queryString: print(query as DocumentNode),
			};

			additionalCustomHeaders = await additionalHeaders(requestOptions);
		} else {
			additionalCustomHeaders = additionalHeaders;
		}

		// if an authorization header is set, have the explicit authToken take precedence
		if (authToken) {
			additionalCustomHeaders = {
				...additionalCustomHeaders,
				Authorization: authToken,
			};
		}

		// TODO: Figure what we need to do to remove `!`'s.
		const headers = {
			...(!customEndpoint &&
				(await this._headerBasedAuth(
					amplify,
					authMode!,
					additionalCustomHeaders,
				))),
			/**
			 * Custom endpoint headers.
			 * If there is both a custom endpoint and custom region present, we get the headers.
			 * If there is a custom endpoint but no region, we return an empty object.
			 * If neither are present, we return an empty object.
			 */
			...((customEndpoint &&
				(customEndpointRegion
					? await this._headerBasedAuth(
							amplify,
							authMode!,
							additionalCustomHeaders,
						)
					: {})) ||
				{}),
			// Custom headers included in Amplify configuration options:
			...(customHeaders &&
				(await customHeaders({
					query: print(query as DocumentNode),
					variables,
				}))),
			// Custom headers from individual requests or API client configuration:
			...additionalCustomHeaders,
			// User agent headers:
			...(!customEndpoint && {
				[USER_AGENT_HEADER]: getAmplifyUserAgent(customUserAgentDetails),
			}),
		};

		const body = {
			query: print(query as DocumentNode),
			variables: variables || null,
		};

		let signingServiceInfo;

		/**
		 * We do not send the signing service info to the REST API under the
		 * following conditions (i.e. it will not sign the request):
		 *   - there is a custom endpoint but no region
		 *   - the auth mode is `none`, or `apiKey`
		 *   - the auth mode is a type other than the types listed below
		 */
		if (
			(customEndpoint && !customEndpointRegion) ||
			(authMode !== 'oidc' &&
				authMode !== 'userPool' &&
				authMode !== 'iam' &&
				authMode !== 'lambda')
		) {
			signingServiceInfo = undefined;
		} else {
			signingServiceInfo = {
				service: !customEndpointRegion ? 'appsync' : 'execute-api',
				region: !customEndpointRegion ? region : customEndpointRegion,
			};
		}

		const endpoint = customEndpoint || appSyncGraphqlEndpoint;

		if (!endpoint) {
			throw createGraphQLResultWithError<T>(new GraphQLApiError(NO_ENDPOINT));
		}

		let response: any;

		try {
			// See the inline doc of the REST `post()` API for possible errors to be thrown.
			// As these errors are catastrophic they should be caught and handled by GraphQL
			// API consumers.
			const { body: responseBody } = await this._api.post(amplify, {
				url: new AmplifyUrl(endpoint),
				options: {
					headers,
					body,
					signingServiceInfo,
					withCredentials,
				},
				abortController,
			});

			response = await responseBody.json();
		} catch (error) {
			if (this.isCancelError(error)) {
				throw error;
			}

			response = createGraphQLResultWithError<T>(error as any);
		}

		if (isGraphQLResponseWithErrors(response)) {
			throw repackageUnauthorizedError(response);
		}

		return response as unknown as GraphQLResult<T>;
	}

	/**
	 * Checks to see if an error thrown is from an api request cancellation
	 * @param {any} error - Any error
	 * @return {boolean} - A boolean indicating if the error was from an api request cancellation
	 */
	isCancelError(error: any): boolean {
		return this._api.isCancelErrorREST(error);
	}

	/**
	 * Cancels an inflight request. Only applicable for graphql queries and mutations
	 * @param {any} request - request to cancel
	 * @returns - A boolean indicating if the request was cancelled
	 */
	cancel(request: Promise<any>, message?: string): boolean {
		return this._api.cancelREST(request, message);
	}

	private _graphqlSubscribe(
		amplify: AmplifyClassV6,
		{ query, variables, authMode: explicitAuthMode }: GraphQLOptions,
		additionalHeaders: CustomHeaders = {},
		customUserAgentDetails?: CustomUserAgentDetails,
		authToken?: string,
	): Observable<any> {
		const config = resolveConfig(amplify);

		const initialAuthMode =
			explicitAuthMode || config?.defaultAuthMode || 'iam';
		// identityPool is an alias for iam. TODO: remove 'iam' in v7
		const authMode =
			initialAuthMode === 'identityPool' ? 'iam' : initialAuthMode;

		/**
		 * Retrieve library options from Amplify configuration.
		 * `libraryConfigHeaders` are from the Amplify configuration options,
		 * and will not be overwritten by other custom headers. These are *not*
		 * the same as `additionalHeaders`, which are custom headers that are
		 * either 1)included when configuring the API client or 2) passed along
		 * with individual requests.
		 */
		const { headers: libraryConfigHeaders } = resolveLibraryOptions(amplify);

		return this.appSyncRealTime
			.subscribe(
				{
					query: print(query as DocumentNode),
					variables,
					appSyncGraphqlEndpoint: config?.endpoint,
					region: config?.region,
					authenticationType: authMode,
					apiKey: config?.apiKey,
					additionalHeaders,
					authToken,
					libraryConfigHeaders,
				},
				customUserAgentDetails,
			)
			.pipe(
				catchError(e => {
					if (e.errors) {
						throw repackageUnauthorizedError(e);
					}
					throw e;
				}),
			);
	}
}

export const InternalGraphQLAPI = new InternalGraphQLAPIClass();
