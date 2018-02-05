import { ConsoleLogger as Logger, Pinpoint, MobileAnalytics, JS } from '../../Common';
import { AnalyticsProvider } from '../types';

const logger = new Logger('AWSAnalyticsProvider');

export default class AWSAnalyticsProvider {
    private _config;
    private mobileAnalytics;
    private pinpointClient;
    private _sessionId;

    constructor(config?) {
        this._config = config? config : {};
    }

    public getCategory() {
        return 'Analytics';
    }

    public configure(config) {
        logger.debug('configure Analytics');
        const conf = config? config : {};
        this._config = Object.assign({}, this._config, conf);
        return this._config;
    }

    private async _init(config) {
        logger.debug('init clients');

        this._config = Object.assign(this._config, config);
        this._initMobileAnalytics();
        return new Promise((res, rej) => {
            this._initPinpoint().then((data) => {
                res(true);
            }).catch((err) => {
                res(false);
            });
        });
    }

    public async startSession(config) {
        // credentials updated
        if (this._config.endpointId !== config.endpointId) {
            const initClients = await this._init(config);
            if (!initClients) return false;
        }

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
                    res(false);
                }
                else {
                    logger.debug('record event success. ', data);
                    res(true);
                }
            });
        });
    }

    public async stopSession(config) {
        // credentials updated
        if (this._config.endpointId !== config.endpointId) {
            const initClients = await this._init(config);
            if (!initClients) return false;
        }

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
                    res(false);
                }
                else {
                    logger.debug('record event success. ', data);
                    res(true);
                }
            });
        });
    }

    public async record(params, config) {
        // credentials updated
        if (this._config.endpointId !== config.endpointId) {
            const initClients = await this._init(config);
            if (!initClients) return false;
        }

        const { eventName, attributes, metrics } = params;
        const clientContext = this._generateClientContext();
        const eventParams = {
            clientContext,
            events: [
                {
                    eventType: eventName,
                    timestamp: new Date().toISOString(),
                    attributes,
                    metrics
                }
            ]
        };

        logger.debug('record event with params', eventParams);
        return new Promise<any>((res, rej) => {
            this.mobileAnalytics.putEvents(eventParams, (err, data) => {
                if (err) {
                    logger.debug('record event failed. ', err);
                    res(false);
                }
                else {
                    logger.debug('record event success. ', data);
                    res(true);
                }
            });
        });
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
        const { clientInfo, credentials } = this._config;
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
