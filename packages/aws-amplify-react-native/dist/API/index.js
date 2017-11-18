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

let _config = null;
let _api = null;

/**
 * Export Cloud Logic APIs
 */
export default class API {
    /**
     * Configure API part with aws configurations
     * @param {Object} config - Configuration of the API
     * @return {Object} - The current configuration
     */
    static configure(config) {
        logger.debug('configure API');
        let conf = config ? config.API || config : {};

        if (conf['aws_project_region']) {
            if (conf['aws_cloud_logic_custom']) {
                const custom = conf['aws_cloud_logic_custom'];
                conf.endpoints = typeof custom === 'string' ? JSON.parse(custom) : custom;
            }
            conf = Object.assign({}, conf, {
                region: conf['aws_project_region'],
                header: {}
            });
        };
        _config = Object.assign({}, _config, conf);

        API.createInstance();

        return _config;
    }

    /**
     * Create an instance of API for the library
     * @return - A promise of true if Success
     */
    static createInstance() {
        logger.debug('create API instance');
        if (_config) {
            _api = new RestClass(_config);
            return true;
        } else {
            return Promise.reject('API no configured');
        }
    }

    /**
     * Make a GET request
     * @param {String} apiName  - The api name of the request
     * @param {JSON} path - The path of the request'
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    static async get(apiName, path, init) {
        if (!_api) {
            try {
                await this.createInstance();
            } catch (error) {
                Promise.reject(error);
            }
        }
        const endpoint = _api.endpoint(apiName);
        if (endpoint.length === 0) {
            return Promise.reject('Api ' + apiName + ' does not exist');
        }
        return _api.get(endpoint + path, init);
    }

    /**
     * Make a POST request
     * @param {String} apiName  - The api name of the request
     * @param {String} path - The path of the request
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    static async post(apiName, path, init) {
        if (!_api) {
            try {
                await this.createInstance();
            } catch (error) {
                Promise.reject(error);
            }
        }
        const endpoint = _api.endpoint(apiName);
        if (endpoint.length === 0) {
            return Promise.reject('Api ' + apiName + ' does not exist');
        }
        return _api.post(endpoint + path, init);
    }

    /**
     * Make a PUT request
     * @param {String} apiName  - The api name of the request
     * @param {String} path - The path of the request
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    static async put(apiName, path, init) {
        if (!_api) {
            try {
                await this.createInstance();
            } catch (error) {
                Promise.reject(error);
            }
        }
        const endpoint = _api.endpoint(apiName);
        if (endpoint.length === 0) {
            return Promise.reject('Api ' + apiName + ' does not exist');
        }
        return _api.put(endpoint + path, init);
    }

    /**
     * Make a DEL request
     * @param {String} apiName  - The api name of the request
     * @param {String} path - The path of the request
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    static async del(apiName, path, init) {
        if (!_api) {
            try {
                await this.createInstance();
            } catch (error) {
                Promise.reject(error);
            }
        }
        const endpoint = _api.endpoint(apiName);
        if (endpoint.length === 0) {
            return Promise.reject('Api ' + apiName + ' does not exist');
        }
        return _api.del(endpoint + path), init;
    }

    /**
     * Make a HEAD request
     * @param {String} apiName  - The api name of the request
     * @param {String} path - The path of the request
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    static async head(apiName, path, init) {
        if (!_api) {
            try {
                await this.createInstance();
            } catch (error) {
                Promise.reject(error);
            }
        }
        const endpoint = _api.endpoint(apiName);
        if (endpoint.length === 0) {
            return Promise.reject('Api ' + apiName + ' does not exist');
        }
        return _api.head(endpoint + path, init);
    }

    /**
    * Getting endpoint for API
    * @param {String} apiName - The name of the api
    * @return {String} - The endpoint of the api
    */
    static async endpoint(apiName) {
        if (!_api) {
            try {
                await this.createInstance();
            } catch (error) {
                Promise.reject(error);
            }
        }
        return _api.endpoint(apiName);
    }
}