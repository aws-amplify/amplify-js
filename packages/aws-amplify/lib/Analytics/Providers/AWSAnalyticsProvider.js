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
var logger = new Common_1.ConsoleLogger('AWSAnalyticsProvider');
var AWSAnalyticsProvider = /** @class */ (function () {
    function AWSAnalyticsProvider(config) {
        this._config = config ? config : {};
    }
    AWSAnalyticsProvider.prototype.getCategory = function () {
        return 'Analytics';
    };
    AWSAnalyticsProvider.prototype.configure = function (config) {
        logger.debug('configure Analytics');
        var conf = config ? config : {};
        this._config = Object.assign({}, this._config, conf);
        return this._config;
    };
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
    AWSAnalyticsProvider.prototype.startSession = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var initClients, sessionId, clientContext, eventParams;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this._config.endpointId !== config.endpointId)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._init(config)];
                    case 1:
                        initClients = _a.sent();
                        if (!initClients)
                            return [2 /*return*/, false];
                        _a.label = 2;
                    case 2:
                        logger.debug('record session start');
                        sessionId = Common_1.JS.generateRandomString();
                        this._sessionId = sessionId;
                        clientContext = this._generateClientContext();
                        eventParams = {
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
                }
            });
        });
    };
    AWSAnalyticsProvider.prototype.stopSession = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var initClients, sessionId, clientContext, eventParams;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this._config.endpointId !== config.endpointId)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._init(config)];
                    case 1:
                        initClients = _a.sent();
                        if (!initClients)
                            return [2 /*return*/, false];
                        _a.label = 2;
                    case 2:
                        logger.debug('record session stop');
                        sessionId = this._sessionId ? this._sessionId : Common_1.JS.generateRandomString();
                        clientContext = this._generateClientContext();
                        eventParams = {
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
                }
            });
        });
    };
    AWSAnalyticsProvider.prototype.record = function (params, config) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var initClients, eventName, attributes, metrics, clientContext, eventParams;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this._config.endpointId !== config.endpointId)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._init(config)];
                    case 1:
                        initClients = _a.sent();
                        if (!initClients)
                            return [2 /*return*/, false];
                        _a.label = 2;
                    case 2:
                        eventName = params.eventName, attributes = params.attributes, metrics = params.metrics;
                        clientContext = this._generateClientContext();
                        eventParams = {
                            clientContext: clientContext,
                            events: [
                                {
                                    eventType: eventName,
                                    timestamp: new Date().toISOString(),
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
                }
            });
        });
    };
    // public init(config) {
    //     logger.debug('init clients');
    //     if (config) {
    //         this.configure(config);
    //     }
    //     if (!this._checkConfig()) { return Promise.resolve(false); }
    //     this._initMobileAnalytics();
    //     return new Promise((res, rej) => {
    //         this._initPinpoint().then((data) => {
    //             res(true);
    //         }).catch((err) => {
    //             res(false);
    //         });
    //     });
    // }
    // public putEvent(params) {
    //     logger.debug('putEvent params', params);
    //     const { eventName } = params;
    //     switch (eventName) {
    //         case 'session_start':
    //             this._startSession(params).catch((err) => {
    //             });
    //             break;
    //         case 'session_stop':
    //             this._stopSession(params).catch((err) => {
    //             });
    //             break;
    //         default:
    //             this._recordCustomEvent(params).catch((err) => {
    //             });
    //             break;
    //     }
    // }
    // private _startSession(params) {
    //     logger.debug('record session start');
    //     const sessionId = JS.generateRandomString();
    //     this._sessionId = sessionId;
    //     const clientContext = this._generateClientContext();
    //     const eventParams = {
    //         clientContext,
    //         events: [
    //             {
    //                 eventType: '_session.start',
    //                 timestamp: new Date().toISOString(),
    //                 'session': {
    //                     'id': sessionId,
    //                     'startTimestamp': new Date().toISOString()
    //                 }
    //             }
    //         ]
    //     };
    //     return new Promise<any>((res, rej) => {
    //         this.mobileAnalytics.putEvents(eventParams, (err, data) => {
    //             if (err) {
    //                 logger.debug('record event failed. ', err);
    //                 rej(err);
    //             }
    //             else {
    //                 logger.debug('record event success. ', data);
    //                 res(data);
    //             }
    //         });
    //     });
    // }
    // private _stopSession(params) {
    //     logger.debug('record session stop');
    //     const sessionId = this._sessionId ? this._sessionId : JS.generateRandomString();
    //     const clientContext = this._generateClientContext();
    //     const eventParams = {
    //         clientContext,
    //         events: [
    //             {
    //                 eventType: '_session.stop',
    //                 timestamp: new Date().toISOString(),
    //                 'session': {
    //                     'id': sessionId,
    //                     'startTimestamp': new Date().toISOString()
    //                 }
    //             }
    //         ]
    //     };
    //     return new Promise<any>((res, rej) => {
    //         this.mobileAnalytics.putEvents(eventParams, (err, data) => {
    //             if (err) {
    //                 logger.debug('record event failed. ', err);
    //                 rej(err);
    //             }
    //             else {
    //                 logger.debug('record event success. ', data);
    //                 res(data);
    //             }
    //         });
    //     });
    // }
    // private _recordCustomEvent(params) {
    //     const { eventName, attributes, metrics } = params;
    //     const clientContext = this._generateClientContext();
    //     const eventParams = {
    //         clientContext,
    //         events: [
    //             {
    //                 eventType: eventName,
    //                 timestamp: new Date().toISOString(),
    //                 attributes,
    //                 metrics
    //             }
    //         ]
    //     };
    //     logger.debug('record event with params', eventParams);
    //     return new Promise<any>((res, rej) => {
    //         this.mobileAnalytics.putEvents(eventParams, (err, data) => {
    //             if (err) {
    //                 logger.debug('record event failed. ', err);
    //                 rej(err);
    //             }
    //             else {
    //                 logger.debug('record event success. ', data);
    //                 res(data);
    //             }
    //         });
    //     });
    // }
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