// TODO: Francisco is migrating pubsub
// TODO: remove pubsub dep for now
// TODO update package.json with francisco's changes.

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
import Observable from 'zen-observable-ts';
// TODO V6
import {
	// Amplify,
	// ConsoleLogger as Logger,
	// Credentials,
	// CustomUserAgentDetails,
	// getAmplifyUserAgent,
	// INTERNAL_AWS_APPSYNC_REALTIME_PUBSUB_PROVIDER,
	fetchAuthSession,
} from '@aws-amplify/core';
// TODO V6 - not available?
// should work with yarn bootstrap
import { Credentials } from '@aws-amplify/core/internals/aws-client-utils';
import {
	CustomUserAgentDetails,
	ConsoleLogger as Logger,
	getAmplifyUserAgent,
	// INTERNAL_AWS_APPSYNC_REALTIME_PUBSUB_PROVIDER,
} from '@aws-amplify/core/internals/utils';
// import { InternalPubSub } from '@aws-amplify/pubsub/internals';
// import { InternalAuth } from '@aws-amplify/auth/internals';
import { Cache } from '@aws-amplify/cache';
import {
	GraphQLAuthError,
	GraphQLOptions,
	GraphQLResult,
	GraphQLOperation,
} from '../types';
// import { RestClient } from '@aws-amplify/api-rest';
import { post } from '@aws-amplify/api-rest';

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

// TODO sCan also create function using headerbasedauth + creatingbody, then call post api

/**
 * Export Cloud Logic APIs
 */
export class InternalGraphQLAPIClass {
	/**
	 * @private
	 */
	private _options;
	private _api = null;

	// TODO V6: can be removed
	// InternalAuth = InternalAuth;
	Cache = Cache;
	// TODO V6
	// Credentials = Credentials;

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

	/**
	 * Configure API
	 * @param {Object} config - Configuration of the API
	 * @return {Object} - The current configuration
	 */
	configure(options) {
		debugger;
		const { API = {}, ...otherOptions } = options || {};
		let opt = { ...otherOptions, ...API };
		logger.debug('configure GraphQL API', { opt });

		if (opt['aws_project_region']) {
			opt = Object.assign({}, opt, {
				region: opt['aws_project_region'],
				header: {},
			});
		}

		if (
			typeof opt.graphql_headers !== 'undefined' &&
			typeof opt.graphql_headers !== 'function'
		) {
			logger.warn('graphql_headers should be a function');
			opt.graphql_headers = undefined;
		}

		this._options = Object.assign({}, this._options, opt);

		this.createInstance();

		return this._options;
	}

	/**
	 * Create an instance of API for the library
	 * @return - A promise of true if Success
	 */
	createInstance() {
		debugger;
		logger.debug('create Rest instance');
		if (this._options) {
			// TODO: remove options, use getConfig here
			// this._api = new RestClient(this._options);
			this._api = post;

			// Share instance Credentials with client for SSR
			// TODO V6: fetchAuthSesssion?
			// this._api.Credentials = this.Credentials;

			return true;
		} else {
			return Promise.reject('API not configured');
		}
	}

	// TODO V6
	private async _headerBasedAuth(
		defaultAuthenticationType?,
		additionalHeaders: { [key: string]: string } = {},
		customUserAgentDetails?: CustomUserAgentDetails
	) {
		debugger;
		// TODO: Amplify.getConfig().API
		// apikey is the same (but needs to be on the config)
		const { aws_appsync_authenticationType, aws_appsync_apiKey: apiKey } =
			this._options;
		const authenticationType =
			defaultAuthenticationType || aws_appsync_authenticationType || 'AWS_IAM';
		let headers = {};

		switch (authenticationType) {
			// NOTHING HERE
			case 'API_KEY':
				if (!apiKey) {
					throw new Error(GraphQLAuthError.NO_API_KEY);
				}
				headers = {
					Authorization: null,
					'X-Api-Key': apiKey,
				};
				break;
			// NOTHING HERE
			case 'AWS_IAM':
				// const credentialsOK = await this._ensureCredentials();
				// if (!credentialsOK) {
				// 	throw new Error(GraphQLAuthError.NO_CREDENTIALS);
				// }
				break;
			case 'OPENID_CONNECT':
				try {
					let token;
					// backwards compatibility
					// const federatedInfo = await Cache.getItem('federatedInfo');
					// if (federatedInfo) {
					// 	token = federatedInfo.token;
					// } else {
					// const currentUser = await InternalAuth.currentAuthenticatedUser(
					// 	undefined,
					// 	customUserAgentDetails
					// );
					// if (currentUser) {
					// 	token = currentUser.token;
					// }

					// correct token:
					token = (await fetchAuthSession()).tokens?.accessToken.toString();
					// }
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
			case 'AMAZON_COGNITO_USER_POOLS':
				try {
					// TODO V6
					// const session = await this.InternalAuth.currentSession(
					// 	customUserAgentDetails
					// );
					const session = await fetchAuthSession();
					headers = {
						// TODO V6
						// Authorization: session.getAccessToken().getJwtToken(),
						// `idToken` or `accessToken`?
						Authorization: session.tokens?.accessToken.toString(),
					};
				} catch (e) {
					throw new Error(GraphQLAuthError.NO_CURRENT_USER);
				}
				break;
			case 'AWS_LAMBDA':
				if (!additionalHeaders.Authorization) {
					throw new Error(GraphQLAuthError.NO_AUTH_TOKEN);
				}
				headers = {
					Authorization: additionalHeaders.Authorization,
				};
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
		debugger;
		const doc = parse(operation);
		const definitions =
			doc.definitions as ReadonlyArray<OperationDefinitionNode>;
		const [{ operation: operationType }] = definitions;

		return operationType;
	}

	// TODO V6: COULD JUST EXPORT THIS:

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
		debugger;
		// TODO: Could retrieve headers and config here. Call post method.
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
				this.createInstanceIfNotCreated();
				// TODO: This is being removed:
				// const cancellableToken = this._api.getCancellableToken();
				const initParams = {
					// cancellableToken,
					withCredentials: this._options.withCredentials,
				};
				const responsePromise = this._graphql<T>(
					{ query, variables, authMode },
					headers,
					initParams,
					customUserAgentDetails
				);
				// this._api.updateRequestToBeCancellable(
				// 	responsePromise,
				// 	cancellableToken
				// );
				return responsePromise;
			// case 'subscription':
			// 	return this._graphqlSubscribe(
			// 		{ query, variables, authMode },
			// 		headers,
			// 		customUserAgentDetails
			// 	);
			default:
				throw new Error(`invalid operation type: ${operationType}`);
		}
	}

	private async _graphql<T = any>(
		{ query, variables, authMode }: GraphQLOptions,
		additionalHeaders = {},
		initParams = {},
		customUserAgentDetails?: CustomUserAgentDetails
	): Promise<GraphQLResult<T>> {
		debugger;
		this.createInstanceIfNotCreated();
		const {
			aws_appsync_region: region,
			aws_appsync_graphqlEndpoint: appSyncGraphqlEndpoint,
			graphql_headers = () => ({}),
			graphql_endpoint: customGraphqlEndpoint,
			graphql_endpoint_iam_region: customEndpointRegion,
		} = this._options;

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
			...(await graphql_headers({ query, variables })),
			...additionalHeaders,
			...(!customGraphqlEndpoint && {
				[USER_AGENT_HEADER]: getAmplifyUserAgent(customUserAgentDetails),
			}),
		};

		const body = {
			query: print(query as DocumentNode),
			variables,
		};

		const init = Object.assign(
			{
				headers,
				body,
				signerServiceInfo: {
					service: !customGraphqlEndpoint ? 'appsync' : 'execute-api',
					region: !customGraphqlEndpoint ? region : customEndpointRegion,
				},
			},
			initParams
		);

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
			// response = await this._api.post(endpoint, init);
			// TODO V6
			// @ts-ignore
			response = await post(endpoint, { headers, body, region });
		} catch (err) {
			// If the exception is because user intentionally
			// cancelled the request, do not modify the exception
			// so that clients can identify the exception correctly.
			// TODO V6
			// if (this._api.isCancel(err)) {
			// 	throw err;
			// }
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

	async createInstanceIfNotCreated() {
		if (!this._api) {
			await this.createInstance();
		}
	}

	/**
	 * Checks to see if an error thrown is from an api request cancellation
	 * @param {any} error - Any error
	 * @return {boolean} - A boolean indicating if the error was from an api request cancellation
	 */
	// TODO V6
	// isCancel(error) {
	// 	debugger;
	// 	return this._api.isCancel(error);
	// }

	/**
	 * Cancels an inflight request. Only applicable for graphql queries and mutations
	 * @param {any} request - request to cancel
	 * @return {boolean} - A boolean indicating if the request was cancelled
	 */
	// TODO V6
	// cancel(request: Promise<any>, message?: string) {
	// 	return this._api.cancel(request, message);
	// }

	/**
	 * Check if the request has a corresponding cancel token in the WeakMap.
	 * @params request - The request promise
	 * @return if the request has a corresponding cancel token.
	 */
	// TODO V6
	// hasCancelToken(request: Promise<any>) {
	// 	return this._api.hasCancelToken(request);
	// }

	// private _graphqlSubscribe(
	// 	{
	// 		query,
	// 		variables,
	// 		authMode: defaultAuthenticationType,
	// 		authToken,
	// 	}: GraphQLOptions,
	// 	additionalHeaders = {},
	// 	customUserAgentDetails?: CustomUserAgentDetails
	// ): Observable<any> {
	// 	const {
	// 		aws_appsync_region: region,
	// 		aws_appsync_graphqlEndpoint: appSyncGraphqlEndpoint,
	// 		aws_appsync_authenticationType,
	// 		aws_appsync_apiKey: apiKey,
	// 		graphql_headers = () => ({}),
	// 	} = this._options;
	// 	const authenticationType =
	// 		defaultAuthenticationType || aws_appsync_authenticationType || 'AWS_IAM';

		throw new Error('not implemented yet');
	}
	// if (InternalPubSub && typeof InternalPubSub.subscribe === 'function') {
	// 	return InternalPubSub.subscribe(
	// 		'',
	// 		{
	// 			provider: INTERNAL_AWS_APPSYNC_REALTIME_PUBSUB_PROVIDER,
	// 			appSyncGraphqlEndpoint,
	// 			authenticationType,
	// 			apiKey,
	// 			query: print(query as DocumentNode),
	// 			region,
	// 			variables,
	// 			graphql_headers,
	// 			additionalHeaders,
	// 			authToken,
	// 		},
	// 		customUserAgentDetails
	// 	);
	// } else {
	// 	logger.debug('No pubsub module applied for subscription');
	// 	throw new Error('No pubsub module applied for subscription');
	// }
}

/**
 * @private
 */
// async _ensureCredentials() {
// 	// return this.Credentials.get()
// 	return await fetchAuthSession()
// 		.then(credentials => {
// 			if (!credentials) return false;
// 			// TODO V6
// 			const cred = this.Credentials.shear(credentials);
// 			logger.debug('set credentials for api', cred);

// 			return true;
// 		})
// 		.catch(err => {
// 			logger.warn('ensure credentials error', err);
// 			return false;
// 		});
// }

export const InternalGraphQLAPI = new InternalGraphQLAPIClass(null);
// Amplify.register(InternalGraphQLAPI);
