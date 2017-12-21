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
var Common_1 = require("../Common");
var Auth_1 = require("../Auth");
var logger = new Common_1.ConsoleLogger('AnalyticsClass');
var ama_logger = new Common_1.ConsoleLogger('AMA');
ama_logger.log = ama_logger.verbose;
/**
* Provide mobile analytics client functions
*/
var AnalyticsClass = /** @class */ (function () {
    /**
     * Initialize Analtyics
     * @param config - Configuration of the Analytics
     */
    function AnalyticsClass(config) {
        this.configure(config);
        var client_info = Common_1.ClientDevice.clientInfo();
        if (client_info.platform) {
            this._config.platform = client_info.platform;
        }
        if (!this._config.endpointId) {
            if (window.localStorage) {
                var endpointId = window.localStorage.getItem('amplify_endpoint_id');
                if (!endpointId) {
                    endpointId = this._generateEndpointId();
                    window.localStorage.setItem('amplify_endpoint_id', endpointId);
                }
                this._config.endpointId = endpointId;
            }
            else {
                this._config.endpointId = this._generateEndpointId();
            }
        }
        this._buffer = [];
    }
    AnalyticsClass.prototype.configure = function (config) {
        logger.debug('configure Analytics');
        var conf = config ? config.Analytics || config : {};
        if (conf['aws_mobile_analytics_app_id']) {
            conf = {
                appId: conf['aws_mobile_analytics_app_id'],
                region: conf['aws_project_region'],
                platform: 'other'
            };
        }
        conf.region = 'us-east-1';
        this._config = Object.assign({}, this._config, conf);
        if (!this._config.appId) {
            logger.debug('Do not have appId yet.');
        }
        this._initClients();
        return this._config;
    };
    /**
     * Record Session start
     */
    AnalyticsClass.prototype.startSession = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.amaClient) {
                    this.amaClient.startSession();
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Record Session stop
     */
    AnalyticsClass.prototype.stopSession = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.amaClient) {
                    this.amaClient.stopSession();
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Restart Analytics client with credentials provided
     * @param {Object} credentials - Cognito Credentials
     */
    AnalyticsClass.prototype.restart = function () {
        try {
            this.stopSession();
            this._initClients();
        }
        catch (e) {
            logger.debug('restart error', e);
        }
    };
    /**
    * Record one analytic event and send it to Pinpoint
    * @param {String} name - The name of the event
    * @param {Object} [attributs] - Attributes of the event
    * @param {Object} [metrics] - Event metrics
    */
    AnalyticsClass.prototype.record = function (name, attributes, metrics) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, endpointId, appId, clientContext, contextStr, params;
            return __generator(this, function (_b) {
                logger.debug('record event ' + name);
                _a = this._config, endpointId = _a.endpointId, appId = _a.appId;
                clientContext = {
                    client: {
                        client_id: endpointId
                    },
                    services: {
                        mobile_analytics: {
                            app_id: appId
                        }
                    }
                };
                contextStr = JSON.stringify(clientContext);
                params = {
                    clientContext: contextStr,
                    events: [
                        {
                            eventType: name,
                            timestamp: new Date().toISOString(),
                            attributes: attributes,
                            metrics: metrics
                        }
                    ]
                };
                this.mobileAnalytics.putEvent(params, function (err, data) {
                    if (err) {
                        logger.debug('record event failed. ' + err);
                    }
                    else {
                        logger.debug('record event success. ' + data);
                    }
                });
                return [2 /*return*/];
            });
        });
    };
    /**
    * Record one analytic event
    * @param {String} name - Event name
    * @param {Object} [attributes] - Attributes of the event
    * @param {Object} [metrics] - Event metrics
    */
    AnalyticsClass.prototype.recordMonetization = function (name, attributes, metrics) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.amaClient.recordMonetizationEvent(name, attributes, metrics);
                return [2 /*return*/];
            });
        });
    };
    AnalyticsClass.prototype._generateEndpointId = function () {
        var result = '';
        var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (var i = 32; i > 0; i -= 1) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
    };
    AnalyticsClass.prototype._checkConfig = function () {
        return !!this._config.appId;
    };
    AnalyticsClass.prototype._ensureCredentials = function () {
        var conf = this._config;
        // commented
        // will cause bug if another user logged in without refreshing page
        // if (conf.credentials) { return Promise.resolve(true); }
        return Auth_1.default.currentCredentials()
            .then(function (credentials) {
            var cred = Auth_1.default.essentialCredentials(credentials);
            logger.debug('set credentials for analytics', cred);
            conf.credentials = cred;
            return true;
        })
            .catch(function (err) {
            logger.debug('ensure credentials error', err);
            return false;
        });
    };
    AnalyticsClass.prototype._initClients = function () {
        return __awaiter(this, void 0, void 0, function () {
            var credentialsOK;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._checkConfig()) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, this._ensureCredentials()];
                    case 1:
                        credentialsOK = _a.sent();
                        if (!credentialsOK) {
                            return [2 /*return*/, false];
                        }
                        this._initMobileAnalytics();
                        this._initPinpoint();
                        this.startSession();
                        return [2 /*return*/];
                }
            });
        });
    };
    AnalyticsClass.prototype._initMobileAnalytics = function () {
        var _a = this._config, credentials = _a.credentials, region = _a.region;
        this.mobileAnalytics = new Common_1.MobileAnalytics({ credentials: credentials, region: region });
    };
    /**
     * Init Pinpoint with configuration and update pinpoint client endpoint
     */
    AnalyticsClass.prototype._initPinpoint = function () {
        var _a = this._config, region = _a.region, appId = _a.appId, endpointId = _a.endpointId, credentials = _a.credentials;
        this.pinpointClient = new Common_1.Pinpoint({
            region: region,
            credentials: credentials,
        });
        var request = this._endpointRequest();
        var update_params = {
            ApplicationId: appId,
            EndpointId: endpointId,
            EndpointRequest: request
        };
        logger.debug(update_params);
        this.pinpointClient.updateEndpoint(update_params, function (err, data) {
            if (err) {
                logger.debug('Pinpoint ERROR', err);
            }
            else {
                logger.debug('Pinpoint SUCCESS', data);
            }
        });
    };
    /**
     * EndPoint request
     * @return {Object} - The request of updating endpoint
     */
    AnalyticsClass.prototype._endpointRequest = function () {
        var client_info = Common_1.ClientDevice.clientInfo();
        var credentials = this._config.credentials;
        var user_id = credentials.authenticated ? credentials.identityId : null;
        logger.debug('demographic user id: ' + user_id);
        return {
            Demographic: {
                AppVersion: this._config.appVersion || client_info.appVersion,
                Make: client_info.make,
                Model: client_info.model,
                ModelVersion: client_info.version,
                Platform: client_info.platform
            },
            User: { UserId: user_id }
        };
    };
    return AnalyticsClass;
}());
exports.default = AnalyticsClass;
//# sourceMappingURL=Analytics.js.map