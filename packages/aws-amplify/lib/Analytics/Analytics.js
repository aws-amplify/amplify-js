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
var AWSAnalyticsProvider_1 = require("./Providers/AWSAnalyticsProvider");
var Auth_1 = require("../Auth");
var logger = new Common_1.ConsoleLogger('AnalyticsClass');
// events buffer
var BUFFER_SIZE = 1000;
var MAX_SIZE_PER_FLUSH = BUFFER_SIZE * 0.1;
var interval = 5 * 1000; // 5s
var RESEND_LIMIT = 5;
/**
* Provide mobile analytics client functions
*/
var AnalyticsClass = /** @class */ (function () {
    /**
     * Initialize Analtyics
     * @param config - Configuration of the Analytics
     */
    function AnalyticsClass() {
        var _this = this;
        this._buffer = [];
        this._config = {};
        this._pluggables = [];
        this._disabled = false;
        // default one
        // events batch
        var that = this;
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
     * configure Analytics
     * @param {Object} config - Configuration of the Analytics
     */
    AnalyticsClass.prototype.configure = function (config) {
        logger.debug('configure Analytics');
        var amplifyConfig = Common_1.Parser.parseMobilehubConfig(config);
        var conf = Object.assign({}, this._config, amplifyConfig.Analytics, config);
        var clientInfo = Common_1.ClientDevice.clientInfo();
        conf['clientInfo'] = conf['client_info'] ? conf['client_info'] : clientInfo;
        this._config = conf;
        if (conf['disabled']) {
            this._disabled = true;
        }
        this._pluggables.map(function (pluggable) {
            pluggable.configure(conf);
        });
        if (this._pluggables.length === 0) {
            this.addPluggable(new AWSAnalyticsProvider_1.default());
        }
        return conf;
    };
    /**
     * add plugin into Analytics category
     * @param {Object} pluggable - an instance of the plugin
     */
    AnalyticsClass.prototype.addPluggable = function (pluggable) {
        return __awaiter(this, void 0, void 0, function () {
            var ensureCredentails, config;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._getCredentials()];
                    case 1:
                        ensureCredentails = _a.sent();
                        if (!ensureCredentails)
                            return [2 /*return*/, Promise.resolve(false)];
                        if (pluggable && pluggable.getCategory() === 'Analytics') {
                            this._pluggables.push(pluggable);
                            config = pluggable.configure(this._config);
                            return [2 /*return*/, Promise.resolve(config)];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * stop sending events
     */
    AnalyticsClass.prototype.disable = function () {
        this._disabled = true;
    };
    /**
     * start sending events
     */
    AnalyticsClass.prototype.enable = function () {
        this._disabled = false;
    };
    /**
     * Record Session start
     * @return - A promise which resolves if buffer doesn't overflow
     */
    AnalyticsClass.prototype.startSession = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ensureCredentails, timestamp, params;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._getCredentials()];
                    case 1:
                        ensureCredentails = _a.sent();
                        if (!ensureCredentails)
                            return [2 /*return*/, Promise.resolve(false)];
                        timestamp = new Date().getTime();
                        params = { eventName: '_session_start', timestamp: timestamp, config: this._config };
                        return [2 /*return*/, this._putToBuffer(params)];
                }
            });
        });
    };
    /**
    * Receive a capsule from Hub
    * @param {any} capsuak - The message from hub
    */
    AnalyticsClass.prototype.onHubCapsule = function (capsule) { };
    /**
     * Record Session stop
     * @return - A promise which resolves if buffer doesn't overflow
     */
    AnalyticsClass.prototype.stopSession = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ensureCredentails, timestamp, params;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._getCredentials()];
                    case 1:
                        ensureCredentails = _a.sent();
                        if (!ensureCredentails)
                            return [2 /*return*/, Promise.resolve(false)];
                        timestamp = new Date().getTime();
                        params = { eventName: '_session_stop', timestamp: timestamp, config: this._config };
                        return [2 /*return*/, this._putToBuffer(params)];
                }
            });
        });
    };
    /**
     * Record one analytic event and send it to Pinpoint
     * @param {String} name - The name of the event
     * @param {Object} [attributs] - Attributes of the event
     * @param {Object} [metrics] - Event metrics
     * @return - A promise which resolves if buffer doesn't overflow
     */
    AnalyticsClass.prototype.record = function (eventName, attributes, metrics) {
        return __awaiter(this, void 0, void 0, function () {
            var ensureCredentails, timestamp, params;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._getCredentials()];
                    case 1:
                        ensureCredentails = _a.sent();
                        if (!ensureCredentails)
                            return [2 /*return*/, Promise.resolve(false)];
                        timestamp = new Date().getTime();
                        params = { eventName: eventName, attributes: attributes, metrics: metrics, timestamp: timestamp, config: this._config };
                        return [2 /*return*/, this._putToBuffer(params)];
                }
            });
        });
    };
    AnalyticsClass.prototype.updateEndpoint = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var ensureCredentails, timestamp, conf, params;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._getCredentials()];
                    case 1:
                        ensureCredentails = _a.sent();
                        if (!ensureCredentails)
                            return [2 /*return*/, Promise.resolve(false)];
                        timestamp = new Date().getTime();
                        conf = Object.assign(this._config, config);
                        params = { eventName: '_update_endpoint', timestamp: timestamp, config: conf };
                        return [2 /*return*/, this._putToBuffer(params)];
                }
            });
        });
    };
    /**
     * @private
     * @param {Object} params - params for the event recording
     * Send events from buffer
     */
    AnalyticsClass.prototype._sendFromBuffer = function (params) {
        var that = this;
        this._pluggables.map(function (pluggable) {
            pluggable.record(params)
                .then(function (success) {
                if (!success) {
                    params.resendLimits = typeof params.resendLimits === 'number' ?
                        params.resendLimits : RESEND_LIMIT;
                    if (params.resendLimits > 0) {
                        logger.debug("resending event " + params.eventName + " with " + params.resendLimits + " retry times left");
                        params.resendLimits -= 1;
                        that._putToBuffer(params);
                    }
                    else {
                        logger.debug("retry times used up for event " + params.eventName);
                    }
                }
            });
        });
    };
    /**
     * @private
     * @param params - params for the event recording
     * Put events into buffer
     */
    AnalyticsClass.prototype._putToBuffer = function (params) {
        if (this._disabled) {
            logger.debug('Analytics has been disabled');
            return Promise.resolve();
        }
        if (this._buffer.length < BUFFER_SIZE) {
            this._buffer.push(params);
            return Promise.resolve();
        }
        else
            return Promise.reject('exceed buffer size');
    };
    /**
     * @private
     * check if current credentials exists
     */
    AnalyticsClass.prototype._getCredentials = function () {
        var that = this;
        return Auth_1.default.currentCredentials()
            .then(function (credentials) {
            if (!credentials)
                return false;
            var cred = Auth_1.default.essentialCredentials(credentials);
            that._config.credentials = cred;
            // that._config.endpointId = cred.identityId;
            // logger.debug('set endpointId for analytics', that._config.endpointId);
            logger.debug('set credentials for analytics', that._config.credentials);
            return true;
        })
            .catch(function (err) {
            logger.debug('ensure credentials error', err);
            return false;
        });
    };
    return AnalyticsClass;
}());
exports.default = AnalyticsClass;
//# sourceMappingURL=Analytics.js.map