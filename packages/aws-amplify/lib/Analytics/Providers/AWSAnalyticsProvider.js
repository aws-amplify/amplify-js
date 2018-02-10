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
var Common_1 = require("../../Common");
var uuid_1 = require("uuid");
var logger = new Common_1.ConsoleLogger('AWSAnalyticsProvider');
var NON_RETRYABLE_EXCEPTIONS = ['BadRequestException', 'SerializationException', 'ValidationException'];
var AWSAnalyticsProvider = /** @class */ (function () {
    function AWSAnalyticsProvider(config) {
        this._config = config ? config : {};
    }
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
        logger.debug('configure Analytics');
        var conf = config ? config : {};
        this._config = Object.assign({}, this._config, conf);
        return this._config;
    };
    /**
     * record an event
     * @param {Object} params - the params of an event
     */
    AWSAnalyticsProvider.prototype.record = function (params) {
        var eventName = params.eventName;
        switch (eventName) {
            case '_session_start':
                return this._startSession(params);
            case '_session_stop':
                return this._stopSession(params);
            default:
                return this._recordCustomEvent(params);
        }
    };
    /**
     * @private
     * @param params
     */
    AWSAnalyticsProvider.prototype._startSession = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var timestamp, config, initClients, sessionId, clientContext, eventParams;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log(params);
                        timestamp = params.timestamp, config = params.config;
                        if (!(this._config.endpointId !== config.endpointId)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._init(config)];
                    case 1:
                        initClients = _a.sent();
                        if (!initClients)
                            return [2 /*return*/, false];
                        _a.label = 2;
                    case 2:
                        logger.debug('record session start');
                        this._sessionId = uuid_1.v1();
                        sessionId = this._sessionId;
                        clientContext = this._generateClientContext();
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
                                        res(_this._checkErrCode(err.code));
                                    }
                                    else {
                                        logger.debug('record event success. ', data);
                                        res(true);
                                    }
                                });
                            })];
                }
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
            var timestamp, config, initClients, sessionId, clientContext, eventParams;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        timestamp = params.timestamp, config = params.config;
                        if (!(this._config.endpointId !== config.endpointId)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._init(config)];
                    case 1:
                        initClients = _a.sent();
                        if (!initClients)
                            return [2 /*return*/, false];
                        _a.label = 2;
                    case 2:
                        logger.debug('record session stop');
                        sessionId = this._sessionId ? this._sessionId : uuid_1.v1();
                        clientContext = this._generateClientContext();
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
                                        res(_this._checkErrCode(err.code));
                                    }
                                    else {
                                        logger.debug('record event success. ', data);
                                        res(true);
                                    }
                                });
                            })];
                }
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
            var eventName, attributes, metrics, timestamp, config, initClients, clientContext, eventParams;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        eventName = params.eventName, attributes = params.attributes, metrics = params.metrics, timestamp = params.timestamp, config = params.config;
                        if (!(this._config.endpointId !== config.endpointId)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._init(config)];
                    case 1:
                        initClients = _a.sent();
                        if (!initClients)
                            return [2 /*return*/, false];
                        _a.label = 2;
                    case 2:
                        clientContext = this._generateClientContext();
                        eventParams = {
                            clientContext: clientContext,
                            events: [
                                {
                                    eventType: eventName,
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
                                        res(_this._checkErrCode(err.code));
                                    }
                                    else {
                                        logger.debug('record event success. ', data);
                                        res(true);
                                    }
                                });
                            })];
                }
            });
        });
    };
    /**
     * @private
     * @param code
     * Check if the error is retryable
     */
    AWSAnalyticsProvider.prototype._checkErrCode = function (code) {
        for (var i = 0; i < NON_RETRYABLE_EXCEPTIONS.length; i++) {
            if (code === NON_RETRYABLE_EXCEPTIONS[i])
                return true;
        }
        return false;
    };
    /**
     * @private
     * @param config
     * Init the clients
     */
    AWSAnalyticsProvider.prototype._init = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                logger.debug('init clients');
                this._config = Object.assign(this._config, config);
                this._initMobileAnalytics();
                return [2 /*return*/, new Promise(function (res, rej) {
                        _this._initPinpoint().then(function (data) {
                            res(true);
                        }).catch(function (err) {
                            res(false);
                        });
                    })];
            });
        });
    };
    /**
     * @private
     * Init the MobileAnalytics client
     */
    AWSAnalyticsProvider.prototype._initMobileAnalytics = function () {
        var _a = this._config, credentials = _a.credentials, region = _a.region;
        this.mobileAnalytics = new Common_1.MobileAnalytics({ credentials: credentials, region: region });
    };
    /**
     * @private
     * Init Pinpoint with configuration and update pinpoint client endpoint
     * @return - A promise resolves if endpoint updated successfully
     */
    AWSAnalyticsProvider.prototype._initPinpoint = function () {
        var _this = this;
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
        logger.debug('updateEndpoint with params: ', update_params);
        return new Promise(function (res, rej) {
            _this.pinpointClient.updateEndpoint(update_params, function (err, data) {
                if (err) {
                    logger.debug('Pinpoint ERROR', err);
                    rej(err);
                }
                else {
                    logger.debug('Pinpoint SUCCESS', data);
                    res(data);
                }
            });
        });
    };
    /**
     * EndPoint request
     * @return {Object} - The request of updating endpoint
     */
    AWSAnalyticsProvider.prototype._endpointRequest = function () {
        var _a = this._config, clientInfo = _a.clientInfo, credentials = _a.credentials;
        var user_id = (credentials && credentials.authenticated) ? credentials.identityId : null;
        logger.debug('config', this._config);
        logger.debug('demographic user id: ', user_id);
        return {
            Demographic: {
                AppVersion: this._config.appVersion || clientInfo.appVersion,
                Make: clientInfo.make,
                Model: clientInfo.model,
                ModelVersion: clientInfo.version,
                Platform: clientInfo.platform
            },
            User: { UserId: user_id }
        };
    };
    /**
     * @private
     * generate client context with endpoint Id and app Id provided
     */
    AWSAnalyticsProvider.prototype._generateClientContext = function () {
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
    return AWSAnalyticsProvider;
}());
exports.default = AWSAnalyticsProvider;
//# sourceMappingURL=AWSAnalyticsProvider.js.map