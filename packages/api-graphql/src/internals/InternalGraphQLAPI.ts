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
import { Observable } from 'rxjs';
import { Amplify, Cache, fetchAuthSession } from '@aws-amplify/core';
import {
	CustomUserAgentDetails,
	ConsoleLogger as Logger,
	getAmplifyUserAgent,
} from '@aws-amplify/core/internals/utils';
import {
	GraphQLAuthError,
	GraphQLResult,
	GraphQLOperation,
	GraphQLOptions,
} from '../types';
import { post } from '@aws-amplify/api-rest/internals';
import { AWSAppSyncRealTimeProvider } from '../Providers/AWSAppSyncRealTimeProvider';

const USER_AGENT_HEADER = 'x-amz-user-agent';

const logger = new Logger('GraphQLAPI');

export const graphqlOperation = (
	query,
	variables = {},
	authToken?: string
) => ({
	query,
	variables,
	authToken,
});

/**
 * Export Cloud Logic APIs
 */
export class InternalGraphQLAPIClass {
	/**
	 * @private
	 */
	private _options;
	private appSyncRealTime: AWSAppSyncRealTimeProvider | null;

	Cache = Cache;
	private _api = { post };

	/**
	 * Initialize GraphQL API with AWS configuration
	 * @param {Object} options - Configuration object for API
	 */
	constructor(options) {
		this._options = options;
		logger.debug('API Options', this._options);
	}

	public getModuleName() {
		return 'InternalGraphQLAPI';
	}

	private async _headerBasedAuth(
		defaultAuthenticationType?,
		additionalHeaders: { [key: string]: string } = {},
		customUserAgentDetails?: CustomUserAgentDetails
	) {
		const config = Amplify.getConfig();
		const {
			region: region,
			endpoint: appSyncGraphqlEndpoint,
			apiKey,
			defaultAuthMode,
		} = config.API.GraphQL;

		let headers = {};

		switch (defaultAuthMode) {
			case 'apiKey':
				if (!apiKey) {
					throw new Error(GraphQLAuthError.NO_API_KEY);
				}
				headers = {
					'X-Api-Key': apiKey,
				};
				break;
			case 'iam':
				const session = await fetchAuthSession();
				if (session.credentials === undefined) {
					throw new Error(GraphQLAuthError.NO_CREDENTIALS);
				}
				break;
			case 'oidc':
			case 'userPool':
				try {
					let token;

					token = (await fetchAuthSession()).tokens?.accessToken.toString();

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
				if (!additionalHeaders.Authorization) {
					throw new Error(GraphQLAuthError.NO_AUTH_TOKEN);
				}
				headers = {
					Authorization: additionalHeaders.Authorization,
				};
				break;
			case 'none':
				break;
			default:
				headers = {
					Authorization: null,
				};
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
	 * @param [additionalHeaders] - headers to merge in after any `graphql_headers` set in the config
	 * @returns An Observable if the query is a subscription query, else a promise of the graphql result.
	 */
	graphql<T = any>(
		{ query: paramQuery, variables = {}, authMode, authToken }: GraphQLOptions,
		additionalHeaders?: { [key: string]: string },
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

		// if an authorization header is set, have the explicit authToken take precedence
		if (authToken) {
			headers.Authorization = authToken;
		}

		switch (operationType) {
			case 'query':
			case 'mutation':
				const responsePromise = this._graphql<T>(
					{ query, variables, authMode },
					headers,
					customUserAgentDetails
				);
				return responsePromise;
			case 'subscription':
				return this._graphqlSubscribe(
					{ query, variables, authMode },
					headers,
					customUserAgentDetails
				);
			default:
				throw new Error(`invalid operation type: ${operationType}`);
		}
	}

	private async _graphql<T = any>(
		{ query, variables, authMode }: GraphQLOptions,
		additionalHeaders = {},
		customUserAgentDetails?: CustomUserAgentDetails
	): Promise<GraphQLResult<T>> {
		const config = Amplify.getConfig();

		const { region: region, endpoint: appSyncGraphqlEndpoint } =
			config.API.GraphQL;

		const customGraphqlEndpoint = null;
		const customEndpointRegion = null;

		const headers = {
			...(!customGraphqlEndpoint &&
				(await this._headerBasedAuth(
					authMode,
					additionalHeaders,
					customUserAgentDetails
				))),
			...(customGraphqlEndpoint &&
				(customEndpointRegion
					? await this._headerBasedAuth(
							authMode,
							additionalHeaders,
							customUserAgentDetails
					  )
					: { Authorization: null })),
			...additionalHeaders,
			...(!customGraphqlEndpoint && {
				[USER_AGENT_HEADER]: getAmplifyUserAgent(customUserAgentDetails),
			}),
		};

		const body = {
			query: print(query as DocumentNode),
			variables,
		};

		const endpoint = customGraphqlEndpoint || appSyncGraphqlEndpoint;

		if (!endpoint) {
			const error = new GraphQLError('No graphql endpoint provided.');

			throw {
				data: {},
				errors: [error],
			};
		}

		let response;
		try {
			const { body: responsePayload } = await this._api.post({
				url: new URL(endpoint),
				options: {
					headers,
					body,
					signingServiceInfo: {
						service: 'appsync',
						region,
					},
				},
			});
			response = await responsePayload.json();
		} catch (err) {
			response = {
				data: {},
				errors: [new GraphQLError(err.message, null, null, null, null, err)],
			};
		}

		const { errors } = response;

		if (errors && errors.length) {
			throw response;
		}

		return response;
	}

	private _graphqlSubscribe(
		{
			query,
			variables,
			authMode: defaultAuthenticationType,
			authToken,
		}: GraphQLOptions,
		additionalHeaders = {},
		customUserAgentDetails?: CustomUserAgentDetails
	): Observable<any> {
		const { GraphQL } = Amplify.getConfig().API ?? {};
		if (!this.appSyncRealTime) {
			this.appSyncRealTime = new AWSAppSyncRealTimeProvider();
		}
		return this.appSyncRealTime.subscribe({
			query: print(query as DocumentNode),
			variables,
			appSyncGraphqlEndpoint: GraphQL?.endpoint,
			region: GraphQL?.region,
			authenticationType: GraphQL?.defaultAuthMode,
			apiKey: GraphQL?.apiKey,
		});
	}
}

export const InternalGraphQLAPI = new InternalGraphQLAPIClass(null);
