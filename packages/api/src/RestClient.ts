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

import { ConsoleLogger as Logger, Signer, Platform, Credentials } from '@aws-amplify/core';

import {  RestClientOptions, RestRequestExtraParams, RestRequestExtraParamsWithResponse } from './types';
import axios, { AxiosRequestConfig, Method, ResponseType, AxiosResponse } from 'axios';

const logger = new Logger('RestClient'),
    urlLib = require('url');

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
    private _region: string = 'us-east-1'; // this will be updated by endpoint function
    private _service: string = 'execute-api'; // this can be updated by endpoint function
    private _custom_header = undefined; // this can be updated by endpoint function
    /**
    * @param {RestClientOptions} [options] - Instance options
    */
    constructor(options: RestClientOptions) {
        const { endpoints } = options;
        this._options = options;
        logger.debug('API Options', this._options);

        // const res = this.ajax<{a:number}>("", "get", {});
        // const res2 = this.ajax("", "get", {response:true});
        // const res3 = this.get("", {response:true});
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
    ajax<Output = {}>(
        url: string,
        method: Method,
        init?: RestRequestExtraParams & { response?: undefined }
    ): Promise<AxiosResponse<Output>["data"]>;
    ajax<Output = {}>(
        url: string,
        method: Method,
        init?: RestRequestExtraParamsWithResponse
    ): Promise<AxiosResponse<Output>>;
    async ajax(
        url: string,
        method: Method,
        init?: RestRequestExtraParams
    ) {

        logger.debug(method + ' ' + url);

        const parsed_url = this._parseUrl(url);

        const params = {
            method,
            url,
            host: parsed_url.host,
            path: parsed_url.path,
            headers: {},
            data: null,
            responseType: 'json' as ResponseType,
            timeout: 0
        };

        let libraryHeaders = {};

        if (Platform.isReactNative) {
            const userAgent = Platform.userAgent || 'aws-amplify/0.1.x';
            libraryHeaders = {
                'User-Agent': userAgent
            };
        }

        const initParams = Object.assign({}, init);
        const isAllResponse = initParams.response;
        if (initParams.body) {
            libraryHeaders['Content-Type'] = 'application/json; charset=UTF-8';
            params.data = JSON.stringify(initParams.body);
        }
        if (initParams.responseType) {
            params.responseType = initParams.responseType;
        }
        if (initParams.timeout) {
            params.timeout = initParams.timeout;
        }
        params['signerServiceInfo'] = initParams.signerServiceInfo;

        // custom_header callback
        const custom_header = this._custom_header ? await this._custom_header() : undefined;
        
        params.headers = { ...libraryHeaders, ...(custom_header),...initParams.headers };

        // Intentionally discarding search
        const { search, ...parsedUrl } = urlLib.parse(url, true, true);
        params.url = urlLib.format({
            ...parsedUrl,
            query: {
                ...parsedUrl.query,
                ...(initParams.queryStringParameters || {})
            }
        });

        // Do not sign the request if client has added 'Authorization' header,
        // which means custom authorizer.
        if (typeof params.headers['Authorization'] !== 'undefined') {
            params.headers = Object.keys(params.headers).reduce((acc, k) => {
                if (params.headers[k]) {
                    acc[k] = params.headers[k];
                }
                return acc;
                // tslint:disable-next-line:align
            }, {});
            return this._request(params, isAllResponse);

        }
        
        // Signing the request in case there credentials are available

        return (Credentials.get() as Promise<any>)
        .then(
            credentials => this._signed({ ...params }, credentials, isAllResponse),
            err => {
                logger.debug('No credentials available, the request will be unsigned');
                return this._request(params, isAllResponse);
            }
        );
    }

    /**
    * GET HTTP request
    * @param {string} url - Full request URL
    * @param {JSON} init - Request extra params
    * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
    */
    get<Output = {}>(
        url: string,
        init?: RestRequestExtraParams & { response?: undefined }
    ): Promise<AxiosResponse<Output>["data"]>;
    get<Output = {}>(
        url: string,
        init?: RestRequestExtraParamsWithResponse
    ): Promise<AxiosResponse<Output>>;
    get(url: string, init?: RestRequestExtraParams) {
        return this.ajax(url, 'GET', init);
    }

    /**
    * PUT HTTP request
    * @param {string} url - Full request URL
    * @param {json} init - Request extra params
    * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
    */
    put<Output = {}>(
        url: string,
        init?: RestRequestExtraParams & { response?: undefined }
    ): Promise<AxiosResponse<Output>["data"]>;
    put<Output = {}>(
        url: string,
        init?: RestRequestExtraParamsWithResponse
    ): Promise<AxiosResponse<Output>>;
    put(url: string, init?: RestRequestExtraParamsWithResponse) {
        return this.ajax(url, 'PUT', init);
    }

    /**
    * PATCH HTTP request
    * @param {string} url - Full request URL
    * @param {json} init - Request extra params
    * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
    */
   patch<Output = {}>(
        url: string,
        init?: RestRequestExtraParams & { response?: undefined }
    ): Promise<AxiosResponse<Output>["data"]>;
    patch<Output = {}>(
        url: string,
        init?: RestRequestExtraParamsWithResponse
    ): Promise<AxiosResponse<Output>>;
    patch(url: string, init?: RestRequestExtraParamsWithResponse) {
        return this.ajax(url, 'PATCH', init);
    }

    /**
    * POST HTTP request
    * @param {string} url - Full request URL
    * @param {json} init - Request extra params
    * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
    */
    post<Output = {}>(
        url: string,
        init?: RestRequestExtraParams & { response?: undefined }
    ): Promise<AxiosResponse<Output>["data"]>;
    post<Output = {}>(
        url: string,
        init?: RestRequestExtraParamsWithResponse
    ): Promise<AxiosResponse<Output>>;
    post(url: string, init?: RestRequestExtraParams) {
        return this.ajax(url, 'POST', init);
    }

    /**
    * DELETE HTTP request
    * @param {string} url - Full request URL
    * @param {json} init - Request extra params
    * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
    */
    del<Output = {}>(
        url: string,
        init?: RestRequestExtraParams & { response?: undefined }
    ): Promise<AxiosResponse<Output>["data"]>;
    del<Output = {}>(
        url: string,
        init?: RestRequestExtraParamsWithResponse
    ): Promise<AxiosResponse<Output>>;
    del(url: string, init?: RestRequestExtraParams) {
        return this.ajax(url, 'DELETE', init);
    }

    /**
    * HEAD HTTP request
    * @param {string} url - Full request URL
    * @param {json} init - Request extra params
    * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
    */
    head<Output = {}>(
        url: string,
        init?: RestRequestExtraParams & { response?: undefined }
    ): Promise<AxiosResponse<Output>["data"]>;
    head<Output = {}>(
        url: string,
        init?: RestRequestExtraParamsWithResponse
    ): Promise<AxiosResponse<Output>>;
    head(url: string, init?: RestRequestExtraParams) {
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
        
        if(!Array.isArray(cloud_logic_array)) {
            return response;
        }

        cloud_logic_array.forEach((v) => {
            if (v.name === apiName) {
                response = v.endpoint;
                if (typeof v.region === 'string') {
                    this._region = v.region;
                } else if (typeof this._options.region === 'string') {
                    this._region = this._options.region;
                }
                if (typeof v.service === 'string') {
                    this._service = v.service || 'execute-api';
                } else {
                    this._service = 'execute-api';
                }
                if (typeof v.custom_header === 'function') {
                    this._custom_header = v.custom_header;
                } else {
                    this._custom_header = undefined;
                }
            }
        });
        return response;
    }

    /** private methods **/
    private _signed<Output = {}, B extends boolean = true>(
        params,
        credentials,
        isAllResponse: B
      ): Promise<
        B extends true ? AxiosResponse<Output> : AxiosResponse<Output>["data"]
      > {
        const { signerServiceInfo: signerServiceInfoParams, ...otherParams } = params;

        const endpoint_region: string = this._region || this._options.region;
        const endpoint_service: string = this._service || this._options.service;

        const creds = {
            secret_key: credentials.secretAccessKey,
            access_key: credentials.accessKeyId,
            session_token: credentials.sessionToken,
        };

        const endpointInfo = {
            region: endpoint_region,
            service: endpoint_service,
        };

        const signerServiceInfo = Object.assign(endpointInfo, signerServiceInfoParams);

        const signed_params:AxiosRequestConfig = Signer.sign(otherParams, creds, signerServiceInfo);

        if (signed_params.data) {
            // Property body is not defined in AxiosRequestConfig and all tests pass if we remove it , do we need this ?
            signed_params["body"] = signed_params.data;
        }

        logger.debug('Signed Request: ', signed_params);

        delete signed_params.headers['host'];
        return axios(signed_params)
        .then(response => {
            // response
            return isAllResponse ? response : response.data;
        })
        .catch((error) => {
            logger.debug(error);
            throw error;
        });
    }
    private _request<Output = {}, B extends boolean = true>(
        params: AxiosRequestConfig,
        isAllResponse: B
      ): Promise<
        B extends true ? AxiosResponse<Output> : AxiosResponse<Output>["data"]
      > {          
        return axios(params)
            .then(response => isAllResponse ? response : response.data)
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
