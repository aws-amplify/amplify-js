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
var NON_RETRYABLE_EXCEPTIONS = ['BadRequestException', 'SerializationException', 'ValidationException'];
/**
* Provide mobile analytics client functions
*/
var AnalyticsClass = /** @class */ (function () {
    /**
     * Initialize Analtyics
     * @param config - Configuration of the Analytics
     */
    function AnalyticsClass(config) {
        if (config) {
            this.configure(config);
        }
        else {
            this._config = {};
        }
        var client_info = Common_1.ClientDevice.clientInfo();
        if (client_info.platform) {
            this._config.platform = client_info.platform;
        }
        this._buffer = [];
    }
    /**
     * configure Analytics
     * @param {Object} config - Configuration of the Analytics
     */
    AnalyticsClass.prototype.configure = function (config) {
        logger.debug('configure Analytics');
        var conf = config ? config.Analytics || config : {};
        // using app_id from aws-exports if provided
        if (conf['aws_mobile_analytics_app_id']) {
            conf = {
                appId: conf['aws_mobile_analytics_app_id'],
                region: conf['aws_project_region'],
                cognitoIdentityPoolId: conf['aws_cognito_identity_pool_id'],
                platform: 'other'
            };
        }
        // hard code region
        conf.region = 'us-east-1';
        this._config = Object.assign({}, this._config, conf);
        // no app id provided
        if (!this._config.appId) {
            logger.debug('Do not have appId yet.');
        }
        // async init clients
        this._initClients();
        return this._config;
    };
    /**
     * Record Session start
     * @return - A promise which resolves if event record successfully
     */
    AnalyticsClass.prototype.startSession = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var credentialsOK, sessionId, clientContext, params;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._ensureCredentials()];
                    case 1:
                        credentialsOK = _a.sent();
                        if (!credentialsOK) {
                            return [2 /*return*/, Promise.resolve(false)];
                        }
                        sessionId = this.generateRandomString();
                        this._sessionId = sessionId;
                        clientContext = this._generateClientContext();
                        params = {
                            clientContext: clientContext,
                            events: [
                                {
                                    eventType: '_session.start',
                                    timestamp: new Date().toISOString(),
                                    'session': {
                                        'id': sessionId,
                                        'startTimestamp': new Date().toISOString()
                                    }
                                }
                            ]
                        };
                        logger.debug('record session start with params', params);
                        return [2 /*return*/, new Promise(function (res, rej) {
                                _this.mobileAnalytics.putEvents(params, function (err, data) {
                                    if (err) {
                                        logger.debug('record event failed. ', err);
                                        rej(err);
                                    }
                                    else {
                                        logger.debug('record event success. ', data);
                                        res(data);
                                    }
                                });
                            })];
                }
            });
        });
    };
    /**
     * Record Session stop
     * @return - A promise which resolves if event record successfully
     */
    AnalyticsClass.prototype.stopSession = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var credentialsOK, sessionId, clientContext, params;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._ensureCredentials()];
                    case 1:
                        credentialsOK = _a.sent();
                        if (!credentialsOK) {
                            return [2 /*return*/, Promise.resolve(false)];
                        }
                        sessionId = this._sessionId ? this._sessionId : this.generateRandomString();
                        clientContext = this._generateClientContext();
                        params = {
                            clientContext: clientContext,
                            events: [
                                {
                                    eventType: '_session.stop',
                                    timestamp: new Date().toISOString(),
                                    'session': {
                                        'id': sessionId,
                                        'startTimestamp': new Date().toISOString()
                                    }
                                }
                            ]
                        };
                        logger.debug('record session stop with params', params);
                        return [2 /*return*/, new Promise(function (res, rej) {
                                _this.mobileAnalytics.putEvents(params, function (err, data) {
                                    if (err) {
                                        logger.debug('record event failed. ', err);
                                        rej(err);
                                    }
                                    else {
                                        logger.debug('record event success. ', data);
                                        res(data);
                                    }
                                });
                            })];
                }
            });
        });
    };
    /**
     * @async
     * Restart Analytics client and record session stop
     * @return - A promise ehich resolves to be true if current credential exists
     */
    AnalyticsClass.prototype.restart = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ret;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._initClients()];
                    case 1:
                        ret = _a.sent();
                        if (!ret) {
                            logger.debug('restart failed');
                            return [2 /*return*/];
                        }
                        this.stopSession().then(function (data) {
                            logger.debug('restarting clients');
                            return;
                        }).catch(function (e) {
                            logger.debug('restart error', e);
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
    * Record one analytic event and send it to Pinpoint
    * @param {String} name - The name of the event
    * @param {Object} [attributs] - Attributes of the event
    * @param {Object} [metrics] - Event metrics
    * @return - A promise which resolves if event record successfully
    */
    AnalyticsClass.prototype.record = function (name, attributes, metrics) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var credentialsOK, clientContext, params;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logger.debug("record event: { name: " + name + ", attributes: " + attributes + ", metrics: " + metrics);
                        return [4 /*yield*/, this._ensureCredentials()];
                    case 1:
                        credentialsOK = _a.sent();
                        if (!credentialsOK) {
                            return [2 /*return*/, Promise.resolve(false)];
                        }
                        // if mobile analytics client not ready, buffer it
                        if (!this.mobileAnalytics) {
                            logger.debug('mobileAnalytics not ready, put in buffer');
                            this._buffer.push({
                                name: name,
                                attributes: attributes,
                                metrics: metrics
                            });
                            return [2 /*return*/];
                        }
                        clientContext = this._generateClientContext();
                        params = {
                            clientContext: clientContext,
                            events: [
                                {
                                    eventType: name,
                                    timestamp: new Date().toISOString(),
                                    attributes: attributes,
                                    metrics: metrics
                                }
                            ]
                        };
                        logger.debug('record event with params', params);
                        return [2 /*return*/, new Promise(function (res, rej) {
                                _this.mobileAnalytics.putEvents(params, function (err, data) {
                                    if (err) {
                                        logger.debug('record event failed. ', err);
                                        rej(err);
                                    }
                                    else {
                                        logger.debug('record event success. ', data);
                                        res(data);
                                    }
                                });
                            })];
                }
            });
        });
    };
    /**
    * Receive a capsule from Hub
    * @param {any} capsuak - The message from hub
    */
    AnalyticsClass.prototype.onHubCapsule = function (capsule) { };
    /*
        _putEventsCallback() {
            return (err, data, res, rej) => {
                if (err) {
                    logger.debug('record event failed. ' + err);
                    if (err.statusCode === undefined || err.statusCode === 400){
                        if (err.code === 'ThrottlingException') {
                            // todo
                            // cache events
                            logger.debug('get throttled, caching events');
                        }
                    }
                    rej(err);
                }
                else {
                    logger.debug('record event success. ' + data);
                    // try to clean cached events if exist
    
    
                    res(data);
                }
            };
        }
    */
    /**
    * Record one analytic event
    * @param {String} name - Event name
    * @param {Object} [attributes] - Attributes of the event
    * @param {Object} [metrics] - Event metrics
    */
    // async recordMonetization(name, attributes?: EventAttributes, metrics?: EventMetrics) {
    //     this.amaClient.recordMonetizationEvent(name, attributes, metrics);
    // }
    /**
     * @private
     * generate client context with endpoint Id and app Id provided
     */
    AnalyticsClass.prototype._generateClientContext = function () {
        var _a = this._config, endpointId = _a.endpointId, appId = _a.appId;
        var clientContext = {
            client: {
                client_id: endpointId
            },
            services: {
                mobile_analytics: {
                    app_id: appId
                }
            }
        };
        return JSON.stringify(clientContext);
    };
    /**
     * generate random string
     */
    AnalyticsClass.prototype.generateRandomString = function () {
        var result = '';
        var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (var i = 32; i > 0; i -= 1) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
    };
    /**
     * @private
     * check if app Id exists
     */
    AnalyticsClass.prototype._checkConfig = function () {
        return !!this._config.appId;
    };
    /**
     * @private
     * check if current crednetials exists
     */
    AnalyticsClass.prototype._ensureCredentials = function () {
        // commented
        // will cause bug if another user logged in without refreshing page
        // if (conf.credentials) { return Promise.resolve(true); }
        var that = this;
        return Auth_1.default.currentCredentials()
            .then(function (credentials) {
            if (!credentials)
                return false;
            var cred = Auth_1.default.essentialCredentials(credentials);
            that._config.credentials = cred;
            that._config.endpointId = cred.identityId;
            if (!that._config.endpointId) {
                that._config.endpointId = that.generateRandomString();
            }
            logger.debug('set endpointId for analytics', that._config.endpointId);
            logger.debug('set credentials for analytics', that._config.credentials);
            return true;
        })
            .catch(function (err) {
            logger.debug('ensure credentials error', err);
            return false;
        });
    };
    /**
     * @private
     * @async
     * init clients for Anlytics including mobile analytics and pinpoint
     * @return - True if initilization succeeds
     */
    AnalyticsClass.prototype._initClients = function () {
        return __awaiter(this, void 0, void 0, function () {
            var credentialsOK, e_1;
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
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this._initPinpoint()];
                    case 3:
                        _a.sent();
                        this.startSession();
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _a.sent();
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * @private
     * Init mobile analytics and clear buffer
     */
    AnalyticsClass.prototype._initMobileAnalytics = function () {
        var _this = this;
        var _a = this._config, credentials = _a.credentials, region = _a.region;
        this.mobileAnalytics = new Common_1.MobileAnalytics({ credentials: credentials, region: region });
        if (this._buffer.length > 0) {
            logger.debug('something in buffer, flush it');
            var buffer = this._buffer;
            this._buffer = [];
            buffer.forEach(function (event) {
                _this.record(event.name, event.attributes, event.metrics);
            });
        }
    };
    /**
     * @private
     * Init Pinpoint with configuration and update pinpoint client endpoint
     * @return - A promise resolves if endpoint updated successfully
     */
    AnalyticsClass.prototype._initPinpoint = function () {
        return __awaiter(this, void 0, void 0, function () {
            var credentialsOK, _a, region, appId, endpointId, credentials, request, update_params, that;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this._ensureCredentials()];
                    case 1:
                        credentialsOK = _b.sent();
                        if (!credentialsOK) {
                            return [2 /*return*/, Promise.resolve(false)];
                        }
                        _a = this._config, region = _a.region, appId = _a.appId, endpointId = _a.endpointId, credentials = _a.credentials;
                        this.pinpointClient = new Common_1.Pinpoint({
                            region: region,
                            credentials: credentials,
                        });
                        request = this._endpointRequest();
                        update_params = {
                            ApplicationId: appId,
                            EndpointId: endpointId,
                            EndpointRequest: request
                        };
                        logger.debug('updateEndpoint with params: ', update_params);
                        that = this;
                        return [2 /*return*/, new Promise(function (res, rej) {
                                that.pinpointClient.updateEndpoint(update_params, function (err, data) {
                                    if (err) {
                                        logger.debug('Pinpoint ERROR', err);
                                        rej(err);
                                    }
                                    else {
                                        logger.debug('Pinpoint SUCCESS', data);
                                        res(data);
                                    }
                                });
                            })];
                }
            });
        });
    };
    AnalyticsClass.prototype.updateEndpoint = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var credentialsOK, conf, _a, appId, endpointId, credentials, region, request, update_params, that;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this._ensureCredentials()];
                    case 1:
                        credentialsOK = _b.sent();
                        if (!credentialsOK) {
                            return [2 /*return*/, Promise.resolve(false)];
                        }
                        conf = config ? config.Analytics || config : {};
                        this._config = Object.assign({}, this._config, conf);
                        _a = this._config, appId = _a.appId, endpointId = _a.endpointId, credentials = _a.credentials, region = _a.region;
                        request = this._endpointRequest();
                        update_params = {
                            ApplicationId: appId,
                            EndpointId: endpointId,
                            EndpointRequest: request
                        };
                        if (!this.pinpointClient) {
                            this.pinpointClient = new Common_1.Pinpoint({
                                region: region,
                                credentials: credentials
                            });
                        }
                        that = this;
                        logger.debug('updateEndpoint with params: ', update_params);
                        return [2 /*return*/, new Promise(function (res, rej) {
                                that.pinpointClient.updateEndpoint(update_params, function (err, data) {
                                    if (err) {
                                        logger.debug('Pinpoint ERROR', err);
                                        rej(err);
                                    }
                                    else {
                                        logger.debug('Pinpoint SUCCESS', data);
                                        res(data);
                                    }
                                });
                            })];
                }
            });
        });
    };
    /**
     * EndPoint request
     * @return {Object} - The request of updating endpoint
     */
    AnalyticsClass.prototype._endpointRequest = function () {
        var client_info = Common_1.ClientDevice.clientInfo();
        var _a = this._config, credentials = _a.credentials, Address = _a.Address, RequestId = _a.RequestId, cognitoIdentityPoolId = _a.cognitoIdentityPoolId, endpointId = _a.endpointId;
        var user_id = (credentials && credentials.authenticated) ? credentials.identityId : null;
        var ChannelType = Address ? ((client_info.platform === 'android') ? 'GCM' : 'APNS') : undefined;
        logger.debug('demographic user id: ', user_id);
        var OptOut = this._config.OptOut ? this._config.OptOut : undefined;
        return {
            Address: Address,
            ChannelType: ChannelType,
            Demographic: {
                AppVersion: this._config.appVersion || client_info.appVersion,
                Make: client_info.make,
                Model: client_info.model,
                ModelVersion: client_info.version,
                Platform: client_info.platform
            },
            OptOut: OptOut,
            RequestId: RequestId,
            EffectiveDate: Address ? new Date().toISOString() : undefined,
            User: {
                UserId: endpointId,
                UserAttributes: {
                    CognitoIdentityPool: [cognitoIdentityPoolId]
                }
            }
        };
    };
    return AnalyticsClass;
}());
exports.default = AnalyticsClass;
//# sourceMappingURL=Analytics.js.map