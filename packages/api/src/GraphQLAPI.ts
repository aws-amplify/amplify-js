/*
 * Copyright 2017-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
import { GraphQLError } from 'graphql/error/GraphQLError';
import { OperationDefinitionNode } from 'graphql/language';
import { print } from 'graphql/language/printer';
import { parse } from 'graphql/language/parser';
import * as Observable from 'zen-observable';
import {
	Amplify,
	ConsoleLogger as Logger,
	Credentials,
	INTERNAL_AWS_APPSYNC_PUBSUB_PROVIDER,
} from '@aws-amplify/core';
import { PubSub } from '@aws-amplify/pubsub';
import { Auth } from '@aws-amplify/auth';
import Cache from '@aws-amplify/cache';
import { GraphQLOptions, GraphQLResult } from './types';
import { v4 as uuid } from 'uuid';
import { RestClient as RestClass } from './RestClient';

const logger = new Logger('GraphQLAPI');

export const graphqlOperation = (query, variables = {}) => ({
	query,
	variables,
});

/**
 * Export Cloud Logic APIs
 */
export class GraphQLAPIClass {
	/**
	 * @private
	 */
	private _options;
	private _api = null;

	/**
	 * Initialize GraphQL API with AWS configuration
	 * @param {Object} options - Configuration object for API
	 */
	constructor(options) {
		this._options = options;
		logger.debug('API Options', this._options);
	}

	public getModuleName() {
		return 'GraphQLAPI';
	}

	/**
	 * Configure API
	 * @param {Object} config - Configuration of the API
	 * @return {Object} - The current configuration
	 */
	configure(options) {
		const { API = {}, ...otherOptions } = options || {};
		const opt = { ...otherOptions, ...API };
		logger.debug('configure GraphQL API', { opt });

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
		logger.debug('create Rest API instance');
		if (this._options) {
			this._api = new RestClass(this._options);
			return true;
		} else {
			return Promise.reject('API not configured');
		}
	}

	private async _headerBasedAuth(defaultAuthenticationType?) {
		const {
			aws_appsync_authenticationType,
			aws_appsync_apiKey: apiKey,
		} = this._options;
		const authenticationType =
			defaultAuthenticationType || aws_appsync_authenticationType || 'AWS_IAM';
		let headers = {};

		switch (authenticationType) {
			case 'API_KEY':
				if (!apiKey) {
					throw new Error('No api-key configured');
				}
				headers = {
					Authorization: null,
					'X-Api-Key': apiKey,
				};
				break;
			case 'AWS_IAM':
				const credentialsOK = await this._ensureCredentials();
				if (!credentialsOK) {
					throw new Error('No credentials');
				}
				break;
			case 'OPENID_CONNECT':
				const federatedInfo = await Cache.getItem('federatedInfo');

				if (!federatedInfo || !federatedInfo.token) {
					throw new Error('No federated jwt');
				}
				headers = {
					Authorization: federatedInfo.token,
				};
				break;
			case 'AMAZON_COGNITO_USER_POOLS':
				const session = await Auth.currentSession();
				headers = {
					Authorization: session.getAccessToken().getJwtToken(),
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
	getGraphqlOperationType(operation) {
		const doc = parse(operation);
		const {
			definitions: [{ operation: operationType }],
		} = doc;

		return operationType;
	}

	/**
	 * Executes a GraphQL operation
	 *
	 * @param {GraphQLOptions} GraphQL Options
	 * @returns {Promise<GraphQLResult> | Observable<object>}
	 */
	graphql({ query: paramQuery, variables = {}, authMode }: GraphQLOptions) {
		const query =
			typeof paramQuery === 'string'
				? parse(paramQuery)
				: parse(print(paramQuery));

		const [operationDef = {}] = query.definitions.filter(
			def => def.kind === 'OperationDefinition'
		);
		const {
			operation: operationType,
		} = operationDef as OperationDefinitionNode;

		switch (operationType) {
			case 'query':
			case 'mutation':
				return this._graphql({ query, variables, authMode });
			case 'subscription':
				return this._graphqlSubscribe({ query, variables, authMode });
		}

		throw new Error(`invalid operation type: ${operationType}`);
	}

	private async _graphql(
		{ query, variables, authMode }: GraphQLOptions,
		additionalHeaders = {}
	): Promise<GraphQLResult> {
		if (!this._api) {
			await this.createInstance();
		}

		const {
			aws_appsync_region: region,
			aws_appsync_graphqlEndpoint: appSyncGraphqlEndpoint,
			graphql_headers = () => ({}),
			graphql_endpoint: customGraphqlEndpoint,
			graphql_endpoint_iam_region: customEndpointRegion,
		} = this._options;

		const headers = {
			...(!customGraphqlEndpoint && (await this._headerBasedAuth(authMode))),
			...(customGraphqlEndpoint &&
				(customEndpointRegion
					? await this._headerBasedAuth(authMode)
					: { Authorization: null })),
			...additionalHeaders,
			...(await graphql_headers({ query, variables })),
		};

		const body = {
			query: print(query),
			variables,
		};

		const init = {
			headers,
			body,
			signerServiceInfo: {
				service: !customGraphqlEndpoint ? 'appsync' : 'execute-api',
				region: !customGraphqlEndpoint ? region : customEndpointRegion,
			},
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
			response = await this._api.post(endpoint, init);
		} catch (err) {
			response = {
				data: {},
				errors: [new GraphQLError(err.message)],
			};
		}

		const { errors } = response;

		if (errors && errors.length) {
			throw response;
		}

		return response;
	}

	private clientIdentifier = uuid();

	private _graphqlSubscribe({
		query,
		variables,
		authMode,
	}: GraphQLOptions): Observable<object> {
		return new Observable(observer => {
			let handle = null;

			(async () => {
				const { aws_appsync_authenticationType } = this._options;
				const authenticationType = authMode || aws_appsync_authenticationType;
				const additionalheaders = {
					...(authenticationType === 'API_KEY'
						? {
								'x-amz-subscriber-id': this.clientIdentifier,
						  }
						: {}),
				};

				try {
					const {
						extensions: { subscription },
					} = await this._graphql(
						{ query, variables, authMode },
						additionalheaders
					);

					const { newSubscriptions } = subscription;

					const newTopics = Object.getOwnPropertyNames(newSubscriptions).map(
						p => newSubscriptions[p].topic
					);

					const observable = PubSub.subscribe(newTopics, {
						...subscription,
						provider: INTERNAL_AWS_APPSYNC_PUBSUB_PROVIDER,
					});

					handle = observable.subscribe({
						next: data => observer.next(data),
						complete: () => observer.complete(),
						error: data => {
							const error = { ...data };
							if (!error.errors) {
								error.errors = [
									{
										...new GraphQLError('Network Error'),
									},
								];
							}
							observer.error(error);
						},
					});
				} catch (error) {
					observer.error(error);
				}
			})();

			return () => {
				if (handle) {
					handle.unsubscribe();
				}
			};
		});
	}

	/**
	 * @private
	 */
	_ensureCredentials() {
		return Credentials.get()
			.then(credentials => {
				if (!credentials) return false;
				const cred = Credentials.shear(credentials);
				logger.debug('set credentials for api', cred);

				return true;
			})
			.catch(err => {
				logger.warn('ensure credentials error', err);
				return false;
			});
	}
}

let _instance: GraphQLAPIClass = null;

if (!_instance) {
	logger.debug('Creating GraphQL API Instance');
	_instance = new GraphQLAPIClass(null);
	Amplify.register(_instance);
}

export { _instance as GraphQLAPI };
