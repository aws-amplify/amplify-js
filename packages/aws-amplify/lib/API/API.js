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
var Auth_1 = require("../Auth");
var Logger_1 = require("../Common/Logger");
var logger = new Logger_1.ConsoleLogger('API');
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
        logger.debug('configure API');
        var opt = options ? options.API || options : {};
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
            return true;
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