/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
import { OperationDefinitionNode, GraphQLError } from 'graphql';
import { print } from 'graphql/language/printer';
import { parse } from 'graphql/language/parser';
import * as Observable from 'zen-observable';
import { RestClient as RestClass } from './RestClient';
import Amplify, { ConsoleLogger as Logger, Credentials } from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import {
    GraphQLOptions,
    GraphQLResult,
    APIClassOptions,
    RestRequestExtraParams,
    RestRequestExtraParamsWithResponse,
} from './types';
import Cache from '@aws-amplify/cache';
import { INTERNAL_AWS_APPSYNC_PUBSUB_PROVIDER } from '@aws-amplify/core/lib/constants';
import { v4 as uuid } from 'uuid';
import { AxiosResponse } from 'axios';

const logger = new Logger('API');

export const graphqlOperation = (query:string, variables = {}) => ({ query, variables });

/**
 * Export Cloud Logic APIs
 */
export default class APIClass {
    /**
     * @private
     */
    private _options?: APIClassOptions | null;
    private _api?: RestClass | null = null;
    private _pubSub = Amplify.PubSub;

    /**
     * Initialize Storage with AWS configuration
     * @param {Object} options - Configuration object for storage
     */
    constructor(options: APIClass["_options"]) {
        this._options = options;
        logger.debug('API Options', this._options);
    }

    public getModuleName() {
        return 'API';
    }

    /**
     * Configure API part with aws configurations
     * @param {Object} config - Configuration of the API
     * @return {Object} - The current configuration
     */
    configure(options?: null | APIClassOptions) {
        const { API = {}, ...otherOptions } = options || {};
        let opt = { ...otherOptions, ...API };
        logger.debug('configure API', { opt });

        if (opt['aws_project_region']) {
            if (opt['aws_cloud_logic_custom']) {
                const custom = opt['aws_cloud_logic_custom'];
                opt.endpoints = (typeof custom === 'string') ? JSON.parse(custom)
                    : custom;
            }

            opt = Object.assign({}, opt, {
                region: opt['aws_project_region'],
                header: {},
            });
        }

        if (!Array.isArray(opt.endpoints)) {
            opt.endpoints = [];
        }

        // Check if endpoints has custom_headers and validate if is a function
        opt.endpoints.forEach((endpoint) => {
            if (typeof endpoint.custom_header !== 'undefined' && typeof endpoint.custom_header !== 'function') {
                logger.warn('API ' + endpoint.name + ', custom_header should be a function');
                endpoint.custom_header = undefined;
            }
        });

        if (typeof opt.graphql_headers !== 'undefined' && typeof opt.graphql_headers !== 'function') {
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
        logger.debug('create API instance');
        if (this._options) {
            this._api = new RestClass(this._options);
            return true;
        } else {
            return Promise.reject('API not configured');
        }
    }

    /**
     * Make a GET request
     * @param {string} apiName  - The api name of the request
     * @param {string} path - The path of the request
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    get<Output = {}>(
        apiName: string,
        url: string,
        init?: RestRequestExtraParamsWithResponse
    ): Promise<AxiosResponse<Output>>;
    get<Output = {}>(
        apiName: string,
        url: string,
        init?: RestRequestExtraParams & { response?: undefined }
        ): Promise<Output>;
    async get(apiName: string, path: string, init?: RestRequestExtraParams) {
        if (!this._api) {
            try {
                await this.createInstance();
            } catch (error) {
                return Promise.reject(error);
            }
        }

        const endpoint = this._api.endpoint(apiName);
        if (endpoint.length === 0) {
            return Promise.reject('API ' + apiName + ' does not exist');
        }
        return this._api.get(endpoint + path, init);
    }

    /**
     * Make a POST request
     * @param {string} apiName  - The api name of the request
     * @param {string} path - The path of the request
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    post<Output = {}>(
        apiName: string,
        url: string,
        init?: RestRequestExtraParams & { response?: undefined }
    ): Promise<AxiosResponse<Output>["data"]>;
    post<Output = {}>(
        apiName:string,
        url: string,
        init?: RestRequestExtraParamsWithResponse
    ): Promise<AxiosResponse<Output>>;
    async post(apiName: string, path: string, init?: RestRequestExtraParams) {
        if (!this._api) {
            try {
                await this.createInstance();
            } catch (error) {
                return Promise.reject(error);
            }
        }

        const endpoint = this._api.endpoint(apiName);
        if (endpoint.length === 0) {
            return Promise.reject('API ' + apiName + ' does not exist');
        }
        return this._api.post(endpoint + path, init);
        // let a = this.put("","",{})
        // let b = this.put("","",{response:true})
    }

    /**
     * Make a PUT request
     * @param {string} apiName  - The api name of the request
     * @param {string} path - The path of the request
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    put<Output = {}>(
        apiName: string,
        url: string,
        init?: RestRequestExtraParams & { response?:undefined }
    ): Promise<AxiosResponse<Output>["data"]>;
    put<Output = {}>(
        apiName: string,
        url: string,
        init?: RestRequestExtraParamsWithResponse
    ): Promise<AxiosResponse<Output>>;
    async put(apiName: string, path: string, init?: RestRequestExtraParams) {
        if (!this._api) {
            try {
                await this.createInstance();
            } catch (error) {
                return Promise.reject(error);
            }
        }

        const endpoint = this._api.endpoint(apiName);
        if (endpoint.length === 0) {
            return Promise.reject('API ' + apiName + ' does not exist');
        }
        return this._api.put(endpoint + path, init);
    }

    /**
     * Make a PATCH request
     * @param {string} apiName  - The api name of the request
     * @param {string} path - The path of the request
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    patch<Output = {}>(
        apiName: string,
        url: string,
        init?: RestRequestExtraParams & { response?:undefined }
    ): Promise<AxiosResponse<Output>["data"]>;
    patch<Output = {}>(
        apiName: string,
        url: string,
        init?: RestRequestExtraParamsWithResponse
    ): Promise<AxiosResponse<Output>>;
    async patch(apiName: string, path: string, init?: RestRequestExtraParams) {
        if (!this._api) {
            try {
                await this.createInstance();
            } catch (error) {
                return Promise.reject(error);
            }
        }

        const endpoint = this._api.endpoint(apiName);
        if (endpoint.length === 0) {
            return Promise.reject('API ' + apiName + ' does not exist');
        }
        return this._api.patch(endpoint + path, init);
    }

    /**
     * Make a DEL request
     * @param {string} apiName  - The api name of the request
     * @param {string} path - The path of the request
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    del<Output = {}>(
        apiName: string,
        url: string,
        init?: RestRequestExtraParams & { response?:undefined }
    ): Promise<AxiosResponse<Output>["data"]>;
    del<Output = {}>(
        apiName: string,
        url: string,
        init?: RestRequestExtraParamsWithResponse
    ): Promise<AxiosResponse<Output>>;
    async del(apiName: string, path: string, init?: RestRequestExtraParams){
        if (!this._api) {
            try {
                await this.createInstance();
            } catch (error) {
                return Promise.reject(error);
            }
        }

        const endpoint = this._api.endpoint(apiName);
        if (endpoint.length === 0) {
            return Promise.reject('API ' + apiName + ' does not exist');
        }
        return this._api.del(endpoint + path, init);
    }

    /**
     * Make a HEAD request
     * @param {string} apiName  - The api name of the request
     * @param {string} path - The path of the request
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    head<Output = {}>(
        apiName:string,
        url: string,
        init?: RestRequestExtraParams & { response?:undefined }
    ): Promise<AxiosResponse<Output>["data"]>;
    head<Output = {}>(
        apiName:string,
        url: string,
        init?: RestRequestExtraParamsWithResponse
    ): Promise<AxiosResponse<Output>>;
    async head(apiName: string, path: string, init?: RestRequestExtraParams) {
        if (!this._api) {
            try {
                await this.createInstance();
            } catch (error) {
                return Promise.reject(error);
            }
        }

        const endpoint = this._api.endpoint(apiName);
        if (endpoint.length === 0) {
            return Promise.reject('API ' + apiName + ' does not exist');
        }
        return this._api.head(endpoint + path, init);
    }

    /**
    * Getting endpoint for API
    * @param {string} apiName - The name of the api
    * @return {string} - The endpoint of the api
    */
    async endpoint(apiName: string) {
        if (!this._api) {
            try {
                await this.createInstance();
            } catch (error) {
                return Promise.reject(error);
            }
        }
        return this._api.endpoint(apiName);
    }

    private async _headerBasedAuth(defaultAuthenticationType?) {
        const {
            aws_appsync_authenticationType,
            aws_appsync_apiKey: apiKey,
        } = this._options;
        const authenticationType = defaultAuthenticationType || aws_appsync_authenticationType || "AWS_IAM";
        let headers = {};

        switch (authenticationType) {
            case 'API_KEY':
                if (!apiKey) {
                    throw new Error('No api-key configured');
                }
                headers = {
                    Authorization: null,
                    'X-Api-Key': apiKey
                };
                break;
            case 'AWS_IAM':
                const credentialsOK = await this._ensureCredentials();
                if (!credentialsOK) { throw new Error('No credentials'); }
                break;
            case 'OPENID_CONNECT':
                const federatedInfo = await Cache.getItem('federatedInfo');

                if (!federatedInfo || !federatedInfo.token) { throw new Error('No federated jwt'); }
                headers = {
                    Authorization: federatedInfo.token
                };
                break;
            case 'AMAZON_COGNITO_USER_POOLS':
                const session = await Auth.currentSession();
                headers = {
                    Authorization: session.getAccessToken().getJwtToken()
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
        const { definitions: [{ operation: operationType },] } = doc;
        return operationType;
    }

    /**
     * Executes a GraphQL operation
     *
     * @param {GraphQLOptions} GraphQL Options
     * @returns {Promise<GraphQLResult<Output>> | Observable<Output>}
     */
    graphql<Output = {}, Variables = {}>({
        query: paramQuery,
        variables = {} as Variables,
        authMode,
      }: GraphQLOptions<Variables>) {
        const query = typeof paramQuery === 'string' ? parse(paramQuery) : parse(print(paramQuery));

        const [operationDef = {}] = query.definitions.filter(def => def.kind === 'OperationDefinition');
        const { operation: operationType } = operationDef as OperationDefinitionNode;

        switch (operationType) {
            case 'query':
            case 'mutation':
                return this._graphql<Output, Variables>({ query, variables, authMode });
            case 'subscription':
                return this._graphqlSubscribe<Output, Variables>({ query, variables, authMode });
        }

        throw new Error(`invalid operation type: ${operationType}`);
    }

    private async _graphql<Output = {}, Variables = {}>(
        { query, variables, authMode }: GraphQLOptions<Variables>,
        additionalHeaders = {}
      ): Promise<GraphQLResult<Output>> {
        if (!this._api) {
            await this.createInstance();
        }

        const {
            aws_appsync_region: region,
            aws_appsync_graphqlEndpoint: appSyncGraphqlEndpoint,
            graphql_headers = async () => ({}),
            graphql_endpoint: customGraphqlEndpoint,
            graphql_endpoint_iam_region: customEndpointRegion
        } = this._options;

        const headers = {
            ...(!customGraphqlEndpoint && await this._headerBasedAuth(authMode)),
            ...(customGraphqlEndpoint &&
                (customEndpointRegion ? await this._headerBasedAuth(authMode) : { Authorization: null })
            ),
            ...additionalHeaders,
            ... await graphql_headers({ query, variables }),
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
                region: !customGraphqlEndpoint ? region : customEndpointRegion
            }
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
                errors: [
                    new GraphQLError(err.message)
                ]
            };
        }

        const { errors } = response;

        if (errors && errors.length) {
            throw response;
        }

        return response;
    }

    private clientIdentifier = uuid();

    private _graphqlSubscribe<Output = {}, Variables = {}>(
        { query, variables, authMode }: GraphQLOptions<Variables>,
        additionalHeaders = {}
      ): Observable<Output> {
        if (Amplify.PubSub && typeof Amplify.PubSub.subscribe === 'function') {
            return new Observable(observer => {

                let handle = null;

                (async () => {
                    const {
                        aws_appsync_authenticationType,
                    } = this._options;
                    const authenticationType = authMode || aws_appsync_authenticationType;
                    const additionalheaders = {
                        ...(authenticationType === 'API_KEY' ? {
                            'x-amz-subscriber-id': this.clientIdentifier
                        } : {})
                    };

                    try {
                        const {
                            extensions: { subscription },

                        } = await this._graphql({ query, variables, authMode }, additionalheaders);

                        const { newSubscriptions } = subscription;

                        const newTopics =
                            Object.getOwnPropertyNames(newSubscriptions).map(p => newSubscriptions[p].topic);

                        const observable = Amplify.PubSub.subscribe(newTopics, {
                            ...subscription,
                            provider: INTERNAL_AWS_APPSYNC_PUBSUB_PROVIDER,
                        });

                        handle = observable.subscribe({
                            next: (data) => observer.next(data),
                            complete: () => observer.complete(),
                            error: (data) => {
                                const error = { ...data };
                                if (!error.errors) {
                                    error.errors = [{
                                        ...new GraphQLError('Network Error')
                                    }];
                                }
                                observer.error(error);
                            }
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
        } else {
            logger.debug('No pubsub module applied for subscription');
            throw new Error('No pubsub module applied for subscription');
        }
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
