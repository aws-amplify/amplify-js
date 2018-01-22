import { ConsoleLogger as Logger, Pinpoint, MobileAnalytics, JS } from '../../Common';

const logger = new Logger('AWSAnalyticsProvider');

export class AWSAnalyticsProvider {
    private _config;
    private mobileAnalytics;
    private pinpointClient;
    private _sessionId;

    constructor() {
        this._config = {};
    }

    public configure(config) {
        logger.debug('configure Analytics');
        let conf = config? config : {};
        
        // using app_id from aws-exports if provided
        if (conf['aws_mobile_analytics_app_id']) {
            conf = {
                appId: conf['aws_mobile_analytics_app_id'],
                region: conf['aws_project_region'],
                platform: 'other'
            };
        }

        const {clientInfo, endpointId, credentials} = config;
        conf = Object.assign(conf, {clientInfo, endpointId, credentials});
        // hard code region
        conf.region = 'us-east-1';
        this._config = Object.assign({}, this._config, conf);

        // no app id provided
       // if (!this._config.appId) { logger.debug('Do not have appId yet.'); 

        return this._config;
    }

    public initClients(config) {
        logger.debug('init clients');
        if (config) {
            this.configure(config);
        }
        if (!this._checkConfig()) { return Promise.resolve(false); }

        this._initMobileAnalytics();
        this._initPinpoint().then((data) => {
            return Promise.resolve(true);
        }).catch((err) => {
            return Promise.resolve(false);
        })
    }

    public putEvent(params) {
        const { eventName} = params;

        switch (eventName) {
            case 'session_start':
                this._startSession(params).catch((err) => {
                });
                break;
            case 'session_stop':
                this._stopSession(params).catch((err) => {
                });
                break;
            default:
                this._recordCustomEvent(params).catch((err) => {
                });
                break;
        }
    }

    private _startSession(params) {
        logger.debug('record session start');
        const sessionId = JS.generateRandomString();
        this._sessionId = sessionId;

        const clientContext = this._generateClientContext();
        const eventParams = {
            clientContext,
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

        return new Promise<any>((res, rej) => {
            this.mobileAnalytics.putEvents(eventParams, (err, data) => {
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
    }

    private _stopSession(params) {
        logger.debug('record session stop');
        
        const sessionId = this._sessionId ? this._sessionId : JS.generateRandomString();
        const clientContext = this._generateClientContext();
        const eventParams = {
            clientContext,
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
        return new Promise<any>((res, rej) => {
            this.mobileAnalytics.putEvents(eventParams, (err, data) => {
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
    }

    private _recordCustomEvent(params) {
        logger.debug(`record event with params: ${params}`);

        const { attributes, metrics } = params;
        const clientContext = this._generateClientContext();
        const eventParams = {
            clientContext,
            events: [
                {
                    eventType: name,
                    timestamp: new Date().toISOString(),
                    attributes,
                    metrics
                }
            ]
        };
        return new Promise<any>((res, rej) => {
            this.mobileAnalytics.putEvents(params, (err, data) => {
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
    }


    /**
     * @private
     * check if app Id exists
     */
    private _checkConfig() {
        return !!this._config.appId;
    }

    private _initMobileAnalytics() {
        const { credentials, region } = this._config;
        this.mobileAnalytics = new MobileAnalytics({ credentials, region });
    }

        /**
     * @private
     * Init Pinpoint with configuration and update pinpoint client endpoint
     * @return - A promise resolves if endpoint updated successfully
     */
    private _initPinpoint() {
        const { region, appId, endpointId, credentials } = this._config;
        this.pinpointClient = new Pinpoint({
            region,
            credentials,
        });

        const request = this._endpointRequest();
        const update_params = {
            ApplicationId: appId,
            EndpointId: endpointId,
            EndpointRequest: request
        };
        logger.debug('updateEndpoint with params: ', update_params);

        return new Promise((res, rej) => {
            this.pinpointClient.updateEndpoint(update_params, function(err, data) {
                if (err) {
                    logger.debug('Pinpoint ERROR', err);
                    rej(err);
                } else {
                    logger.debug('Pinpoint SUCCESS', data);
                    res(data);
                }
            });
        });
    }

        /**
     * EndPoint request
     * @return {Object} - The request of updating endpoint
     */
    private _endpointRequest() {
        const { clientInfo } = this._config;
        const credentials = this._config.credentials;
        const user_id = (credentials && credentials.authenticated) ? credentials.identityId : null;
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
    }

    /**
     * @private
     * generate client context with endpoint Id and app Id provided
     */
    private _generateClientContext() {
        const { endpointId, appId } = this._config;
        const clientContext = {
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
    }
}

const instance = new AWSAnalyticsProvider();
export default instance;