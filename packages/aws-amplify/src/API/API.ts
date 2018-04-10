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
import { OperationDefinitionNode } from 'graphql';
import { print } from 'graphql/language/printer';
import { parse } from 'graphql/language/parser';
import * as Observable from 'zen-observable';
import PubSub from '../PubSub';

import { RestClient as RestClass } from './RestClient';

import Auth from '../Auth';
import { ConsoleLogger as Logger } from '../Common/Logger';
import { GraphQLOptions, GraphQLResult } from './types';

const logger = new Logger('API');

export const graphqlOperation = (query, variables = {}) => ({ query, variables });

/**
 * Export Cloud Logic APIs
 */
export default class APIClass {
    /**
     * @private
     */
    private _options;
    private _api = null;

    /**
     * Initialize Storage with AWS configurations
     * @param {Object} options - Configuration object for storage
     */
    constructor(options) {
        this._options = options;
        logger.debug('API Options', this._options);
    }

    /**
     * Configure API part with aws configurations
     * @param {Object} config - Configuration of the API
     * @return {Object} - The current configuration
     */
    configure(options) {
        let opt = options ? options.API || options : {};
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
            return Promise.reject('API no configured');
        }
    }

    /**
     * Make a GET request
     * @param {string} apiName  - The api name of the request
     * @param {string} path - The path of the request
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    async get(apiName, path, init) {
        if (!this._api) {
            try {
                await this.createInstance();
            } catch (error) {
                return Promise.reject(error);
            }
        }

        const credentialsOK = await this._ensureCredentials();
        if (!credentialsOK) { return Promise.reject('No credentials'); }

        const endpoint = this._api.endpoint(apiName);
        if (endpoint.length === 0) {
            return Promise.reject('Api ' + apiName + ' does not exist');
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
    async post(apiName, path, init) {
        if (!this._api) {
            try {
                await this.createInstance();
            } catch (error) {
                return Promise.reject(error);
            }
        }

        const credentialsOK = await this._ensureCredentials();
        if (!credentialsOK) { return Promise.reject('No credentials'); }

        const endpoint = this._api.endpoint(apiName);
        if (endpoint.length === 0) {
            return Promise.reject('Api ' + apiName + ' does not exist');
        }
        return this._api.post(endpoint + path, init);
    }

    /**
     * Make a PUT request
     * @param {string} apiName  - The api name of the request
     * @param {string} path - The path of the request
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    async put(apiName, path, init) {
        if (!this._api) {
            try {
                await this.createInstance();
            } catch (error) {
                return Promise.reject(error);
            }
        }

        const credentialsOK = await this._ensureCredentials();
        if (!credentialsOK) { return Promise.reject('No credentials'); }

        const endpoint = this._api.endpoint(apiName);
        if (endpoint.length === 0) {
            return Promise.reject('Api ' + apiName + ' does not exist');
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
    async patch(apiName, path, init) {
        if (!this._api) {
            try {
                await this.createInstance();
            } catch (error) {
                return Promise.reject(error);
            }
        }

        const credentialsOK = await this._ensureCredentials();
        if (!credentialsOK) { return Promise.reject('No credentials'); }

        const endpoint = this._api.endpoint(apiName);
        if (endpoint.length === 0) {
            return Promise.reject('Api ' + apiName + ' does not exist');
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
    async del(apiName, path, init) {
        if (!this._api) {
            try {
                await this.createInstance();
            } catch (error) {
                return Promise.reject(error);
            }
        }

        const credentialsOK = await this._ensureCredentials();
        if (!credentialsOK) { return Promise.reject('No credentials'); }

        const endpoint = this._api.endpoint(apiName);
        if (endpoint.length === 0) {
            return Promise.reject('Api ' + apiName + ' does not exist');
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
    async head(apiName, path, init) {
        if (!this._api) {
            try {
                await this.createInstance();
            } catch (error) {
                return Promise.reject(error);
            }
        }

        const credentialsOK = await this._ensureCredentials();
        if (!credentialsOK) { return Promise.reject('No credentials'); }

        const endpoint = this._api.endpoint(apiName);
        if (endpoint.length === 0) {
            return Promise.reject('Api ' + apiName + ' does not exist');
        }
        return this._api.head(endpoint + path, init);
    }

    /**
    * Getting endpoint for API
    * @param {string} apiName - The name of the api
    * @return {string} - The endpoint of the api
    */
    async endpoint(apiName) {
        if (!this._api) {
            try {
                await this.createInstance();
            } catch (error) {
                return Promise.reject(error);
            }
        }
        return this._api.endpoint(apiName);
    }

    private async _headerBasedAuth() {
        const {
            aws_appsync_authenticationType: authenticationType,
            aws_appsync_apiKey: apiKey,
        } = this._options;
        let headers = {};

        const credentialsOK = await this._ensureCredentials();

        switch (authenticationType) {
            case 'NONE':
                headers = {
                    Authorization: null,
                };
                break;
            case 'API_KEY':
                headers = {
                    Authorization: null,
                    'X-Api-Key': apiKey
                };
                break;
            case 'AWS_IAM':
                if (!credentialsOK) { throw new Error('No credentials'); }
                break;
            case 'AMAZON_COGNITO_USER_POOLS':
                const session = await Auth.currentSession();

                headers = {
                    Authorization: session.getAccessToken().getJwtToken()
                };
                break;
        }

        return headers;
    }

    /**
     * Executes a GraphQL operation
     *
     * @param {GraphQLOptions} GraphQL Options
     * @returns {Promise<GraphQLResult> | Observable<object>}
     */
    graphql({ query, variables = {} }: GraphQLOptions) {

        const doc = parse(query);

        const [operationDef = {},] = doc.definitions.filter(def => def.kind === 'OperationDefinition');
        const { operation: operationType } = operationDef as OperationDefinitionNode;

        switch (operationType) {
            case 'query':
            case 'mutation':
                return this._graphql({ query, variables });
            case 'subscription':
                return this._graphqlSubscribe({ query, variables });
        }

        throw new Error(`invalid operation type: ${operationType}`);
    }

    private async _graphql({ query: queryStr, variables }: GraphQLOptions): Promise<GraphQLResult> {
        if (!this._api) {
            await this.createInstance();
        }

        const {
            aws_appsync_region: region,
            aws_appsync_graphqlEndpoint: graphqlEndpoint
        } = this._options;

        const headers = await this._headerBasedAuth();

        const doc = parse(queryStr);
        const query = print(doc);

        const body = {
            query,
            variables,
        };

        const init = {
            headers,
            body,
            signerServiceInfo: {
                service: 'appsync',
                region,
            }
        };

        const response = await this._api.post(graphqlEndpoint, init);

        const { errors } = response;

        if (errors && errors.length) {
            const error = new Error(errors.map(err => `${err.errorType}: ${err.message}`).join('\n'));
            (<any>error).errors = errors;

            throw error;
        }

        return response;
    }

    private _graphqlSubscribe({ query, variables }: GraphQLOptions): Observable<object> {
        return new Observable(observer => {

            let handle = null;

            (async () => {
                const {
                    extensions: { subscription }
                } = await this._graphql({ query, variables });

                const { newSubscriptions } = subscription;

                const newTopics = Object.getOwnPropertyNames(newSubscriptions).map(p => newSubscriptions[p].topic);

                const observable = PubSub.subscribe(newTopics, subscription);

                handle = observable.subscribe(observer);
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
        return Auth.currentCredentials()
            .then(credentials => {
                if (!credentials) return false;
                const cred = Auth.essentialCredentials(credentials);
                logger.debug('set credentials for api', cred);

                return credentials;
            })
            .catch(err => {
                logger.warn('ensure credentials error', err);
                return false;
            });
    }
}
