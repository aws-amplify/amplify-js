"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
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
var graphql_1 = require("graphql");
var printer_1 = require("graphql/language/printer");
var parser_1 = require("graphql/language/parser");
var Observable = require("zen-observable");
var PubSub_1 = require("../PubSub");
var RestClient_1 = require("./RestClient");
var Auth_1 = require("../Auth");
var Logger_1 = require("../Common/Logger");
var Cache_1 = require("../Cache");
var logger = new Logger_1.ConsoleLogger('API');
exports.graphqlOperation = function (query, variables) {
    if (variables === void 0) { variables = {}; }
    return ({ query: query, variables: variables });
};
/**
 * Export Cloud Logic APIs
 */
var APIClass = /** @class */ (function () {
    /**
     * Initialize Storage with AWS configurations
     * @param {Object} options - Configuration object for storage
     */
    function APIClass(options) {
        this._api = null;
        this._options = options;
        logger.debug('API Options', this._options);
    }
    /**
     * Configure API part with aws configurations
     * @param {Object} config - Configuration of the API
     * @return {Object} - The current configuration
     */
    APIClass.prototype.configure = function (options) {
        var opt = options ? options.API || options : {};
        logger.debug('configure API', { opt: opt });
        if (opt['aws_project_region']) {
            if (opt['aws_cloud_logic_custom']) {
                var custom = opt['aws_cloud_logic_custom'];
                opt.endpoints = (typeof custom === 'string') ? JSON.parse(custom)
                    : custom;
            }
            opt = Object.assign({}, opt, {
                region: opt['aws_project_region'],
                header: {},
            });
        }
        if (typeof opt.graphql_headers !== 'undefined' && typeof opt.graphql_headers !== 'function') {
            logger.warn('graphql_headers should be a function');
            opt.graphql_headers = undefined;
        }
        this._options = Object.assign({}, this._options, opt);
        this.createInstance();
        return this._options;
    };
    /**
     * Create an instance of API for the library
     * @return - A promise of true if Success
     */
    APIClass.prototype.createInstance = function () {
        logger.debug('create API instance');
        if (this._options) {
            this._api = new RestClient_1.RestClient(this._options);
            return true;
        }
        else {
            return Promise.reject('API no configured');
        }
    };
    /**
     * Make a GET request
     * @param {string} apiName  - The api name of the request
     * @param {string} path - The path of the request
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    APIClass.prototype.get = function (apiName, path, init) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1, credentialsOK, endpoint;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this._api) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.createInstance()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        return [2 /*return*/, Promise.reject(error_1)];
                    case 4: return [4 /*yield*/, this._ensureCredentials()];
                    case 5:
                        credentialsOK = _a.sent();
                        if (!credentialsOK) {
                            return [2 /*return*/, Promise.reject('No credentials')];
                        }
                        endpoint = this._api.endpoint(apiName);
                        if (endpoint.length === 0) {
                            return [2 /*return*/, Promise.reject('Api ' + apiName + ' does not exist')];
                        }
                        return [2 /*return*/, this._api.get(endpoint + path, init)];
                }
            });
        });
    };
    /**
     * Make a POST request
     * @param {string} apiName  - The api name of the request
     * @param {string} path - The path of the request
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    APIClass.prototype.post = function (apiName, path, init) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2, credentialsOK, endpoint;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this._api) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.createInstance()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        return [2 /*return*/, Promise.reject(error_2)];
                    case 4: return [4 /*yield*/, this._ensureCredentials()];
                    case 5:
                        credentialsOK = _a.sent();
                        if (!credentialsOK) {
                            return [2 /*return*/, Promise.reject('No credentials')];
                        }
                        endpoint = this._api.endpoint(apiName);
                        if (endpoint.length === 0) {
                            return [2 /*return*/, Promise.reject('Api ' + apiName + ' does not exist')];
                        }
                        return [2 /*return*/, this._api.post(endpoint + path, init)];
                }
            });
        });
    };
    /**
     * Make a PUT request
     * @param {string} apiName  - The api name of the request
     * @param {string} path - The path of the request
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    APIClass.prototype.put = function (apiName, path, init) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3, credentialsOK, endpoint;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this._api) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.createInstance()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        return [2 /*return*/, Promise.reject(error_3)];
                    case 4: return [4 /*yield*/, this._ensureCredentials()];
                    case 5:
                        credentialsOK = _a.sent();
                        if (!credentialsOK) {
                            return [2 /*return*/, Promise.reject('No credentials')];
                        }
                        endpoint = this._api.endpoint(apiName);
                        if (endpoint.length === 0) {
                            return [2 /*return*/, Promise.reject('Api ' + apiName + ' does not exist')];
                        }
                        return [2 /*return*/, this._api.put(endpoint + path, init)];
                }
            });
        });
    };
    /**
     * Make a PATCH request
     * @param {string} apiName  - The api name of the request
     * @param {string} path - The path of the request
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    APIClass.prototype.patch = function (apiName, path, init) {
        return __awaiter(this, void 0, void 0, function () {
            var error_4, credentialsOK, endpoint;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this._api) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.createInstance()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        return [2 /*return*/, Promise.reject(error_4)];
                    case 4: return [4 /*yield*/, this._ensureCredentials()];
                    case 5:
                        credentialsOK = _a.sent();
                        if (!credentialsOK) {
                            return [2 /*return*/, Promise.reject('No credentials')];
                        }
                        endpoint = this._api.endpoint(apiName);
                        if (endpoint.length === 0) {
                            return [2 /*return*/, Promise.reject('Api ' + apiName + ' does not exist')];
                        }
                        return [2 /*return*/, this._api.patch(endpoint + path, init)];
                }
            });
        });
    };
    /**
     * Make a DEL request
     * @param {string} apiName  - The api name of the request
     * @param {string} path - The path of the request
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    APIClass.prototype.del = function (apiName, path, init) {
        return __awaiter(this, void 0, void 0, function () {
            var error_5, credentialsOK, endpoint;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this._api) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.createInstance()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        return [2 /*return*/, Promise.reject(error_5)];
                    case 4: return [4 /*yield*/, this._ensureCredentials()];
                    case 5:
                        credentialsOK = _a.sent();
                        if (!credentialsOK) {
                            return [2 /*return*/, Promise.reject('No credentials')];
                        }
                        endpoint = this._api.endpoint(apiName);
                        if (endpoint.length === 0) {
                            return [2 /*return*/, Promise.reject('Api ' + apiName + ' does not exist')];
                        }
                        return [2 /*return*/, this._api.del(endpoint + path, init)];
                }
            });
        });
    };
    /**
     * Make a HEAD request
     * @param {string} apiName  - The api name of the request
     * @param {string} path - The path of the request
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    APIClass.prototype.head = function (apiName, path, init) {
        return __awaiter(this, void 0, void 0, function () {
            var error_6, credentialsOK, endpoint;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this._api) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.createInstance()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _a.sent();
                        return [2 /*return*/, Promise.reject(error_6)];
                    case 4: return [4 /*yield*/, this._ensureCredentials()];
                    case 5:
                        credentialsOK = _a.sent();
                        if (!credentialsOK) {
                            return [2 /*return*/, Promise.reject('No credentials')];
                        }
                        endpoint = this._api.endpoint(apiName);
                        if (endpoint.length === 0) {
                            return [2 /*return*/, Promise.reject('Api ' + apiName + ' does not exist')];
                        }
                        return [2 /*return*/, this._api.head(endpoint + path, init)];
                }
            });
        });
    };
    /**
    * Getting endpoint for API
    * @param {string} apiName - The name of the api
    * @return {string} - The endpoint of the api
    */
    APIClass.prototype.endpoint = function (apiName) {
        return __awaiter(this, void 0, void 0, function () {
            var error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this._api) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.createInstance()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_7 = _a.sent();
                        return [2 /*return*/, Promise.reject(error_7)];
                    case 4: return [2 /*return*/, this._api.endpoint(apiName)];
                }
            });
        });
    };
    APIClass.prototype._headerBasedAuth = function (defaultAuthenticationType) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, authenticationType, apiKey, headers, credentialsOK, _c, federatedInfo, session;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = this._options, _b = _a.aws_appsync_authenticationType, authenticationType = _b === void 0 ? defaultAuthenticationType : _b, apiKey = _a.aws_appsync_apiKey;
                        headers = {};
                        return [4 /*yield*/, this._ensureCredentials()];
                    case 1:
                        credentialsOK = _d.sent();
                        _c = authenticationType;
                        switch (_c) {
                            case 'API_KEY': return [3 /*break*/, 2];
                            case 'AWS_IAM': return [3 /*break*/, 3];
                            case 'OPENID_CONNECT': return [3 /*break*/, 4];
                            case 'AMAZON_COGNITO_USER_POOLS': return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 8];
                    case 2:
                        headers = {
                            Authorization: null,
                            'X-Api-Key': apiKey
                        };
                        return [3 /*break*/, 9];
                    case 3:
                        if (!credentialsOK) {
                            throw new Error('No credentials');
                        }
                        return [3 /*break*/, 9];
                    case 4: return [4 /*yield*/, Cache_1.default.getItem('federatedInfo')];
                    case 5:
                        federatedInfo = _d.sent();
                        if (!federatedInfo || !federatedInfo.token) {
                            throw new Error('No federated jwt');
                        }
                        headers = {
                            Authorization: federatedInfo.token
                        };
                        return [3 /*break*/, 9];
                    case 6: return [4 /*yield*/, Auth_1.default.currentSession()];
                    case 7:
                        session = _d.sent();
                        headers = {
                            Authorization: session.getAccessToken().getJwtToken()
                        };
                        return [3 /*break*/, 9];
                    case 8:
                        headers = {
                            Authorization: null,
                        };
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/, headers];
                }
            });
        });
    };
    /**
     * Executes a GraphQL operation
     *
     * @param {GraphQLOptions} GraphQL Options
     * @returns {Promise<GraphQLResult> | Observable<object>}
     */
    APIClass.prototype.graphql = function (_a) {
        var query = _a.query, _b = _a.variables, variables = _b === void 0 ? {} : _b;
        var doc = parser_1.parse(query);
        var _c = doc.definitions.filter(function (def) { return def.kind === 'OperationDefinition'; })[0], operationDef = _c === void 0 ? {} : _c;
        var operationType = operationDef.operation;
        switch (operationType) {
            case 'query':
            case 'mutation':
                return this._graphql({ query: query, variables: variables });
            case 'subscription':
                return this._graphqlSubscribe({ query: query, variables: variables });
        }
        throw new Error("invalid operation type: " + operationType);
    };
    APIClass.prototype._graphql = function (_a) {
        var queryStr = _a.query, variables = _a.variables;
        return __awaiter(this, void 0, void 0, function () {
            var _b, region, appSyncGraphqlEndpoint, _c, graphql_headers, customGraphqlEndpoint, customEndpointRegion, doc, query, headers, _d, _e, _f, _g, body, init, endpoint, error, response, err_1, errors;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        if (!!this._api) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.createInstance()];
                    case 1:
                        _h.sent();
                        _h.label = 2;
                    case 2:
                        _b = this._options, region = _b.aws_appsync_region, appSyncGraphqlEndpoint = _b.aws_appsync_graphqlEndpoint, _c = _b.graphql_headers, graphql_headers = _c === void 0 ? function () { return ({}); } : _c, customGraphqlEndpoint = _b.graphql_endpoint, customEndpointRegion = _b.graphql_endpoint_iam_region;
                        doc = parser_1.parse(queryStr);
                        query = printer_1.print(doc);
                        _d = [{}];
                        _e = !customGraphqlEndpoint;
                        if (!_e) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._headerBasedAuth()];
                    case 3:
                        _e = (_h.sent());
                        _h.label = 4;
                    case 4:
                        _d = _d.concat([(_e)]);
                        _f = customGraphqlEndpoint;
                        if (!_f) return [3 /*break*/, 8];
                        if (!customEndpointRegion) return [3 /*break*/, 6];
                        return [4 /*yield*/, this._headerBasedAuth('AWS_IAM')];
                    case 5:
                        _g = _h.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        _g = { Authorization: null };
                        _h.label = 7;
                    case 7:
                        _f = (_g);
                        _h.label = 8;
                    case 8:
                        _d = _d.concat([(_f)]);
                        return [4 /*yield*/, graphql_headers({ query: doc, variables: variables })];
                    case 9:
                        headers = __assign.apply(void 0, _d.concat([_h.sent()]));
                        body = {
                            query: query,
                            variables: variables,
                        };
                        init = {
                            headers: headers,
                            body: body,
                            signerServiceInfo: {
                                service: !customGraphqlEndpoint ? 'appsync' : 'execute-api',
                                region: !customGraphqlEndpoint ? region : customEndpointRegion
                            }
                        };
                        endpoint = customGraphqlEndpoint || appSyncGraphqlEndpoint;
                        if (!endpoint) {
                            error = new graphql_1.GraphQLError('No graphql endpoint provided.');
                            throw {
                                data: {},
                                errors: [error],
                            };
                        }
                        _h.label = 10;
                    case 10:
                        _h.trys.push([10, 12, , 13]);
                        return [4 /*yield*/, this._api.post(endpoint, init)];
                    case 11:
                        response = _h.sent();
                        return [3 /*break*/, 13];
                    case 12:
                        err_1 = _h.sent();
                        response = {
                            data: {},
                            errors: [
                                new graphql_1.GraphQLError(err_1.message)
                            ]
                        };
                        return [3 /*break*/, 13];
                    case 13:
                        errors = response.errors;
                        if (errors && errors.length) {
                            throw response;
                        }
                        return [2 /*return*/, response];
                }
            });
        });
    };
    APIClass.prototype._graphqlSubscribe = function (_a) {
        var _this = this;
        var query = _a.query, variables = _a.variables;
        return new Observable(function (observer) {
            var handle = null;
            (function () { return __awaiter(_this, void 0, void 0, function () {
                var subscription, newSubscriptions, newTopics, observable;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._graphql({ query: query, variables: variables })];
                        case 1:
                            subscription = (_a.sent()).extensions.subscription;
                            newSubscriptions = subscription.newSubscriptions;
                            newTopics = Object.getOwnPropertyNames(newSubscriptions).map(function (p) { return newSubscriptions[p].topic; });
                            observable = PubSub_1.default.subscribe(newTopics, subscription);
                            handle = observable.subscribe(observer);
                            return [2 /*return*/];
                    }
                });
            }); })();
            return function () {
                if (handle) {
                    handle.unsubscribe();
                }
            };
        });
    };
    /**
     * @private
     */
    APIClass.prototype._ensureCredentials = function () {
        return Auth_1.default.currentCredentials()
            .then(function (credentials) {
            if (!credentials)
                return false;
            var cred = Auth_1.default.essentialCredentials(credentials);
            logger.debug('set credentials for api', cred);
            return credentials;
        })
            .catch(function (err) {
            logger.warn('ensure credentials error', err);
            return false;
        });
    };
    return APIClass;
}());
exports.default = APIClass;
//# sourceMappingURL=API.js.map