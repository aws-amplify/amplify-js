"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Common_1 = require("../../Common");
var logger = new Common_1.ConsoleLogger('AWSAnalyticsProvider');
var AWSAnalyticsProvider = /** @class */ (function () {
    function AWSAnalyticsProvider() {
        this._config = {};
    }
    AWSAnalyticsProvider.prototype.configure = function (config) {
        logger.debug('configure Analytics');
        var conf = config ? config : {};
        // using app_id from aws-exports if provided
        if (conf['aws_mobile_analytics_app_id']) {
            conf = {
                appId: conf['aws_mobile_analytics_app_id'],
                region: conf['aws_project_region'],
                platform: 'other'
            };
        }
        var clientInfo = config.clientInfo, endpointId = config.endpointId, credentials = config.credentials;
        conf = Object.assign(conf, { clientInfo: clientInfo, endpointId: endpointId, credentials: credentials });
        // hard code region
        conf.region = 'us-east-1';
        this._config = Object.assign({}, this._config, conf);
        // no app id provided
        // if (!this._config.appId) { logger.debug('Do not have appId yet.'); 
        return this._config;
    };
    AWSAnalyticsProvider.prototype.initClients = function (config) {
        logger.debug('init clients');
        if (config) {
            this.configure(config);
        }
        if (!this._checkConfig()) {
            return Promise.resolve(false);
        }
        this._initMobileAnalytics();
        this._initPinpoint().then(function (data) {
            return Promise.resolve(true);
        }).catch(function (err) {
            return Promise.resolve(false);
        });
    };
    AWSAnalyticsProvider.prototype.putEvent = function (params) {
        logger.debug('putEvent params', params);
        var eventName = params.eventName;
        switch (eventName) {
            case 'session_start':
                this._startSession(params).catch(function (err) {
                });
                break;
            case 'session_stop':
                this._stopSession(params).catch(function (err) {
                });
                break;
            default:
                this._recordCustomEvent(params).catch(function (err) {
                });
                break;
        }
    };
    AWSAnalyticsProvider.prototype._startSession = function (params) {
        var _this = this;
        logger.debug('record session start');
        var sessionId = Common_1.JS.generateRandomString();
        this._sessionId = sessionId;
        var clientContext = this._generateClientContext();
        var eventParams = {
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
        return new Promise(function (res, rej) {
            _this.mobileAnalytics.putEvents(eventParams, function (err, data) {
                if (err) {
                    logger.debug('record event failed. ', err);
                    rej(err);
                }
                else {
                    logger.debug('record event success. ', data);
                    res(data);
                }
            });
        });
    };
    AWSAnalyticsProvider.prototype._stopSession = function (params) {
        var _this = this;
        logger.debug('record session stop');
        var sessionId = this._sessionId ? this._sessionId : Common_1.JS.generateRandomString();
        var clientContext = this._generateClientContext();
        var eventParams = {
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
        return new Promise(function (res, rej) {
            _this.mobileAnalytics.putEvents(eventParams, function (err, data) {
                if (err) {
                    logger.debug('record event failed. ', err);
                    rej(err);
                }
                else {
                    logger.debug('record event success. ', data);
                    res(data);
                }
            });
        });
    };
    AWSAnalyticsProvider.prototype._recordCustomEvent = function (params) {
        var _this = this;
        logger.debug("record event with params: " + params);
        var attributes = params.attributes, metrics = params.metrics;
        var clientContext = this._generateClientContext();
        var eventParams = {
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
        return new Promise(function (res, rej) {
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
        });
    };
    /**
     * @private
     * check if app Id exists
     */
    AWSAnalyticsProvider.prototype._checkConfig = function () {
        return !!this._config.appId;
    };
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
        var clientInfo = this._config.clientInfo;
        var credentials = this._config.credentials;
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
exports.AWSAnalyticsProvider = AWSAnalyticsProvider;
var instance = new AWSAnalyticsProvider();
exports.default = instance;
//# sourceMappingURL=AWSAnalyticsProvider.js.map