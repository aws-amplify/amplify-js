"use strict";
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
var Common_1 = require("../../Common");
var Cache_1 = require("../../Cache");
var Auth_1 = require("../../Auth");
var uuid_1 = require("uuid");
var logger = new Common_1.ConsoleLogger('AWSAnalyticsProvider');
var NON_RETRYABLE_EXCEPTIONS = ['BadRequestException', 'SerializationException', 'ValidationException'];
// events buffer
var BUFFER_SIZE = 1000;
var MAX_SIZE_PER_FLUSH = BUFFER_SIZE * 0.1;
var interval = 5 * 1000; // 5s
var RESEND_LIMIT = 5;
// params: { event: {name: , .... }, timeStamp, config, resendLimits }
var AWSAnalyticsProvider = /** @class */ (function () {
    function AWSAnalyticsProvider(config) {
        var _this = this;
        this._buffer = [];
        this._config = config ? config : {};
        // events batch
        var that = this;
        this._clientInfo = Common_1.ClientDevice.clientInfo();
        // flush event buffer
        setInterval(function () {
            var size = _this._buffer.length < MAX_SIZE_PER_FLUSH ? _this._buffer.length : MAX_SIZE_PER_FLUSH;
            for (var i = 0; i < size; i += 1) {
                var params = _this._buffer.shift();
                that._sendFromBuffer(params);
            }
        }, interval);
    }
    /**
     * @private
     * @param params - params for the event recording
     * Put events into buffer
     */
    AWSAnalyticsProvider.prototype._putToBuffer = function (params) {
        if (this._buffer.length < BUFFER_SIZE) {
            this._buffer.push(params);
            return Promise.resolve(true);
        }
        else {
            logger.debug('exceed analytics events buffer size');
            return Promise.reject(false);
        }
    };
    AWSAnalyticsProvider.prototype._sendFromBuffer = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var event, config, appId, region, cacheKey, _a, _b, success, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        event = params.event, config = params.config;
                        appId = config.appId, region = config.region;
                        cacheKey = this.getProviderName() + '_' + appId;
                        _a = config;
                        if (!config.endpointId) return [3 /*break*/, 1];
                        _b = config.endpointId;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this._getEndpointId(cacheKey)];
                    case 2:
                        _b = _d.sent();
                        _d.label = 3;
                    case 3:
                        _a.endpointId = _b;
                        success = true;
                        _c = event.name;
                        switch (_c) {
                            case '_session_start': return [3 /*break*/, 4];
                            case '_session_stop': return [3 /*break*/, 6];
                            case '_update_endpoint': return [3 /*break*/, 8];
                        }
                        return [3 /*break*/, 10];
                    case 4: return [4 /*yield*/, this._startSession(params)];
                    case 5:
                        success = _d.sent();
                        return [3 /*break*/, 12];
                    case 6: return [4 /*yield*/, this._stopSession(params)];
                    case 7:
                        success = _d.sent();
                        return [3 /*break*/, 12];
                    case 8: return [4 /*yield*/, this._updateEndpoint(params)];
                    case 9:
                        success = _d.sent();
                        return [3 /*break*/, 12];
                    case 10: return [4 /*yield*/, this._recordCustomEvent(params)];
                    case 11:
                        success = _d.sent();
                        return [3 /*break*/, 12];
                    case 12:
                        if (!success) {
                            params.resendLimits = typeof params.resendLimits === 'number' ?
                                params.resendLimits : RESEND_LIMIT;
                            if (params.resendLimits > 0) {
                                logger.debug("resending event " + params.eventName + " with " + params.resendLimits + " retry times left");
                                params.resendLimits -= 1;
                                this._putToBuffer(params);
                            }
                            else {
                                logger.debug("retry times used up for event " + params.eventName);
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * get the category of the plugin
     */
    AWSAnalyticsProvider.prototype.getCategory = function () {
        return 'Analytics';
    };
    /**
     * get provider name of the plugin
     */
    AWSAnalyticsProvider.prototype.getProviderName = function () {
        return 'AWSAnalytics';
    };
    /**
     * configure the plugin
     * @param {Object} config - configuration
     */
    AWSAnalyticsProvider.prototype.configure = function (config) {
        logger.debug('configure Analytics', config);
        var conf = config ? config : {};
        this._config = Object.assign({}, this._config, conf);
        return this._config;
    };
    /**
     * record an event
     * @param {Object} params - the params of an event
     */
    AWSAnalyticsProvider.prototype.record = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var credentials, timestamp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._getCredentials()];
                    case 1:
                        credentials = _a.sent();
                        if (!credentials)
                            return [2 /*return*/, Promise.resolve(false)];
                        timestamp = new Date().getTime();
                        Object.assign(params, { timestamp: timestamp, config: this._config, credentials: credentials });
                        return [2 /*return*/, this._putToBuffer(params)];
                }
            });
        });
    };
    /**
     * @private
     * @param params
     */
    AWSAnalyticsProvider.prototype._startSession = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var timestamp, config, credentials, sessionId, clientContext, eventParams;
            return __generator(this, function (_a) {
                timestamp = params.timestamp, config = params.config, credentials = params.credentials;
                this._initClients(config, credentials);
                logger.debug('record session start');
                this._sessionId = uuid_1.v1();
                sessionId = this._sessionId;
                clientContext = this._generateClientContext(config);
                eventParams = {
                    clientContext: clientContext,
                    events: [
                        {
                            eventType: '_session.start',
                            timestamp: new Date(timestamp).toISOString(),
                            'session': {
                                'id': sessionId,
                                'startTimestamp': new Date(timestamp).toISOString()
                            }
                        }
                    ]
                };
                return [2 /*return*/, new Promise(function (res, rej) {
                        _this.mobileAnalytics.putEvents(eventParams, function (err, data) {
                            if (err) {
                                logger.debug('record event failed. ', err);
                                res(false);
                            }
                            else {
                                logger.debug('record event success. ', data);
                                res(true);
                            }
                        });
                    })];
            });
        });
    };
    /**
     * @private
     * @param params
     */
    AWSAnalyticsProvider.prototype._stopSession = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var timestamp, config, credentials, sessionId, clientContext, eventParams;
            return __generator(this, function (_a) {
                timestamp = params.timestamp, config = params.config, credentials = params.credentials;
                this._initClients(config, credentials);
                logger.debug('record session stop');
                sessionId = this._sessionId ? this._sessionId : uuid_1.v1();
                clientContext = this._generateClientContext(config);
                eventParams = {
                    clientContext: clientContext,
                    events: [
                        {
                            eventType: '_session.stop',
                            timestamp: new Date(timestamp).toISOString(),
                            'session': {
                                'id': sessionId,
                                'startTimestamp': new Date(timestamp).toISOString()
                            }
                        }
                    ]
                };
                return [2 /*return*/, new Promise(function (res, rej) {
                        _this.mobileAnalytics.putEvents(eventParams, function (err, data) {
                            if (err) {
                                logger.debug('record event failed. ', err);
                                res(false);
                            }
                            else {
                                logger.debug('record event success. ', data);
                                res(true);
                            }
                        });
                    })];
            });
        });
    };
    AWSAnalyticsProvider.prototype._updateEndpoint = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var timestamp, config, credentials, event, appId, region, endpointId, request, update_params, that;
            return __generator(this, function (_a) {
                timestamp = params.timestamp, config = params.config, credentials = params.credentials, event = params.event;
                appId = config.appId, region = config.region, endpointId = config.endpointId;
                this._initClients(config, credentials);
                request = this._endpointRequest(config, event);
                update_params = {
                    ApplicationId: appId,
                    EndpointId: endpointId,
                    EndpointRequest: request
                };
                that = this;
                logger.debug('updateEndpoint with params: ', update_params);
                return [2 /*return*/, new Promise(function (res, rej) {
                        that.pinpointClient.updateEndpoint(update_params, function (err, data) {
                            if (err) {
                                logger.debug('updateEndpoint failed', err);
                                res(false);
                            }
                            else {
                                logger.debug('updateEndpoint success', data);
                                that.pinpointClient.getEndpoint({
                                    ApplicationId: appId,
                                    EndpointId: endpointId /* required */
                                }, function (err, data) {
                                    if (err) {
                                        logger.debug('get endpint failed');
                                    }
                                    logger.debug('get back endpoint info', data);
                                    res(true);
                                });
                            }
                        });
                    })];
            });
        });
    };
    /**
     * @private
     * @param params
     */
    AWSAnalyticsProvider.prototype._recordCustomEvent = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var event, timestamp, config, credentials, name, attributes, metrics, clientContext, eventParams;
            return __generator(this, function (_a) {
                event = params.event, timestamp = params.timestamp, config = params.config, credentials = params.credentials;
                name = event.name, attributes = event.attributes, metrics = event.metrics;
                this._initClients(config, credentials);
                clientContext = this._generateClientContext(config);
                eventParams = {
                    clientContext: clientContext,
                    events: [
                        {
                            eventType: name,
                            timestamp: new Date(timestamp).toISOString(),
                            attributes: attributes,
                            metrics: metrics
                        }
                    ]
                };
                logger.debug('record event with params', eventParams);
                return [2 /*return*/, new Promise(function (res, rej) {
                        _this.mobileAnalytics.putEvents(eventParams, function (err, data) {
                            if (err) {
                                logger.debug('record event failed. ', err);
                                res(false);
                            }
                            else {
                                logger.debug('record event success. ', data);
                                res(true);
                            }
                        });
                    })];
            });
        });
    };
    /**
     * @private
     * @param config
     * Init the clients
     */
    AWSAnalyticsProvider.prototype._initClients = function (config, credentials) {
        return __awaiter(this, void 0, void 0, function () {
            var region;
            return __generator(this, function (_a) {
                logger.debug('init clients');
                if (this.mobileAnalytics
                    && this.pinpointClient
                    && this._config.credentials
                    && this._config.credentials.sessionToken === credentials.sessionToken
                    && this._config.credentials.identityId === credentials.identityId) {
                    logger.debug('no change for aws credentials, directly return from init');
                    return [2 /*return*/];
                }
                this._config.credentials = credentials;
                region = config.region;
                logger.debug('init clients with credentials', credentials);
                this.mobileAnalytics = new Common_1.MobileAnalytics({ credentials: credentials, region: region });
                this.pinpointClient = new Common_1.Pinpoint({ region: region, credentials: credentials });
                return [2 /*return*/];
            });
        });
    };
    AWSAnalyticsProvider.prototype._getEndpointId = function (cacheKey) {
        return __awaiter(this, void 0, void 0, function () {
            var endpointId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Cache_1.default.getItem(cacheKey)];
                    case 1:
                        endpointId = _a.sent();
                        logger.debug('endpointId from cache', endpointId, 'type', typeof endpointId);
                        if (!endpointId) {
                            endpointId = uuid_1.v1();
                            Cache_1.default.setItem(cacheKey, endpointId);
                        }
                        return [2 /*return*/, endpointId];
                }
            });
        });
    };
    /**
     * EndPoint request
     * @return {Object} - The request of updating endpoint
     */
    AWSAnalyticsProvider.prototype._endpointRequest = function (config, event) {
        var credentials = config.credentials;
        var clientInfo = this._clientInfo;
        var Address = event.Address, RequestId = event.RequestId, Attributes = event.Attributes, UserAttributes = event.UserAttributes, UserId = event.UserId, OptOut = event.OptOut;
        var ChannelType = Address ? ((clientInfo.platform === 'android') ? 'GCM' : 'APNS') : undefined;
        var ret = {
            Address: Address,
            Attributes: Attributes,
            ChannelType: ChannelType,
            Demographic: {
                AppVersion: event.appVersion || clientInfo.appVersion,
                Make: clientInfo.make,
                Model: clientInfo.model,
                ModelVersion: clientInfo.version,
                Platform: clientInfo.platform
            },
            OptOut: OptOut,
            RequestId: RequestId,
            EffectiveDate: Address ? new Date().toISOString() : undefined,
            User: {
                UserId: UserId ? UserId : credentials.identityId,
                UserAttributes: UserAttributes
            }
        };
        return ret;
    };
    /**
     * @private
     * generate client context with endpoint Id and app Id provided
     */
    AWSAnalyticsProvider.prototype._generateClientContext = function (config) {
        var endpointId = config.endpointId, appId = config.appId;
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
     * @private
     * check if current credentials exists
     */
    AWSAnalyticsProvider.prototype._getCredentials = function () {
        var that = this;
        return Auth_1.default.currentCredentials()
            .then(function (credentials) {
            if (!credentials)
                return null;
            logger.debug('set credentials for analytics', that._config.credentials);
            return Auth_1.default.essentialCredentials(credentials);
        })
            .catch(function (err) {
            logger.debug('ensure credentials error', err);
            return null;
        });
    };
    return AWSAnalyticsProvider;
}());
exports.default = AWSAnalyticsProvider;
//# sourceMappingURL=AWSAnalyticsProvider.js.map