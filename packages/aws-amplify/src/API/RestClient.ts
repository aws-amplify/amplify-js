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

import Signer from '../Common/Signer';
import { ConsoleLogger as Logger } from '../Common';

import Auth from '../Auth';
import { RestClientOptions, AWSCredentials, apiOptions } from './types';
import axios from 'axios';
const logger = new Logger('RestClient');

/**
* HTTP Client for REST requests. Send and receive JSON data.
* Sign request with AWS credentials if available
* Usage:
<pre>
const restClient = new RestClient();
restClient.get('...')
    .then(function(data) {
        console.log(data);
    })
    .catch(err => console.log(err));
</pre>
*/
export class RestClient {
    private _options;

    /**
    * @param {RestClientOptions} [options] - Instance options
    */
    constructor(options: apiOptions) {
        const { endpoints } = options;
        this._options = options;
        logger.debug('API Options', this._options);
    }

    /**
    * Update AWS credentials
    * @param {AWSCredentials} credentials - AWS credentials
    *
    updateCredentials(credentials: AWSCredentials) {
        this.options.credentials = credentials;
    }
*/
    /**
    * Basic HTTP request. Customizable
    * @param {string} url - Full request URL
    * @param {string} method - Request HTTP method
    * @param {json} [init] - Request extra params
    * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
    */
    async ajax(url: string, method: string, init) {
        logger.debug(method + ' ' + url);

        const parsed_url = this._parseUrl(url);

        const params = {
            method,
            url,
            host: parsed_url.host,
            path: parsed_url.path,
            headers: {},
            data: null
        };

        const libraryHeaders = {
            'User-Agent': 'aws-amplify/0.1.x'
        };

        const extraParams = Object.assign({}, init);

        if (extraParams.body) {
            libraryHeaders['content-type'] = 'application/json; charset=UTF-8';
            params.data = JSON.stringify(extraParams.body);
        }

        params.headers = { ...libraryHeaders, ...extraParams.headers };

        // Do not sign the request if client has added 'Authorization' header,
        // which means custom authorizer.
        if (params.headers['Authorization']) { return this._request(params); }

        return Auth.currentCredentials()
            .then(credentials => this._signed(params, credentials));
    }

    /**
    * GET HTTP request
    * @param {string} url - Full request URL
    * @param {JSON} init - Request extra params
    * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
    */
    get(url: string, init) {
        return this.ajax(url, 'GET', init);
    }

    /**
    * PUT HTTP request
    * @param {String} url - Full request URL
    * @param {JSON} init - Request extra params
    * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
    */
    put(url: string, init) {
        return this.ajax(url, 'PUT', init);
    }

    /**
    * POST HTTP request
    * @param {String} url - Full request URL
    * @param {JSON} init - Request extra params
    * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
    */
    post(url: string, init) {
        return this.ajax(url, 'POST', init);
    }

    /**
    * DELETE HTTP request
    * @param {string} url - Full request URL
    * @param {JSON} init - Request extra params
    * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
    */
    del(url: string, init) {
        return this.ajax(url, 'DELETE', init);
    }

    /**
    * HEAD HTTP request
    * @param {string} url - Full request URL
    * @param {JSON} init - Request extra params
    * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
    */
    head(url: string, init) {
        return this.ajax(url, 'HEAD', init);
    }

    /**
    * Getting endpoint for API
    * @param {string} apiName - The name of the api
    * @return {string} - The endpoint of the api
    */
    endpoint(apiName: string) {
        const cloud_logic_array = this._options.endpoints;
        let response = '';
        cloud_logic_array.forEach((v) => {
            if (v.name === apiName) {
                response = v.endpoint;
            }
        });
        return response;
    }

    /** private methods **/

    private _signed(params, credentials) {

        const signed_params = Signer.sign(params, {
            secret_key: credentials.secretAccessKey,
            access_key: credentials.accessKeyId,
            session_token: credentials.sessionToken
        });
        if (signed_params.data) {
            signed_params.body = signed_params.data;
        }

        logger.debug(signed_params);

        delete signed_params.headers['host'];

        return axios(signed_params)
            .then(response => response.data)
            .catch((error) => {
                logger.debug(error);
                throw error;
            });
    }

    private _request(params) {
        return axios(params)
            .then(response => response.data)
            .catch((error) => {
                logger.debug(error);
                throw error;
            });
    }

    private _parseUrl(url) {
        const parts = url.split('/');

        return {
            host: parts[2],
            path: '/' + parts.slice(3).join('/')
        };
    }
}
