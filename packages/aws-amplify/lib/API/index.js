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
Object.defineProperty(exports, "__esModule", { value: true });
<<<<<<< HEAD
var API_1 = require("./API");
var Common_1 = require("../Common");
var logger = new Common_1.ConsoleLogger('API');
var _instance = null;
if (!_instance) {
    logger.debug('Create API Instance');
    _instance = new API_1.default(null);
}
var API = _instance;
=======
var RestClient_1 = require("./RestClient");
var Logger_1 = require("../Common/Logger");
var logger = new Logger_1.ConsoleLogger('API');
var _config = null;
var _api = null;
/**
 * Export Cloud Logic APIs
 */
var API = (function () {
    function API() {
    }
    /**
     * Configure API part with aws configurations
     * @param {Object} config - Configuration of the API
     * @return {Object} - The current configuration
     */
    API.configure = function (config) {
        logger.debug('configure API');
        var conf = config ? config.API || config : {};
        if (conf['aws_project_region']) {
            if (conf['aws_cloud_logic_custom']) {
                var custom = conf['aws_cloud_logic_custom'];
                conf.endpoints = (typeof custom === 'string') ? JSON.parse(custom)
                    : custom;
            }
            conf = Object.assign({}, conf, {
                region: conf['aws_project_region'],
                header: {},
            });
        }
        _config = Object.assign({}, _config, conf);
        API.createInstance();
        return _config;
    };
    /**
     * Create an instance of API for the library
     * @return - A promise of true if Success
     */
    API.createInstance = function () {
        logger.debug('create API instance');
        if (_config) {
            _api = new RestClient_1.RestClient(_config);
            return true;
        }
        else {
            return Promise.reject('API no configured');
        }
    };
    /**
     * Make a GET request
     * @param {String} apiName  - The api name of the request
     * @param {JSON} path - The path of the request'
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    API.get = function (apiName, path, init) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1, endpoint;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!_api) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.createInstance()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        Promise.reject(error_1);
                        return [3 /*break*/, 4];
                    case 4:
                        endpoint = _api.endpoint(apiName);
                        if (endpoint.length === 0) {
                            return [2 /*return*/, Promise.reject('Api ' + apiName + ' does not exist')];
                        }
                        return [2 /*return*/, _api.get(endpoint + path, init)];
                }
            });
        });
    };
    /**
     * Make a POST request
     * @param {String} apiName  - The api name of the request
     * @param {String} path - The path of the request
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    API.post = function (apiName, path, init) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2, endpoint;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!_api) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.createInstance()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        Promise.reject(error_2);
                        return [3 /*break*/, 4];
                    case 4:
                        endpoint = _api.endpoint(apiName);
                        if (endpoint.length === 0) {
                            return [2 /*return*/, Promise.reject('Api ' + apiName + ' does not exist')];
                        }
                        return [2 /*return*/, _api.post(endpoint + path, init)];
                }
            });
        });
    };
    /**
     * Make a PUT request
     * @param {String} apiName  - The api name of the request
     * @param {String} path - The path of the request
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    API.put = function (apiName, path, init) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3, endpoint;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!_api) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.createInstance()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        Promise.reject(error_3);
                        return [3 /*break*/, 4];
                    case 4:
                        endpoint = _api.endpoint(apiName);
                        if (endpoint.length === 0) {
                            return [2 /*return*/, Promise.reject('Api ' + apiName + ' does not exist')];
                        }
                        return [2 /*return*/, _api.put(endpoint + path, init)];
                }
            });
        });
    };
    /**
     * Make a DEL request
     * @param {String} apiName  - The api name of the request
     * @param {String} path - The path of the request
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    API.del = function (apiName, path, init) {
        return __awaiter(this, void 0, void 0, function () {
            var error_4, endpoint;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!_api) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.createInstance()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        Promise.reject(error_4);
                        return [3 /*break*/, 4];
                    case 4:
                        endpoint = _api.endpoint(apiName);
                        if (endpoint.length === 0) {
                            return [2 /*return*/, Promise.reject('Api ' + apiName + ' does not exist')];
                        }
                        return [2 /*return*/, (_api.del(endpoint + path), init)];
                }
            });
        });
    };
    /**
     * Make a HEAD request
     * @param {String} apiName  - The api name of the request
     * @param {String} path - The path of the request
     * @param {json} [init] - Request extra params
     * @return {Promise} - A promise that resolves to an object with response status and JSON data, if successful.
     */
    API.head = function (apiName, path, init) {
        return __awaiter(this, void 0, void 0, function () {
            var error_5, endpoint;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!_api) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.createInstance()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        Promise.reject(error_5);
                        return [3 /*break*/, 4];
                    case 4:
                        endpoint = _api.endpoint(apiName);
                        if (endpoint.length === 0) {
                            return [2 /*return*/, Promise.reject('Api ' + apiName + ' does not exist')];
                        }
                        return [2 /*return*/, _api.head(endpoint + path, init)];
                }
            });
        });
    };
    /**
    * Getting endpoint for API
    * @param {String} apiName - The name of the api
    * @return {String} - The endpoint of the api
    */
    API.endpoint = function (apiName) {
        return __awaiter(this, void 0, void 0, function () {
            var error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!_api) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.createInstance()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _a.sent();
                        Promise.reject(error_6);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, _api.endpoint(apiName)];
                }
            });
        });
    };
    return API;
}());
>>>>>>> upstream/master
exports.default = API;
//# sourceMappingURL=index.js.map