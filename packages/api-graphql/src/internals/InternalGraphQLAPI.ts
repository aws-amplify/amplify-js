// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	DocumentNode,
	OperationDefinitionNode,
	print,
	parse,
	GraphQLError,
	OperationTypeNode,
} from 'graphql';
import { Observable, catchError } from 'rxjs';
import { AmplifyClassV6, ConsoleLogger } from '@aws-amplify/core';
import {
	GraphQLAuthMode,
	CustomUserAgentDetails,
	getAmplifyUserAgent,
	AmplifyUrl,
} from '@aws-amplify/core/internals/utils';
import {
	GraphQLAuthError,
	GraphQLResult,
	GraphQLOperation,
	GraphQLOptions,
} from '../types';
import { isCancelError as isCancelErrorREST } from '@aws-amplify/api-rest';
import {
	post,
	cancel as cancelREST,
	updateRequestToBeCancellable,
} from '@aws-amplify/api-rest/internals';
import { AWSAppSyncRealTimeProvider } from '../Providers/AWSAppSyncRealTimeProvider';
import { CustomHeaders, RequestOptions } from '@aws-amplify/data-schema-types';
import { resolveConfig, resolveLibraryOptions } from '../utils';
import { repackageUnauthError } from '../utils/errors/repackageAuthError';

const USER_AGENT_HEADER = 'x-amz-user-agent';

const logger = new ConsoleLogger('GraphQLAPI');

const isAmplifyInstance = (
	amplify:
		| AmplifyClassV6
		| ((fn: (amplify: any) => Promise<any>) => Promise<AmplifyClassV6>)
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
		additionalHeaders: Record<string, string> = {}
	) {
		const {
			region: region,
			endpoint: appSyncGraphqlEndpoint,
			apiKey,
		} = resolveConfig(amplify);

		let headers = {};

		switch (authMode) {
			case 'apiKey':
				if (!apiKey) {
					throw new Error(GraphQLAuthError.NO_API_KEY);
				}
				headers = {
					'X-Api-Key': apiKey,
				};
				break;
			case 'iam':
				const session = await amplify.Auth.fetchAuthSession();
				if (session.credentials === undefined) {
					throw new Error(GraphQLAuthError.NO_CREDENTIALS);
				}
				break;
			case 'oidc':
			case 'userPool':
				try {
					let token;

					token = (
						await amplify.Auth.fetchAuthSession()
					).tokens?.accessToken.toString();

					if (!token) {
						throw new Error(GraphQLAuthError.NO_FEDERATED_JWT);
					}
					headers = {
						Authorization: token,
					};
				} catch (e) {
					throw new Error(GraphQLAuthError.NO_CURRENT_USER);
				}
				break;
			case 'lambda':
				if (
					typeof additionalHeaders === 'object' &&
					!additionalHeaders.Authorization
				) {
					throw new Error(GraphQLAuthError.NO_AUTH_TOKEN);
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
		const definitions =
			doc.definitions as ReadonlyArray<OperationDefinitionNode>;
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
		customUserAgentDetails?: CustomUserAgentDetails
	): Observable<GraphQLResult<T>> | Promise<GraphQLResult<T>> {
		const query =
			typeof paramQuery === 'string'
				? parse(paramQuery)
				: parse(print(paramQuery));

		const [operationDef = {}] = query.definitions.filter(
			def => def.kind === 'OperationDefinition'
		);
		const { operation: operationType } =
			operationDef as OperationDefinitionNode;

		const headers = additionalHeaders || {};

		switch (operationType) {
			case 'query':
			case 'mutation':
				const abortController = new AbortController();

				let responsePromise: Promise<GraphQLResult<T>>;

				if (isAmplifyInstance(amplify)) {
					responsePromise = this._graphql<T>(
						amplify,
						{ query, variables, authMode },
						headers,
						abortController,
						customUserAgentDetails,
						authToken
					);
				} else {
					const wrapper = (amplifyInstance: AmplifyClassV6) =>
						this._graphql<T>(
							amplifyInstance,
							{ query, variables, authMode },
							headers,
							abortController,
							customUserAgentDetails,
							authToken
						);

					responsePromise = amplify(wrapper) as unknown as Promise<
						GraphQLResult<T>
					>;
				}

				this._api.updateRequestToBeCancellable(
					responsePromise,
					abortController
				);
				return responsePromise;
			case 'subscription':
				return this._graphqlSubscribe(
					amplify as AmplifyClassV6,
					{ query, variables, authMode },
					headers,
					customUserAgentDetails,
					authToken
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
		authToken?: string
	): Promise<GraphQLResult<T>> {
		const {
			region: region,
			endpoint: appSyncGraphqlEndpoint,
			customEndpoint,
			customEndpointRegion,
			defaultAuthMode,
		} = resolveConfig(amplify);

		const authMode = explicitAuthMode || defaultAuthMode || 'iam';

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
					customEndpoint || appSyncGraphqlEndpoint || ''
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
					additionalCustomHeaders
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
							additionalCustomHeaders
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
			const error = new GraphQLError('No graphql endpoint provided.');

			throw {
				data: {},
				errors: [error],
			};
		}

		let response: any;

		try {
			const { body: responseBody } = await this._api.post({
				url: new AmplifyUrl(endpoint),
				options: {
					headers,
					body,
					signingServiceInfo,
					withCredentials,
				},
				abortController,
			});

			const result = await responseBody.json();

			response = result;
		} catch (err) {
			// If the exception is because user intentionally
			// cancelled the request, do not modify the exception
			// so that clients can identify the exception correctly.
			if (this.isCancelError(err)) {
				throw err;
			}

			response = {
				data: {},
				errors: [
					new GraphQLError(
						(err as any).message,
						null,
						null,
						null,
						null,
						err as any
					),
				],
			};
		}

		const { errors } = response;

		if (errors && errors.length) {
			throw repackageUnauthError(response);
		}

		return response;
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
		{ query, variables, authMode }: GraphQLOptions,
		additionalHeaders: CustomHeaders = {},
		customUserAgentDetails?: CustomUserAgentDetails,
		authToken?: string
	): Observable<any> {
		const config = resolveConfig(amplify);

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
					authenticationType: authMode || config?.defaultAuthMode,
					apiKey: config?.apiKey,
					additionalHeaders,
					authToken,
					libraryConfigHeaders,
				},
				customUserAgentDetails
			)
			.pipe(
				catchError(e => {
					if (e.errors) {
						throw repackageUnauthError(e);
					}
					throw e;
				})
			);
	}
}

export const InternalGraphQLAPI = new InternalGraphQLAPIClass();
