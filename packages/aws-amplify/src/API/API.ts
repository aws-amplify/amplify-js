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

import { RestClient as RestClass } from './RestClient';

import Auth from '../Auth';
import { ConsoleLogger as Logger } from '../Common/Logger';

const logger = new Logger('API');

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
        logger.debug('configure API');
        let opt = options? options.API || options : {};

        if (opt['aws_project_region']) {
            if (opt['aws_cloud_logic_custom']) {
                const custom = opt['aws_cloud_logic_custom'];
                opt.endpoints = (typeof custom === 'string')? JSON.parse(custom)
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
            } catch(error) {
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
            } catch(error) {
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
            } catch(error) {
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
            } catch(error) {
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
            } catch(error) {
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
            } catch(error) {
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
            } catch(error) {
                return Promise.reject(error);
            }
        }
        return this._api.endpoint(apiName);
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

                return true;
            })
            .catch(err => {
                logger.warn('ensure credentials error', err);
                return false;
            });
    }
}
