"use strict";
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
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Signer_1 = require("../Common/Signer");
var Common_1 = require("../Common");
var Auth_1 = require("../Auth");
var axios_1 = require("axios");
var Platform_1 = require("../Common/Platform");
var logger = new Common_1.ConsoleLogger('RestClient');
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
var RestClient = /** @class */ (function () {
    /**
    * @param {RestClientOptions} [options] - Instance options
    */
    function RestClient(options) {
        this._region = 'us-east-1'; // this will be updated by config
        this._service = 'execute-api'; // this can be updated by config
        var endpoints = options.endpoints;
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
    RestClient.prototype.ajax = function (url, method, init) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var parsed_url, params, libraryHeaders, userAgent, extraParams, isAllResponse;
            return __generator(this, function (_a) {
                logger.debug(method + ' ' + url);
                parsed_url = this._parseUrl(url);
                params = {
                    method: method,
                    url: url,
                    host: parsed_url.host,
                    path: parsed_url.path,
                    headers: {},
                    data: null
                };
                libraryHeaders = {};
                if (Platform_1.default.isReactNative) {
                    userAgent = Platform_1.default.userAgent || 'aws-amplify/0.1.x';
                    libraryHeaders = {
                        'User-Agent': userAgent
                    };
                }
                extraParams = Object.assign({}, init);
                isAllResponse = init ? init.response : null;
                if (extraParams.body) {
                    libraryHeaders['content-type'] = 'application/json; charset=UTF-8';
                    params.data = JSON.stringify(extraParams.body);
                }
                params['signerServiceInfo'] = extraParams.signerServiceInfo;
                params.headers = __assign({}, libraryHeaders, extraParams.headers);
                // Do not sign the request if client has added 'Authorization' header,
                // which means custom authorizer.
                if (typeof params.headers['Authorization'] !== 'undefined') {
                    params.headers = Object.keys(params.headers).reduce(function (acc, k) {
                        if (params.headers[k]) {
                            acc[k] = params.headers[k];
                        }
                        return acc;
                        // tslint:disable-next-line:align
                    }, {});
                    return [2 /*return*/, this._request(params)];
                }
                return [2 /*return*/, Auth_1.default.currentCredentials()
                        .then(function (credentials) { return _this._signed(params, credentials, isAllResponse); })];
            });
        });
    };
    /**
    * GET HTTP request
    * @param {string} url - Full request URL
    * @param {JSON} init - Request extra params
    * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
    */
    RestClient.prototype.get = function (url, init) {
        return this.ajax(url, 'GET', init);
    };
    /**
    * PUT HTTP request
    * @param {string} url - Full request URL
    * @param {json} init - Request extra params
    * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
    */
    RestClient.prototype.put = function (url, init) {
        return this.ajax(url, 'PUT', init);
    };
    /**
    * PATCH HTTP request
    * @param {string} url - Full request URL
    * @param {json} init - Request extra params
    * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
    */
    RestClient.prototype.patch = function (url, init) {
        return this.ajax(url, 'PATCH', init);
    };
    /**
    * POST HTTP request
    * @param {string} url - Full request URL
    * @param {json} init - Request extra params
    * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
    */
    RestClient.prototype.post = function (url, init) {
        return this.ajax(url, 'POST', init);
    };
    /**
    * DELETE HTTP request
    * @param {string} url - Full request URL
    * @param {json} init - Request extra params
    * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
    */
    RestClient.prototype.del = function (url, init) {
        return this.ajax(url, 'DELETE', init);
    };
    /**
    * HEAD HTTP request
    * @param {string} url - Full request URL
    * @param {json} init - Request extra params
    * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
    */
    RestClient.prototype.head = function (url, init) {
        return this.ajax(url, 'HEAD', init);
    };
    /**
    * Getting endpoint for API
    * @param {string} apiName - The name of the api
    * @return {string} - The endpoint of the api
    */
    RestClient.prototype.endpoint = function (apiName) {
        var _this = this;
        var cloud_logic_array = this._options.endpoints;
        var response = '';
        cloud_logic_array.forEach(function (v) {
            if (v.name === apiName) {
                response = v.endpoint;
                if (typeof v.region === 'string') {
                    _this._region = v.region;
                }
                else if (typeof _this._options.region === 'string') {
                    _this._region = _this._options.region;
                }
                if (typeof v.service === 'string') {
                    _this._service = v.service || 'execute-api';
                }
            }
        });
        return response;
    };
    /** private methods **/
    RestClient.prototype._signed = function (params, credentials, isAllResponse) {
        var signerServiceInfoParams = params.signerServiceInfo, otherParams = __rest(params, ["signerServiceInfo"]);
        var endpoint_region = this._region || this._options.region;
        var endpoint_service = this._service || this._options.service;
        var creds = {
            secret_key: credentials.secretAccessKey,
            access_key: credentials.accessKeyId,
            session_token: credentials.sessionToken,
        };
        var endpointInfo = {
            region: endpoint_region,
            service: endpoint_service,
        };
        var signerServiceInfo = Object.assign(endpointInfo, signerServiceInfoParams);
        var signed_params = Signer_1.default.sign(otherParams, creds, signerServiceInfo);
        if (signed_params.data) {
            signed_params.body = signed_params.data;
        }
        logger.debug('Signed Request: ', signed_params);
        delete signed_params.headers['host'];
        return axios_1.default(signed_params)
            .then(function (response) { return isAllResponse ? response : response.data; })
            .catch(function (error) {
            logger.debug(error);
            throw error;
        });
    };
    RestClient.prototype._request = function (params, isAllResponse) {
        if (isAllResponse === void 0) { isAllResponse = false; }
        return axios_1.default(params)
            .then(function (response) { return isAllResponse ? response : response.data; })
            .catch(function (error) {
            logger.debug(error);
            throw error;
        });
    };
    RestClient.prototype._parseUrl = function (url) {
        var parts = url.split('/');
        return {
            host: parts[2],
            path: '/' + parts.slice(3).join('/')
        };
    };
    return RestClient;
}());
exports.RestClient = RestClient;
//# sourceMappingURL=RestClient.js.map