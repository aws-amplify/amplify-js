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
        ;
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
exports.default = API;
//# sourceMappingURL=index.js.map